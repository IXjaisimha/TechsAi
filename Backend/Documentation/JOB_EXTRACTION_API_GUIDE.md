# Job Skills Extraction API Guide

## Overview
The Job Skills Extraction system uses AI (Gemini 2.5) to automatically extract both **public (normal)** and **hidden (internal)** skills from job descriptions. Data is stored in MongoDB for flexible skill matching.

---

## API Endpoints

### 1. **Analyze & Extract Job Skills (AI-Powered)**
Analyzes a job description and extracts both normal and hidden skills automatically using Gemini AI.

```http
POST /api/job-analysis/:job_id/analyze
Content-Type: application/json

{
  "job_description": "We are looking for a Java developer with Spring Boot experience...",
  "hidden_requirements": "Must have experience working in fast-paced startups..."  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "job_id": 1,
    "normal_skills": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "skill_name": "Java",
        "importance": "Required",
        "min_years": 3,
        "category": "Technical",
        "weight": 8
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "skill_name": "Spring Boot",
        "importance": "Required",
        "min_years": 2,
        "category": "Framework",
        "weight": 8
      }
    ],
    "hidden_skills": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "skill_name": "Startup Mindset",
        "reason": "Internal cultural requirement",
        "importance": "Critical",
        "category": "Cultural",
        "weight": 7
      }
    ],
    "ai_generated": true,
    "generation_confidence": 85,
    "metadata": {
      "model": "gemini-2.5-flash"
    },
    "created_at": "2025-01-07T10:30:00Z",
    "updated_at": "2025-01-07T10:30:00Z"
  }
}
```

**Parameters:**
- `job_id` (path, required): Job ID from MySQL
- `job_description` (body, required): Full job description text
- `hidden_requirements` (body, optional): Internal/hidden requirements text

---

### 2. **Get Public Skills Only**
Retrieves only the public (normal) skills for a job. This is the public-facing endpoint.

```http
GET /api/job-skills/:jobId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "job_id": 1,
    "normal_skills": [
      {
        "skill_name": "Java",
        "importance": "Required",
        "min_years": 3,
        "category": "Technical",
        "weight": 8
      },
      {
        "skill_name": "Spring Boot",
        "importance": "Required",
        "min_years": 2,
        "category": "Framework",
        "weight": 8
      }
    ],
    "created_at": "2025-01-07T10:30:00Z",
    "updated_at": "2025-01-07T10:30:00Z"
  }
}
```

**Use Case:** Display job requirements on job board or candidate applications

---

### 3. **Get Full Skills (Public + Hidden)**
Retrieves both normal and hidden skills. **INTERNAL USE ONLY** - requires admin authentication.

```http
GET /api/job-skills/:jobId/internal
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "job_id": 1,
    "normal_skills": [
      {
        "skill_name": "Java",
        "importance": "Required",
        "min_years": 3,
        "category": "Technical",
        "weight": 8
      }
    ],
    "hidden_skills": [
      {
        "skill_name": "Startup Mindset",
        "reason": "Internal cultural requirement",
        "importance": "Critical",
        "category": "Cultural",
        "weight": 7
      },
      {
        "skill_name": "Leadership Potential",
        "reason": "Future managerial track",
        "importance": "Important",
        "category": "Internal",
        "weight": 6
      }
    ],
    "ai_generated": true,
    "generation_confidence": 85,
    "metadata": {
      "model": "gemini-2.5-flash"
    }
  },
  "warning": "Contains hidden criteria - internal use only"
}
```

**Use Case:** Recruitment team uses this for internal matching and candidate evaluation

---

### 4. **Manually Set Job Skills**
Manually create or update job skills without AI analysis.

```http
POST /api/job-skills/:jobId
Content-Type: application/json

{
  "normal_skills": [
    {
      "skill_name": "Java",
      "importance": "Required",
      "min_years": 3,
      "category": "Technical",
      "weight": 8
    },
    {
      "skill_name": "Spring Boot",
      "importance": "Required",
      "min_years": 2,
      "category": "Framework",
      "weight": 7
    }
  ],
  "hidden_skills": [
    {
      "skill_name": "Leadership",
      "importance": "Important",
      "category": "Internal",
      "weight": 6
    }
  ],
  "ai_generated": false,
  "generation_confidence": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job skills saved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "job_id": 1,
    "normal_skills": [...],
    "hidden_skills": [...],
    "ai_generated": false,
    "generation_confidence": 100,
    "updated_at": "2025-01-07T10:35:00Z"
  }
}
```

---

### 5. **Add Hidden Skill to Existing Job**
Add a single hidden skill to an existing job without re-analyzing.

```http
POST /api/job-skills/:jobId/hidden
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "skill_name": "Agile Methodologies",
  "reason": "Company uses Agile/Scrum",
  "importance": "Critical",
  "category": "Internal",
  "weight": 8
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hidden skill added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "job_id": 1,
    "hidden_skills": [
      {
        "skill_name": "Leadership",
        "importance": "Important",
        "category": "Internal"
      },
      {
        "skill_name": "Agile Methodologies",
        "reason": "Company uses Agile/Scrum",
        "importance": "Critical",
        "category": "Internal",
        "weight": 8
      }
    ]
  }
}
```

