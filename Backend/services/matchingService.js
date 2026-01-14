const { runGemini } = require('./geminiService');

function ruleMatch(resume, jobNormal, jobHidden, jobDetails = {}) {
  console.warn('⚠️  WARNING: Using rule-based matching fallback');

  const resumeSkills = (resume.skills || []).map(s => String(s.skill_name || '').toLowerCase());
  const normal = (jobNormal || []).map(s => ({ name: String(s.skill_name || '').toLowerCase(), weight: s.weight || 5, required_level: s.required_level }));
  const hidden = (jobHidden || []).map(s => ({ name: String(s.skill_name || '').toLowerCase(), importance: s.importance || 7 }));

  // Technical skills score
  let normalScore = 0, normalTotal = 0;
  const matched = [], missing = [];

  for (const s of normal) {
    normalTotal += s.weight;
    if (resumeSkills.includes(s.name)) {
      normalScore += s.weight;
      matched.push({ skill_name: s.name, weight: s.weight });
    } else {
      missing.push({ skill_name: s.name, importance: s.weight >= 7 ? 'High' : 'Medium', is_critical: s.weight >= 8 });
    }
  }
  const technical_skills_score = normalTotal ? Math.round((normalScore / normalTotal) * 100) : 0;

  // Hidden criteria score
  let hiddenScore = 0, hiddenTotal = 0;
  for (const s of hidden) {
    hiddenTotal += s.importance;
    if (resumeSkills.includes(s.name)) hiddenScore += s.importance;
  }
  const hidden_criteria_score = hiddenTotal ? Math.round((hiddenScore / hiddenTotal) * 100) : 0;

  // Experience score
  const expYears = resume.experience_years || 0;
  const expReqMin = jobDetails.experience_min || 0;
  const expReqMax = jobDetails.experience_max || 10;
  let experience_score = 0;
  if (expYears >= expReqMin && expYears <= expReqMax) {
    experience_score = 100;
  } else if (expYears < expReqMin) {
    experience_score = Math.max(0, Math.round((expYears / expReqMin) * 70));
  } else {
    experience_score = 80; // Overqualified but not penalized much
  }

  // Calculate Dual Scores
  // Admin: Tech 40%, Exp 20%, Edu 10%, Hidden 30%
  // Public: Tech 60%, Exp 30%, Edu 10%

  // Baselines for fallback
  const eduScore = 60; // Default if fallback

  const admin_score = Math.round(
    (technical_skills_score * 0.40) +
    (experience_score * 0.20) +
    (eduScore * 0.10) +
    (hidden_criteria_score * 0.30)
  );

  const public_score = Math.round(
    (technical_skills_score * 0.60) +
    (experience_score * 0.30) +
    (eduScore * 0.10)
  );

  return {
    overall_score: admin_score,
    public_score: public_score,
    match_grade,
    scoring_breakdown: {
      technical_skills_score,
      soft_skills_score: 50,
      experience_score,
      education_score: 60,
      hidden_criteria_score
    },
    matched_skills: matched.map(m => ({
      skill_name: m.skill_name,
      match_strength: 80
    })),
    missing_skills: missing,
    ai_insights: {
      strengths: matched.slice(0, 5).map(m => `Has ${m.skill_name}`),
      weaknesses: missing.slice(0, 3).map(m => `Missing ${m.skill_name}`),
      recommendations: ['Consider additional skill development'],
      red_flags: [],
      unique_selling_points: []
    },
    extraction_method: 'Fallback',
    confidence_score: 60
  };
}

