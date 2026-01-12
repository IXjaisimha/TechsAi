/**
 * AI Extraction Service
 * Gemini AI-powered with regex fallback
 */

const fs = require("fs");
const pdfParse = require("pdf-parse");
const { runGemini } = require("./geminiService");

/* ==============================
   PDF TEXT EXTRACTION
================================ */
const extractTextFromPDF = async (filePath) => {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);

  if (!data.text || !data.text.trim()) {
    throw new Error("PDF contains no readable text");
  }

  console.log(`✅ PDF parsed: ${data.numpages} pages`);
  return data.text;
};

/* ==============================
   SKILL EXTRACTION (REGEX)
================================ */
const SKILL_PATTERNS = {
  Java: /\bjava\b/i,
  "Spring Boot": /\bspring boot\b/i,
  JavaScript: /\bjavascript|js\b/i,
  React: /\breact\b/i,
  NodeJS: /\bnode\.?js\b/i,
  MySQL: /\bmysql\b/i,
  MongoDB: /\bmongo(db)?\b/i,
  Docker: /\bdocker\b/i,
  AWS: /\baws\b/i,
};

const extractSkills = (text) => {
  const skills = [];

  for (const [skill, regex] of Object.entries(SKILL_PATTERNS)) {
    if (regex.test(text)) {
      skills.push({
        skill_name: skill,
        proficiency_level: "Intermediate",
        years_of_experience: 0,
        category: "Technical",
      });
    }
  }

  return skills;
};

/* ==============================
   EDUCATION EXTRACTION
================================ */
const extractEducation = (text) => {
  const matches = text.match(
    /\b(b\.?tech|b\.?e\.?|m\.?tech|m\.?e\.?|mba|phd)\b/gi
  );
  return matches ? [...new Set(matches)] : ["Not specified"];
};

/* ==============================
   EXPERIENCE EXTRACTION
================================ */
const extractExperience = (text) => {
  const match = text.match(/(\d+)\+?\s*(years?|yrs?)/i);
  return match ? parseInt(match[1]) : 0;
};

/* ==============================
   GEMINI AI EXTRACTION
================================ */
const extractWithGemini = async (text) => {
  const prompt = `Analyze this resume and extract structured information in JSON format.

Resume Text:
${text}

Return ONLY valid JSON with this exact structure:
{
  "skills": [
    {
      "skill_name": "Java",
      "proficiency_level": "Advanced|Intermediate|Beginner",
      "years_of_experience": 3,
      "category": "Technical|Soft|Management"
    }
  ],
  "education": ["B.Tech in Computer Science", "MBA"],
  "experience_years": 5,
  "confidence_score": 85
}

Rules:
- Extract ALL technical skills, tools, frameworks, languages mentioned
- Infer proficiency from context (projects, years, leadership roles)
- Calculate total years of professional experience
- Set confidence_score (0-100) based on resume clarity
- Return empty arrays if nothing found, not null`;

  const result = await runGemini(prompt);
  return result;
};

/* ==============================
   MAIN EXTRACTION FUNCTION
================================ */
const extractFromResume = async (filePath) => {
  console.log("🔍 Starting resume extraction...");

  const text = await extractTextFromPDF(filePath);

  // Try Gemini AI first (if API key is valid)
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 20) {
    console.log("🤖 Attempting Gemini AI analysis...");
    try {
      const geminiResult = await extractWithGemini(text);

      if (geminiResult && geminiResult.data) {
        console.log(`✅ Gemini AI extraction completed (Model: ${geminiResult.model})`);
        
        return {
          skills: geminiResult.data.skills || [],
          education: geminiResult.data.education || ["Not specified"],
          experience_years: geminiResult.data.experience_years || 0,
          confidence_score: geminiResult.data.confidence_score || 85,
          extraction_method: `AI (${geminiResult.model})`,
          extracted_at: new Date(),
          raw_text_preview: text.substring(0, 200),
        };
      }
    } catch (error) {
      console.log(`⚠️ Gemini error: ${error.message}`);
    }
  }

  // Fallback to regex-based extraction
  console.log("⚠️ Using regex-based extraction...");
  const extractedData = {
    skills: extractSkills(text),
    education: extractEducation(text),
    experience_years: extractExperience(text),
    confidence_score: 70,
    extraction_method: "Regex",
    extracted_at: new Date(),
    raw_text_preview: text.substring(0, 200),
  };

  console.log("✅ Resume extraction completed (Regex)");
  return extractedData;
};

module.exports = {
  extractFromResume,
  extractTextFromPDF,
};
