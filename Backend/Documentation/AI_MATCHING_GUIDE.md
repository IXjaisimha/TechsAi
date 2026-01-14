# AI Resume-to-Job Matching Guide

## Overview
This system uses **Gemini 2.5-pro AI** to intelligently match resumes with job requirements, providing comprehensive scoring, insights, and recommendations for hiring decisions.

---

## Complete Workflow

### 1. **Create Job** (MySQL)
```http
POST /api/admin/jobs
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "job_title": "Backend Developer",
  "job_description": "Java Backend Developer with Spring Boot – Built-in Points : Design, develop, and maintain backend applications using Java and Spring Boot. Build and expose RESTful APIs for web and mobile applications. Implement business logic using Spring MVC and Spring Boot architecture. Integrate applications with relational databases using Spring Data JPA / Hibernate. Design efficient database schemas and write optimized SQL queries. Implement authentication and authorization using Spring Security, JWT, and OAuth2. Ensure application security against common vulnerabilities (SQL Injection, XSS, CSRF). Develop and manage microservices-based architectures. Implement inter-service communication using REST APIs / Feign Clients. Handle exception management, logging, and validation mechanisms. Write unit and integration tests using JUnit and Mockito. Follow coding standards, best practices, and clean code principles. Use Git for version control and collaborate with team members",
  "hidden_requirements": "Leadership potential, startup mindset, fast learner",
  "employment_type": "FULL_TIME",
  "work_mode": "HYBRID",
  "experience_min": 1,
  "experience_max": 4,
  "job_location": "Hyderabad",
  "department": "Engineering",
  "openings": 3,
  "application_deadline": "2026-02-28"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "job_id": 3,
    "job_title": "Backend Developer",
    "hidden_requirements": "Leadership potential, startup mindset, fast learner",
    ...
  },
  "next_step": "To extract skills, call: POST /api/job-analysis/3/analyze"
}
```

---

### 2. **Extract Job Skills with AI** (MongoDB)
```http
POST /api/job-analysis/3/analyze
```

**Response:**
```json
{
  "success": true,
  "message": "Job analyzed successfully using Gemini AI",
  "data": {
    "job_id": 3,
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
      },
      {
        "skill_name": "REST API",
        "required_level": "Intermediate",
        "weight": 8
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
    "ai_generated": true,
    "confidence_score": 95
  },
  "analysis_summary": {
    "normal_skills_count": 15,
    "hidden_skills_count": 3,
    "extraction_method": "Gemini_AI",
    "confidence_score": 95,
    "ai_model": "gemini-2.5-pro"
  }
}
```

---

### 3. **Upload Resume** (MySQL + File System)
```http
POST /api/resumes
Authorization: Bearer USER_TOKEN
Content-Type: multipart/form-data

resume: [FILE]
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resume_id": 5,
    "file_name": "john_doe_resume.pdf",
    "user_id": 2
  },
  "next_step": "Extract skills: POST /api/resumes/5/extract-skills"
}
```

---

### 4. **Extract Resume Skills with AI** (MongoDB)
```http
POST /api/resumes/5/extract-skills
Authorization: Bearer USER_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Resume skills extracted using AI",
  "data": {
    "resume_id": 5,
    "skills": [
      {
        "skill_name": "Java",
        "proficiency_level": "Advanced",
        "years_of_experience": 4,
        "category": "Technical"
      },
      {
        "skill_name": "Spring Boot",
        "proficiency_level": "Intermediate",
        "years_of_experience": 2,
        "category": "Framework"
      }
    ],
    "ai_generated": true,
    "confidence_score": 92
  }
}
```

---

### 5. **Run AI Matching** (MongoDB - AIMatchResult)
```http
POST /api/admin/match/resume/5/job/3
Authorization: Bearer ADMIN_TOKEN
```

**What Happens:**
1. ✅ Fetches resume data (MySQL + MongoDB skills)
2. ✅ Fetches job requirements (MySQL + MongoDB skills)
3. 🤖 **Gemini AI analyzes** and scores the match
4. 💾 Saves comprehensive results to MongoDB
5. 📊 Returns detailed match analysis