---

### 6. **Search Jobs by Skill Requirements**
Find all jobs that require a specific skill.

```http
GET /api/job-skills/search/query?skill=React&importance=Required&category=Framework
```

**Query Parameters:**
- `skill` (optional): Skill name (case-insensitive, partial match supported)
- `importance` (optional): Required | Preferred | Nice-to-have
- `category` (optional): Technical | Soft | Language | Tool | Framework | Other

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "job_id": 1,
      "normal_skills": [
        {
          "skill_name": "React",
          "importance": "Required",
          "category": "Framework",
          "weight": 9
        }
      ]
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "job_id": 2,
      "normal_skills": [
        {
          "skill_name": "React",
          "importance": "Preferred",
          "category": "Framework",
          "weight": 7
        }
      ]
    }
  ]
}
```

---

### 7. **Delete Job Skills**
Remove all skills associated with a job.

```http
DELETE /api/job-skills/:jobId
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Job skills deleted successfully"
}
```

---

## Data Models

### Normal Skills (Public)
```json
{
  "skill_name": "Java",
  "importance": "Required",      // Required | Preferred | Nice-to-have
  "min_years": 3,
  "category": "Technical",       // Technical | Soft | Language | Tool | Framework | Other
  "weight": 8                    // 0-10 importance weight
}
```

### Hidden Skills (Internal)
```json
{
  "skill_name": "Leadership",
  "reason": "Future managerial track",
  "importance": "Important",     // Critical | Important | Considered
  "category": "Internal",        // Cultural | Internal | Strategic | Other
  "weight": 6                    // 0-10 importance weight
}
```

---

## Usage Examples

### Example 1: Extract Skills from Job Description
```bash
curl -X POST http://localhost:5000/api/job-analysis/1/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Looking for a Senior Java developer with 5+ years of Spring Boot experience. Must have strong database design skills and experience with microservices architecture.",
    "hidden_requirements": "Candidate should have leadership experience and ability to mentor junior developers. Startup experience preferred."
  }'
```

### Example 2: Get Public Skills for Display
```bash
curl http://localhost:5000/api/job-skills/1
```

### Example 3: Get All Skills (Internal)
```bash
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  http://localhost:5000/api/job-skills/1/internal
```

### Example 4: Search Jobs by Required Skill
```bash
curl "http://localhost:5000/api/job-skills/search/query?skill=Docker&importance=Required"
```

---

## AI Model Information

The system uses **Gemini 2.5 models** for analysis:
- **Primary:** `gemini-2.5-pro` (Most capable, best for complex JDs)
- **Fallback:** `gemini-2.5-flash` (Faster, still high quality)
- **Confidence Score:** 0-100, indicates extraction reliability

---

## Database Schema (MongoDB)

**Collection:** `jobskills`

```javascript
{
  _id: ObjectId,
  job_id: 1,                          // MySQL Job ID
  normal_skills: [...],               // Public requirements
  hidden_skills: [...],               // Internal requirements
  ai_generated: true,
  generation_confidence: 85,
  metadata: {
    model: "gemini-2.5-flash"
  },
  created_at: ISODate("2025-01-07T10:30:00Z"),
  updated_at: ISODate("2025-01-07T10:30:00Z")
}
```

---

## Integration with Resume Matching

The extracted job skills are used to match against resume skills:

1. **Extract Job Skills** → `/api/job-analysis/:job_id/analyze`
2. **Get Resume Skills** → `/api/skills/resume/:resumeId`
3. **Calculate Match Score** → `/api/matching/match` (uses both datasets)
4. **Apply Hidden Criteria** → Internal matching considers hidden skills for final ranking

---

## Best Practices

1. **Always Analyze Job Descriptions:** Use AI analysis for new jobs to ensure consistent extraction
2. **Update Hidden Skills Regularly:** Adjust hidden criteria as company priorities change
3. **Use Weights Wisely:** Higher weights = more important for matching
4. **Maintain Consistency:** Use same categories across all jobs for better analytics
5. **Test Matching:** Verify extracted skills match expected candidates before publishing job

---

## Error Handling

### 400 Bad Request
```json
{
  "success": false,
  "message": "job_description is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Job skills not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "JD analysis failed",
  "error": "Error details..."
}
```

---

## Performance Notes

- **AI Analysis Time:** 2-5 seconds per job description (depends on length)
- **MongoDB Query Time:** <100ms for skill searches
- **Fallback Time:** If Gemini fails, keyword-based extraction (instant, lower confidence ~60%)

---

## Security

- ⚠️ **Hidden skills endpoint** requires admin authentication (TODO: implement)
- Hidden skills are NOT returned in public job view
- All write operations should be restricted to authorized users
- Use JWT tokens for API authentication

