const { runGemini } = require('./geminiService');

function keywordFallback(jdText = '', hiddenText = '') {
  console.warn('⚠️  WARNING: Gemini API failed, using keyword fallback');
  const baseKeywords = ['Java', 'Python', 'JavaScript', 'Node', 'React', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes'];
  const normalize = (s) => (s || '').toLowerCase();
  const has = (kw, text) => normalize(text).includes(kw.toLowerCase());

  const normal_skills = baseKeywords.filter(k => has(k, jdText)).map(k => ({
    skill_name: k,
    required_level: 'Intermediate',
    weight: 5
  }));

  const hidden_skills = baseKeywords.filter(k => has(k, hiddenText)).map(k => ({
    skill_name: k,
    importance: 7
  }));

  return {
    normal_skills,
    hidden_skills,
    experience_required: { min: 0, max: 0 },
    extraction_method: 'Fallback',
    confidence_score: 30
  };
}

function buildPrompt(jdText, hiddenText) {
  return `You are an expert AI recruitment analyst specializing in technical skill extraction and job requirement analysis. Your task is to perform a comprehensive analysis of a job description and extract both visible and hidden skill requirements.

## ROLE & CONTEXT
You are analyzing job requirements for an AI-powered recruitment matching system. Your analysis will be used to match candidates with jobs based on skill compatibility. Accuracy and comprehensiveness are critical.

## ANALYSIS INSTRUCTIONS

### 1. NORMAL SKILLS (Public - Visible to Candidates)
Extract all technical and professional skills mentioned in the job description. Include:
- **Programming Languages**: Java, Python, JavaScript, TypeScript, Go, Rust, C++, etc.
- **Frameworks & Libraries**: Spring Boot, React, Angular, Django, Flask, Node.js, Express, etc.
- **Databases**: MySQL, PostgreSQL, MongoDB, Redis, Cassandra, Oracle, etc.
- **Cloud & DevOps**: AWS, Azure, GCP, Docker, Kubernetes, CI/CD, Jenkins, GitLab, etc.
- **Tools & Technologies**: Git, REST APIs, GraphQL, Microservices, gRPC, Kafka, RabbitMQ, etc.
- **Methodologies**: Agile, Scrum, TDD, Clean Code, Design Patterns, etc.
- **Security**: OAuth2, JWT, Spring Security, SSL/TLS, encryption, etc.
- **Testing**: JUnit, Mockito, Selenium, Jest, PyTest, integration testing, etc.
- **Soft Skills**: Leadership, communication, problem-solving, team collaboration, etc.

For each skill, determine:
- **skill_name**: Clear, standardized skill name (e.g., "Spring Boot" not "spring boot framework")
- **required_level**: "Basic" (0-1 years), "Intermediate" (1-3 years), or "Advanced" (3+ years)
- **weight**: Importance score 1-10 (10 = critical/must-have, 7-9 = highly important, 4-6 = important, 1-3 = nice-to-have)

### 2. HIDDEN SKILLS (Internal - Company Use Only)
Extract implicit or subtle requirements from the "HIDDEN REQUIREMENTS" section. These are traits, qualities, or characteristics not explicitly stated in the public job description. Include:
- **Cultural Fit**: Startup mindset, corporate culture, innovation-driven, etc.
- **Leadership Traits**: Mentoring ability, decision-making, ownership, initiative, etc.
- **Work Style**: Independent worker, team player, fast learner, adaptable, etc.
- **Personal Qualities**: Attention to detail, deadline-driven, proactive, resilient, etc.
- **Domain Knowledge**: Industry-specific expertise, business acumen, etc.

For each hidden skill:
- **skill_name**: Clear trait or quality name
- **importance**: Importance score 1-10 (10 = critical for culture fit, 1 = minor preference)

### 3. EXPERIENCE REQUIREMENTS
Analyze the job description to infer:
- **min**: Minimum years of experience required (number)
- **max**: Maximum years of experience preferred (number, or null if unlimited)

## OUTPUT FORMAT
Return ONLY a valid JSON object with this exact structure. Do NOT include explanations, markdown formatting, or any text outside the JSON.

\`\`\`json
{
  "normal_skills": [
    {
      "skill_name": "Java",
      "required_level": "Advanced",
      "weight": 10
    },
    {
      "skill_name": "Spring Boot",
      "required_level": "Advanced",
      "weight": 9
    }
  ],
  "hidden_skills": [
    {
      "skill_name": "Leadership Potential",
      "importance": 8
    },
    {
      "skill_name": "Startup Mindset",
      "importance": 9
    }
  ],
  "experience_required": {
    "min": 2,
    "max": 5
  }
}
\`\`\`

## QUALITY GUIDELINES
1. Extract AT LEAST 10-20 normal skills (be comprehensive)
2. Identify 3-8 hidden skills from the hidden requirements
3. Use consistent naming conventions (proper capitalization, no abbreviations unless standard)
4. Assign weights/importance based on how frequently and prominently mentioned
5. Differentiate between "must-have" (weight 8-10) and "nice-to-have" (weight 3-5)
6. Infer proficiency level from context (e.g., "expert in Java" = Advanced, "basic knowledge" = Basic)

---

## JOB DESCRIPTION (Public):
${jdText}

---

## HIDDEN REQUIREMENTS (Internal Company Use Only):
${hiddenText || 'None specified'}

---

NOW ANALYZE AND RETURN ONLY THE JSON OUTPUT:`;
}

async function analyzeJD(jdText, hiddenText) {
  console.log('🤖 Calling Gemini AI for job analysis...');
  
  const prompt = buildPrompt(jdText, hiddenText);
  const result = await runGemini(prompt);
  
  if (!result) {
    console.error('❌ Gemini AI failed to return valid JSON, using fallback');
    return keywordFallback(jdText, hiddenText);
  }
  
  console.log(`✅ Gemini AI (${result.model}) analysis successful`);
  
  const data = result.data;
  return {
    normal_skills: Array.isArray(data.normal_skills) ? data.normal_skills : [],
    hidden_skills: Array.isArray(data.hidden_skills) ? data.hidden_skills : [],
    experience_required: data.experience_required || { min: 0, max: 0 },
    extraction_method: 'Gemini_AI',
    confidence_score: 95,
    ai_model_version: result.model
  };
}

module.exports = { analyzeJD };