**Response:**
```json
{
  "success": true,
  "message": "AI matching completed successfully",
  "data": {
    "application_id": 7,
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
      },
      {
        "skill_name": "Spring Boot",
        "resume_proficiency": "Intermediate",
        "required_proficiency": "Advanced",
        "match_strength": 75,
        "is_hidden": false
      }
    ],
    
    "missing_skills": [
      {
        "skill_name": "Kubernetes",
        "importance": "Medium",
        "category": "DevOps",
        "is_critical": false
      },
      {
        "skill_name": "Mockito",
        "importance": "High",
        "category": "Testing",
        "is_critical": true
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
        "Proven track record in microservices architecture",
        "Solid understanding of REST API design"
      ],
      "weaknesses": [
        "Limited Kubernetes experience",
        "No mention of testing frameworks like Mockito",
        "Lacks OAuth2 implementation experience"
      ],
      "recommendations": [
        "Ask about microservices deployment strategies in interview",
        "Assess willingness to learn Kubernetes",
        "Evaluate testing practices and code quality standards"
      ],
      "red_flags": [],
      "unique_selling_points": [
        "Has leadership experience mentioned in hidden requirements",
        "Demonstrates startup mindset through side projects"
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
    },
    
    "confidence_score": 95,
    "ai_model_version": "gemini-2.5-pro",
    "processing_time_ms": 3450,
    
    "candidate": {
      "name": "John Doe",
      "email": "john@example.com",
      "resume_file": "john_doe_resume.pdf"
    },
    
    "job": {
      "title": "Backend Developer",
      "location": "Hyderabad",
      "work_mode": "HYBRID"
    }
  }
}
```

---

## Admin Endpoints

### 6. **View All Matches for a Job**
```http
GET /api/admin/jobs/3/matches?min_score=60&sort=-overall_score&limit=50
Authorization: Bearer ADMIN_TOKEN
```

**Query Parameters:**
- `min_score` (default: 0) - Minimum match score filter
- `sort` (default: '-overall_score') - Sort by score descending
- `limit` (default: 50) - Maximum results

**Response:**
```json
{
  "success": true,
  "job_id": 3,
  "count": 3,
  "data": [
    {
      "application_id": 7,
      "resume_id": 5,
      "overall_score": 85,
      "match_grade": "Excellent",
      "scoring_breakdown": {
        "technical_skills_score": 90,
        "soft_skills_score": 75,
        "experience_score": 85,
        "education_score": 80,
        "hidden_criteria_score": 88
      },
      "matched_skills_count": 12,
      "missing_skills_count": 3,
      "ai_insights": {
        "strengths": ["Strong Java expertise", "Microservices experience"],
        "weaknesses": ["Limited Kubernetes", "No Mockito"],
        "recommendations": ["Interview focus on testing practices"]
      },
      "confidence_score": 95,
      "analyzed_at": "2026-01-08T10:30:00.000Z",
      "candidate": {
        "user_id": 2,
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "resume_file": "john_doe_resume.pdf"
      },
      "application_status": "APPLIED"
    },
    {
      "application_id": 8,
      "resume_id": 6,
      "overall_score": 72,
      "match_grade": "Good",
      ...
    }
  ]
}
```

---

