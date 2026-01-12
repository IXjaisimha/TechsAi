/**
 * Test Gemini API Connection and Resume Analysis
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  console.log('🔍 Testing Gemini API...');
  console.log(`API Key: ${process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Missing'}`);
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Analyze this resume and extract structured information in JSON format.

Resume Text:
Kothari Jaisimha
Full Stack Developer
5 years of experience in Java, Spring Boot, React, Node.js, MySQL, MongoDB, Docker, AWS
Education: B.Tech in Computer Science
Led team of 5 developers

Return ONLY valid JSON with this exact structure:
{
  "skills": [
    {
      "skill_name": "Java",
      "proficiency_level": "Advanced",
      "years_of_experience": 5,
      "category": "Technical"
    }
  ],
  "education": ["B.Tech in Computer Science"],
  "experience_years": 5,
  "confidence_score": 90
}`;

    console.log('\n🤖 Sending request to Gemini...');
    const result = await model.generateContent([{ text: prompt }]);
    const response = result.response.text();
    
    console.log('\n✅ Gemini Response:');
    console.log(response);
    
    // Try to parse JSON
    const cleaned = response.replace(/^```json\s*|```$/g, '').trim();
    const parsed = JSON.parse(cleaned);
    
    console.log('\n✅ Parsed JSON:');
    console.log(JSON.stringify(parsed, null, 2));
    
    console.log(`\n✅ Found ${parsed.skills.length} skills!`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('API key')) {
      console.error('🔑 Check your GEMINI_API_KEY in .env file');
    }
  }
}

testGemini();
