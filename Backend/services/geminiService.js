const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Using OpenRouter for AI models
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SITE_URL = process.env.SITE_URL || 'http://localhost:3000';
const SITE_NAME = process.env.SITE_NAME || 'TechsAI';

// Default candidate models for OpenRouter fallback
const DEFAULT_MODELS = [
  'openrouter/auto', // Smart router
  'google/gemini-2.0-flash-001', // Standard non-free but high priority if they have balance
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-2-9b-it:free',
  'meta-llama/llama-3.1-8b-instruct:free',
  'mistralai/mistral-7b-instruct:free'
];

function parseStrictJson(text) {
  if (!text || typeof text !== 'string') return null;

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {}
  }

  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

/**
 * Run AI extraction using native Google Gemini SDK (Fastest & most reliable)
 */
async function runNativeGemini(prompt) {
  if (!GEMINI_API_KEY) return null;

  try {
    console.log(`🔄 Attempting AI model (Native Gemini SDK): gemini-2.0-flash`);
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    if (!text) return null;

    const json = parseStrictJson(text);
    if (json) {
      console.log(`✅ Successfully parsed JSON from Native Gemini`);
      return { data: json, model: 'gemini-2.0-flash (Native)' };
    }
  } catch (err) {
    console.error(`❌ Native Gemini SDK failed:`, err.message);
  }
  return null;
}

/**
 * Run AI extraction with OpenRouter fallback
 */
async function runGemini(prompt, models = DEFAULT_MODELS) {
  // 1. Try Native Gemini first if key is available
  const nativeResult = await runNativeGemini(prompt);
  if (nativeResult) return nativeResult;

  // 2. Fallback to OpenRouter
  if (!OPENROUTER_API_KEY) {
    console.error('❌ Missing both GEMINI_API_KEY and OPENROUTER_API_KEY');
    return null;
  }

  for (const modelName of models) {
    try {
      console.log(`🔄 Attempting AI model (OpenRouter Fallback): ${modelName}`);

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: modelName,
          messages: [{ role: "user", content: prompt }]
        },
        {
          timeout: 60000,
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": SITE_URL,
            "X-Title": SITE_NAME,
            "Content-Type": "application/json"
          }
        }
      );

      const text = response.data.choices?.[0]?.message?.content;
      if (!text) continue;

      const json = parseStrictJson(text);
      if (json) {
        console.log(`✅ Successfully parsed JSON from ${modelName} (OpenRouter)`);
        return { data: json, model: modelName };
      }
    } catch (err) {
      console.error(`❌ ${modelName} (OpenRouter) failed:`, err.message);
    }
  }

  console.error('❌ All AI models failed');
  return null;
}

module.exports = { runGemini, parseStrictJson, DEFAULT_MODELS };