### 7. **View Detailed Match for Specific Application**
```http
GET /api/admin/match/7
Authorization: Bearer ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "application": {
      "application_id": 7,
      "status": "APPLIED",
      "applied_at": "2026-01-08T10:00:00.000Z"
    },
    
    "candidate": {
      "user_id": 2,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "resume_file": "john_doe_resume.pdf",
      "resume_id": 5,
      "all_skills": [
        {
          "skill_name": "Java",
          "proficiency_level": "Advanced",
          "years_of_experience": 4,
          "category": "Technical"
        },
        ...
      ]
    },
    
    "job": {
      "job_id": 3,
      "title": "Backend Developer",
      "location": "Hyderabad",
      "work_mode": "HYBRID",
      "employment_type": "FULL_TIME",
      "experience_required": "1-4 years",
      "required_skills": [
        {
          "skill_name": "Java",
          "required_level": "Advanced",
          "weight": 10
        },
        ...
      ],
      "hidden_requirements": [
        {
          "skill_name": "Leadership Potential",
          "importance": 8
        },
        ...
      ]
    },
    
    "match": {
      "overall_score": 85,
      "match_grade": "Excellent",
      "scoring_breakdown": { ... },
      "matched_skills": [ ... ],
      "missing_skills": [ ... ],
      "extra_skills": [ ... ],
      "ai_insights": { ... },
      "hidden_match_analysis": {
        "cultural_fit_score": 85,
        "strategic_alignment_score": 90,
        "internal_notes": [
          "Demonstrates startup mindset through side projects",
          "Shows leadership potential in past roles"
        ],
        "flags": []
      },
      "confidence_score": 95,
      "ai_model_version": "gemini-2.5-pro",
      "processing_time_ms": 3450,
      "analyzed_at": "2026-01-08T10:30:00.000Z"
    }
  }
}
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        ADMIN ACTIONS                         │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   1. Create Job  │───▶│ 2. Analyze JD    │───▶│ 3. Upload Resume │
│   (MySQL)        │    │ (Gemini AI +     │    │ (MySQL + Files)  │
│                  │    │  MongoDB)        │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────┐
                                              │ 4. Extract Skills│
                                              │ (Gemini AI +     │
                                              │  MongoDB)        │
                                              └──────────────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────────────┐
                                              │ 5. RUN AI MATCHING       │
                                              │ POST /api/admin/match/   │
                                              │       resume/X/job/Y     │
                                              └──────────────────────────┘
                                                         │
                ┌────────────────────────────────────────┼────────────────────────────────────────┐
                ▼                                        ▼                                        ▼
    ┌────────────────────┐              ┌─────────────────────────┐              ┌──────────────────────┐
    │ Fetch Resume Data  │              │  Fetch Job Requirements │              │  Create Application  │
    │ (MySQL + MongoDB)  │              │  (MySQL + MongoDB)      │              │  (MySQL)             │
    └────────────────────┘              └─────────────────────────┘              └──────────────────────┘
                │                                     │                                        │
                └─────────────────────────────────────┼────────────────────────────────────────┘
                                                      ▼
                                          ┌──────────────────────┐
                                          │   GEMINI 2.5-PRO AI  │
                                          │   Comprehensive      │
                                          │   Match Analysis     │
                                          └──────────────────────┘
                                                      │
                                                      ▼
                                          ┌──────────────────────┐
                                          │ Save to MongoDB      │
                                          │ AIMatchResult        │
                                          │ Collection           │
                                          └──────────────────────┘
                                                      │
                ┌────────────────────────────────────┼────────────────────────────────────────┐
                ▼                                    ▼                                        ▼
    ┌────────────────────┐          ┌────────────────────────┐          ┌──────────────────────┐
    │ View Job Matches   │          │ View Match Details     │          │ Update Application   │
    │ GET /jobs/X/matches│          │ GET /match/X           │          │ Status (Shortlist/   │
    │                    │          │                        │          │ Reject)              │
    └────────────────────┘          └────────────────────────┘          └──────────────────────┘
```

---

## Key Features

### 🤖 **Gemini 2.5-Pro AI Analysis**
- Comprehensive skill matching with proficiency levels
- Cultural fit and hidden requirements evaluation
- Strategic insights and hiring recommendations
- Red flag detection
- Unique selling point identification

### 📊 **Detailed Scoring**
- **Technical Skills** (50% weight)
- **Hidden Criteria** (25% weight) - Leadership, cultural fit
- **Experience** (15% weight)
- **Education** (10% weight)

### 🎯 **Match Grades**
- **Excellent** (80-100): Strong fit, priority candidate
- **Good** (65-79): Solid match, worth interviewing
- **Fair** (50-64): Potential fit with gaps
- **Poor** (0-49): Not recommended

### 🔐 **Admin-Only Features**
- View hidden match analysis
- Access cultural fit scores
- See strategic alignment metrics
- Review internal notes and flags

---

## Testing Workflow

```bash
# 1. Login as admin
POST /api/auth/admin/login
Body: {"email": "admin@example.com", "password": "Admin@123"}
# → Get token

# 2. Create job
POST /api/admin/jobs (with token)

# 3. Analyze job
POST /api/job-analysis/3/analyze

# 4. Upload resume (as user)
POST /api/resumes (with user token)

# 5. Extract resume skills
POST /api/resumes/5/extract-skills

# 6. Run AI matching (as admin)
POST /api/admin/match/resume/5/job/3 (with admin token)

# 7. View results
GET /api/admin/jobs/3/matches
GET /api/admin/match/7
```

---

## MongoDB Collections

### **AIMatchResult**
Stores comprehensive AI analysis results including:
- Overall scores and grades
- Detailed scoring breakdowns
- Matched, missing, and extra skills
- AI insights (strengths, weaknesses, recommendations)
- Hidden match analysis (admin only)
- Confidence scores and metadata

---

## Error Handling

### Common Errors:
- **404**: Resume/Job not found
- **400**: Skills not extracted yet (run extraction first)
- **401**: Unauthorized (admin token required)
- **500**: AI matching failed (falls back to rule-based)

---

## Performance
- Average processing time: **3-5 seconds** per match
- Uses Gemini 2.5-pro for highest accuracy
- Fallback to rule-based if AI fails
- Results cached in MongoDB for instant retrieval