function buildPrompt(resumeData, jobSkills, hiddenSkills, jobDetails) {
  return `You are an expert AI recruitment analyst specializing in resume-to-job matching and candidate evaluation. Your analysis will determine if a candidate is a good fit for a specific role.

## ROLE & CONTEXT
You are analyzing a candidate's resume against specific job requirements to generate a comprehensive matching score and detailed insights. Your analysis will be used by hiring managers to make informed decisions.

## INPUT DATA

### CANDIDATE RESUME:
${JSON.stringify(resumeData, null, 2)}

### JOB REQUIREMENTS (Technical Skills - Public):
${JSON.stringify(jobSkills, null, 2)}

### HIDDEN REQUIREMENTS (Cultural/Soft Skills - Internal):
${JSON.stringify(hiddenSkills, null, 2)}

### JOB DETAILS:
- Experience Required: ${jobDetails.experience_min || 0}-${jobDetails.experience_max || 10} years
- Employment Type: ${jobDetails.employment_type || 'FULL_TIME'}
- Work Mode: ${jobDetails.work_mode || 'HYBRID'}
- Location: ${jobDetails.job_location || 'Not specified'}

## ANALYSIS INSTRUCTIONS

### 1. OVERALL SCORE (0-100)
Calculate a weighted overall match score based on:
- **Technical Skills Match (50%)**: How well candidate's technical skills align with requirements
- **Hidden Criteria Match (25%)**: Cultural fit, soft skills, work style alignment
- **Experience Match (15%)**: Years of experience vs requirements
- **Education Match (10%)**: Relevant education and certifications

### 2. MATCH GRADE
Assign one of: "Excellent" (80-100), "Good" (65-79), "Fair" (50-64), "Poor" (0-49)

### 3. SCORING BREAKDOWN
Provide detailed scores for each category (0-100):
- **technical_skills_score**: Match percentage for programming languages, frameworks, tools
- **soft_skills_score**: Communication, leadership, teamwork, problem-solving
- **experience_score**: Relevant work experience alignment
- **education_score**: Educational qualifications relevance
- **hidden_criteria_score**: Cultural fit and internal requirements match

### 4. MATCHED SKILLS
List all skills from job requirements that the candidate possesses:
- skill_name: Exact skill name
- resume_proficiency: Candidate's proficiency level
- required_proficiency: Job's required proficiency
- match_strength: 0-100 (how well they match)
- is_hidden: true if from hidden requirements

### 5. MISSING SKILLS
List critical skills the candidate lacks:
- skill_name: Missing skill
- importance: "Critical", "High", "Medium", "Low"
- category: "Technical", "Soft", "Tool", etc.
- is_critical: true if must-have for role

### 6. EXTRA SKILLS
List valuable skills candidate has beyond requirements:
- skill_name: Additional skill
- value_add_score: 1-10 (how valuable for this role)

### 7. AI INSIGHTS
Provide strategic hiring insights:
- **strengths**: Top 3-5 strongest qualifications
- **weaknesses**: Top 3-5 areas of concern
- **recommendations**: Specific interview focus areas or development suggestions
- **red_flags**: Any concerns (gaps, inconsistencies, overqualification, etc.)
- **unique_selling_points**: What makes this candidate stand out

### 8. HIDDEN MATCH ANALYSIS (Internal Only)
Evaluate cultural/strategic fit:
- **cultural_fit_score**: 0-100 alignment with company culture
- **strategic_alignment_score**: 0-100 alignment with strategic goals
- **internal_notes**: Observations for hiring committee
- **flags**: Any concerns for internal discussion

## OUTPUT FORMAT
Return ONLY valid JSON with this exact structure. Do NOT include explanations or markdown.

\`\`\`json
{
  "overall_score": 85,
  "match_grade": "Excellent",
  "scoring_breakdown": {
    "technical_skills_score": 90,
    "soft_skills_score": 75,
    "experience_score": 85,
    "education_score": 80,
    "hidden_criteria_score": 88
  },
  "matched_skills": [
    {
      "skill_name": "Java",
      "resume_proficiency": "Advanced",
      "required_proficiency": "Advanced",
      "match_strength": 95,
      "is_hidden": false
    }
  ],
  "missing_skills": [
    {
      "skill_name": "Kubernetes",
      "importance": "Medium",
      "category": "DevOps",
      "is_critical": false
    }
  ],
  "extra_skills": [
    {
      "skill_name": "Machine Learning",
      "value_add_score": 7
    }
  ],
  "ai_insights": {
    "strengths": [
      "Strong Java and Spring Boot expertise with 4 years experience",
      "Proven track record in microservices architecture"
    ],
    "weaknesses": [
      "Limited Kubernetes experience",
      "No mention of testing frameworks"
    ],
    "recommendations": [
      "Ask about microservices deployment strategies in interview",
      "Assess willingness to learn Kubernetes"
    ],
    "red_flags": [],
    "unique_selling_points": [
      "Has leadership experience mentioned in hidden requirements"
    ]
  },
  "hidden_match_analysis": {
    "cultural_fit_score": 85,
    "strategic_alignment_score": 90,
    "internal_notes": [
      "Demonstrates startup mindset through side projects",
      "Shows leadership potential in past roles"
    ],
    "flags": []
  }
}
\`\`\`

NOW ANALYZE AND RETURN ONLY THE JSON OUTPUT:`;
}

