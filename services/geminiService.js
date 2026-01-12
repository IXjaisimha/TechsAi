const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Default candidate models to try in order
// Latest models (2.5) are most capable; 2.0 as fallback
const DEFAULT_MODELS = [
  'gemini-2.5-pro',      // Most capable for complex analysis
  'gemini-2.5-flash',    // Faster alternative with good quality
  'gemini-2.0-flash',    // Reliable previous generation
  'gemini-1.5-pro',      // Fallback to older generation
  'gemini-1.5-flash'
];

function parseStrictJson(text) {
  if (!text || typeof text !== 'string') return null;
  const cleaned = text
    .replace(/^```json\s*|```$/g, '')
    .replace(/^```\s*|```$/g, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function runGemini(prompt, models = DEFAULT_MODELS) {
  for (const modelName of models) {
    try {
      console.log(`🔄 Attempting Gemini model: ${modelName}`);
      
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([{ text: prompt }]);
      const text = result?.response?.text?.();
      
      if (!text) {
        console.warn(`⚠️  ${modelName} returned empty response, trying next model...`);
        continue;
      }
      
      console.log(`📥 Raw Gemini response (${modelName}):`, text.substring(0, 200) + '...');
      
      const json = parseStrictJson(text);
      
      if (json) {
        console.log(`✅ Successfully parsed JSON from ${modelName}`);
        console.log(`📊 Extracted ${json.normal_skills?.length || 0} normal skills, ${json.hidden_skills?.length || 0} hidden skills`);
        return { data: json, model: modelName };
      } else {
        console.warn(`⚠️  ${modelName} returned invalid JSON, trying next model...`);
      }
    } catch (err) {
      console.error(`❌ ${modelName} failed:`, err.message);
      // continue to next model
    }
  }
  
  console.error('❌ All Gemini models failed to return valid JSON');
  return null; // indicate failure for caller to use fallback
}

module.exports = { runGemini, parseStrictJson, DEFAULT_MODELS };