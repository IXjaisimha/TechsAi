const axios = require('axios');

// Using OpenRouter for AI models
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const SITE_NAME = process.env.SITE_NAME || 'TechsAI';

// Default candidate models to try in order
// Default candidate models to try in order
// Default candidate models to try in order (User Specified Free Stack)
const DEFAULT_MODELS = [
  // 🥇 Primary Stack (Reasoning + Stability)
  'tngtech/deepseek-r1t2-chimera:free', // Good reasoning
  'meta-llama/llama-3.3-70b-instruct:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',

  // 🟡 Secondary / Lightweight Stack (Valid Free Models)
  'google/gemini-2.0-flash-exp:free', // Fast & Capable
  'meta-llama/llama-3.2-11b-vision-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',

  // 🛡️ Safety Fallback 
  'google/gemini-exp-1206:free'
];

function parseStrictJson(text) {
  if (!text || typeof text !== 'string') return null;

  // 1. Try generic JSON regex extraction (finds the largest {} block)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Continue to try other cleanup methods if this fails
    }
  }

  // 2. Try removing markdown code blocks explicitly (if regex missed or was too greedy/wrong)
  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse failed. Original:", text.substring(0, 50) + "...");
    console.error("Cleaned attempt:", cleaned.substring(0, 50) + "...");
    return null;
  }
}

async function runGemini(prompt, models = DEFAULT_MODELS) {
  // Ensure we have a key
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ Missing OPENROUTER_API_KEY in environment variables');
    return null;
  }

  for (const modelName of models) {
    try {
      console.log(`🔄 Attempting AI model (OpenRouter): ${modelName}`);

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: modelName,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        },
        {
          timeout: 300000, // 300 seconds (5 minutes) timeout to allow for reasoning models
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "HTTP-Referer": SITE_URL,
            "X-Title": SITE_NAME,
            "Content-Type": "application/json"
          }
        }
      );

      // Extract text from OpenRouter/OpenAI format
      const text = response.data.choices?.[0]?.message?.content;

      if (!text) {
        console.warn(`⚠️  ${modelName} returned empty response, trying next model...`);
        continue;
      }

      console.log(`📥 Raw AI response (${modelName}):`, text.substring(0, 200) + '...');

      const json = parseStrictJson(text);

      if (json) {
        console.log(`✅ Successfully parsed JSON from ${modelName}`);
        // Log lengths if available to confirm data structure
        if (json.normal_skills || json.hidden_skills) {
          console.log(`📊 Extracted ${json.normal_skills?.length || 0} normal skills, ${json.hidden_skills?.length || 0} hidden skills`);
        } else if (json.skills) {
          console.log(`📊 Extracted ${json.skills?.length || 0} resume skills`);
        }

        return { data: json, model: modelName };
      } else {
        console.warn(`⚠️  ${modelName} returned invalid JSON, trying next model...`);
      }
    } catch (err) {
      console.error(`❌ ${modelName} failed:`, err.response?.data || err.message);
      // continue to next model
    }
  }

  console.error('❌ All AI models failed to return valid JSON');
  return null; // indicate failure for caller to use fallback
}

module.exports = { runGemini, parseStrictJson, DEFAULT_MODELS };