async function matchResumeToJob(resumeData, jobSkills, hiddenSkills, jobDetails = {}) {
  console.log('🤖 Starting AI-powered resume-to-job matching...');
  const startTime = Date.now();

  const prompt = buildPrompt(resumeData, jobSkills, hiddenSkills, jobDetails);
  const result = await runGemini(prompt);

  if (!result) {
    console.error('❌ Gemini AI failed, using rule-based fallback');
    const fallback = ruleMatch(resumeData, jobSkills, hiddenSkills, jobDetails);
    return {
      ...fallback,
      processing_time_ms: Date.now() - startTime,
      ai_model_version: 'Fallback'
    };
  }

  console.log(`✅ Gemini AI (${result.model}) matching complete`);

  /* 
     CALCULATE SCORES 
     Recalculate locally to ensure consistency between Public and Admin views.
  */
  const aiJson = result.data;
  const scores = aiJson.scoring_breakdown || {};
  const tech = Number(scores.technical_skills_score) || 0;
  const soft = Number(scores.soft_skills_score) || 0; // Public soft skills
  const exp = Number(scores.experience_score) || 0;
  const edu = Number(scores.education_score) || 0;
  const hidden = Number(scores.hidden_criteria_score) || 0;

  // 1. Admin Score (Includes Hidden Criteria)
  // Weights: Tech 40%, Exp 20%, Edu 10%, Hidden 30%
  const admin_score = Math.round(
    (tech * 0.40) +
    (exp * 0.20) +
    (edu * 0.10) +
    (hidden * 0.30)
  );

  // 2. Public Score (Excludes Hidden Criteria)
  // Weights: Tech 60%, Exp 30%, Edu 10%
  const public_score = Math.round(
    (tech * 0.60) +
    (exp * 0.30) +
    (edu * 0.10)
  );

  return {
    overall_score: admin_score, // Admin sees this by default as "Overall"
    public_score: public_score, // Users see this
    match_grade: aiJson.match_grade || 'Fair',
    scoring_breakdown: aiJson.scoring_breakdown || {},
    matched_skills: Array.isArray(aiJson.matched_skills) ? aiJson.matched_skills : [],
    missing_skills: Array.isArray(aiJson.missing_skills) ? aiJson.missing_skills : [],
    extra_skills: Array.isArray(aiJson.extra_skills) ? aiJson.extra_skills : [],
    ai_insights: aiJson.ai_insights || { strengths: [], weaknesses: [], recommendations: [], red_flags: [], unique_selling_points: [] },
    hidden_match_analysis: aiJson.hidden_match_analysis || {},
    extraction_method: 'Gemini_AI',
    confidence_score: 95,
    ai_model_version: result.model,
    processing_time_ms: Date.now() - startTime
  };
}

module.exports = { matchResumeToJob, ruleMatch };