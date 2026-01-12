# API Testing Guide - AI-Powered JD Matcher

## 🎯 Overview
This guide provides comprehensive testing procedures for all AI-powered endpoints including resume extraction, JD analysis, matching, and ranking.

## 📋 Prerequisites
- Server running on `http://localhost:5000`
- Valid `GEMINI_API_KEY` in `.env`
- MySQL and MongoDB connections established
- Postman or similar API testing tool

---

## 🔐 Authentication Endpoints

### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "applicant"
}
```

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@123"
}
```
**Response:** Save the `token` for authenticated requests.

---

## 📄 Resume Upload & AI Extraction

### 3. Upload Resume with AI Extraction
```http
POST /api/resumes/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

Body:
- file: [Select PDF/DOC/DOCX file]
```

**What happens:**
1. File saved to local filesystem (`uploads/resumes/`)
2. File path stored in MySQL `resumes` table
3. AI extraction runs (Gemini with fallback)
4. Skills, education, experience saved to MongoDB `resume_skills` collection

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded and processed successfully",
  "data": {
    "resume": {
      "id": 1,
      "user_id": 1,
      "file_path": "uploads/resumes/...",
      "file_name": "resume.pdf"
    },
    "extraction": {
      "resume_id": 1,
      "skills": [...],
      "education": [...],
      "experience": [...],
      "extraction_method": "AI",
      "confidence_score": 0.95
    }
  }
}
```

---

## 💼 Job Description Analysis

### 4. Create Job Posting (MySQL)
First, create a job in MySQL (you'll need this endpoint implemented or create manually in DB):
```sql
INSERT INTO jobs (company_id, title, description, requirements, location, status)
VALUES (1, 'Senior Full Stack Developer', 
        'We are looking for an experienced developer...', 
        'React, Node.js, MongoDB, AWS', 
        'Remote', 'active');
```

### 5. Analyze Job Description
```http
POST /api/job-analysis/:job_id/analyze
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "description": "We are looking for a Senior Full Stack Developer with 5+ years experience. Must have deep expertise in React, Node.js, and MongoDB. AWS experience is a plus. Strong communication skills required.",
  "requirements": "React, Node.js, MongoDB, AWS, Communication Skills"
}
```

**What happens:**
1. Gemini analyzes JD to extract:
   - **Public skills**: Technical skills visible to candidates
   - **Hidden requirements**: Implicit needs (e.g., "team player", "fast learner")
2. Results saved to MongoDB `job_skills` collection
3. Fallback to keyword extraction if Gemini fails

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": 1,
    "normal_skills": [
      { "name": "React", "importance": "required", "category": "Frontend" },
      { "name": "Node.js", "importance": "required", "category": "Backend" }
    ],
    "hidden_skills": [
      { "name": "Communication", "reason": "Strong communication skills required" }
    ],
    "extraction_method": "AI",
    "confidence_score": 0.92
  }
}
```

---

## 🎯 Resume-JD Matching

### 6. Match Resume to Job
```http
POST /api/matching/match
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "resume_id": 1,
  "job_id": 1
}
```

**What happens:**
1. Fetches resume skills from MongoDB `resume_skills`
2. Fetches job skills from MongoDB `job_skills`
3. Gemini analyzes match quality with breakdown:
   - Normal skills match score
   - Hidden skills match score
   - Experience alignment score
   - Overall weighted score
4. Result saved to MongoDB `ai_match_results` collection

**Response:**
```json
{
  "success": true,
  "data": {
    "resume_id": 1,
    "job_id": 1,
    "overall_score": 87.5,
    "normal_skills_score": 90,
    "hidden_skills_score": 85,
    "experience_score": 88,
    "strengths": [
      "Strong React and Node.js expertise",
      "MongoDB experience matches requirements"
    ],
    "gaps": [
      "Limited AWS experience",
      "No mention of CI/CD tools"
    ],
    "recommendation": "Strong Match - Proceed to Interview",
    "extraction_method": "AI",
    "confidence_score": 0.91,
    "model_version": "gemini-1.5-pro-latest"
  }
}
```

---

## 🏆 Candidate Ranking

### 7. Rank Candidates for a Job
```http
GET /api/ranking/jobs/:job_id/rank
Authorization: Bearer YOUR_TOKEN
```

**What happens:**
1. Fetches all match results for the job from `ai_match_results`
2. Sorts by `overall_score` (highest first)
3. Assigns decisions:
   - Top 30%: "Interview"
   - 30-70%: "Review"
   - Bottom 30%: "Reject"

**Response:**
```json
{
  "success": true,
  "data": {
    "job_id": 1,
    "total_candidates": 10,
    "ranked_candidates": [
      {
        "rank": 1,
        "resume_id": 5,
        "overall_score": 92,
        "normal_skills_score": 95,
        "hidden_skills_score": 88,
        "recommendation": "Strong Match - Proceed to Interview",
        "decision": "Interview"
      },
      {
        "rank": 2,
        "resume_id": 3,
        "overall_score": 85,
        "decision": "Interview"
      }
    ]
  }
}
```

---

## 🛠️ Admin Endpoints

### 8. List All Resumes (Admin)
```http
GET /api/admin/resumes
Authorization: Bearer ADMIN_TOKEN
```

### 9. Get Resume Details with AI Skills
```http
GET /api/admin/resumes/:id
Authorization: Bearer ADMIN_TOKEN
```

### 10. Download Resume File
```http
GET /api/admin/resumes/:id/download
Authorization: Bearer ADMIN_TOKEN
```

### 11. Delete Resume (File + MySQL + MongoDB)
```http
DELETE /api/admin/resumes/:id
Authorization: Bearer ADMIN_TOKEN
```

---

## 🧪 Testing Scenarios

### Scenario 1: End-to-End Applicant Flow
1. Register applicant → Login → Get token
2. Upload resume → Verify AI extraction
3. Check MySQL `resumes` table (path stored)
4. Check MongoDB `resume_skills` (skills stored)
5. Apply to job → Match created automatically (if implemented)

### Scenario 2: Company JD Analysis Flow
1. Register company → Login → Get token
2. Create job posting (MySQL)
3. Analyze JD → Verify MongoDB `job_skills` created
4. Check hidden skills extraction

### Scenario 3: Matching & Ranking Flow
1. Create multiple applicants with resumes
2. Analyze target JD
3. Match each resume to job
4. Rank all candidates
5. Verify top candidates get "Interview" decision

### Scenario 4: Fallback Testing
1. **Invalid API key**: Set wrong `GEMINI_API_KEY`
2. Upload resume → Should use regex fallback
3. Analyze JD → Should use keyword fallback
4. Match → Should use rule-based scoring
5. Verify `extraction_method: "Parsed"` in responses

---

## 🔍 Database Verification

### MySQL Tables to Check
```sql
-- Check resume metadata
SELECT * FROM resumes WHERE user_id = 1;

-- Check jobs
SELECT * FROM jobs;

-- Check applications
SELECT * FROM applications WHERE applicant_id = 1;
```

### MongoDB Collections to Check
```javascript
// Resume skills
db.resume_skills.find({ resume_id: 1 }).pretty()

// Job skills
db.job_skills.find({ job_id: 1 }).pretty()

// Match results
db.ai_match_results.find({ job_id: 1 }).sort({ overall_score: -1 }).pretty()
```

---

## 📊 Expected AI Extraction Quality

### High Confidence (0.8-1.0)
- Clean, well-formatted resumes
- Clear section headers
- Standard terminology
- Gemini API available

### Medium Confidence (0.5-0.8)
- Mixed formats
- Some unclear sections
- Gemini API issues → Fallback used

### Low Confidence (0.3-0.5)
- Poor formatting
- Scanned/image-based PDFs
- Complete fallback to regex

---

## 🚨 Common Issues & Solutions

### Issue 1: "Unexpected field" error
**Cause:** Multer field name mismatch  
**Solution:** Uses `upload.any()` - any field name accepted

### Issue 2: PDF parsing fails
**Cause:** Corrupted PDF or unsupported format  
**Solution:** Uses `pdf-parse@1.1.1` - stable parsing

### Issue 3: Gemini 404 errors
**Cause:** Model name changed or API access restricted  
**Solution:** Fallback chain tries 5 models, then regex

### Issue 4: Invalid JSON from Gemini
**Cause:** Model returns markdown code fences or invalid JSON  
**Solution:** Strips code fences, parses strictly, falls back on error

### Issue 5: Enum validation error
**Cause:** Wrong `extraction_method` value  
**Solution:** Only uses `"AI"` or `"Parsed"` per schema

---

## ✅ Success Criteria

- [ ] Resume uploads successfully to filesystem
- [ ] MySQL stores file path correctly
- [ ] MongoDB stores extracted skills
- [ ] JD analysis extracts public + hidden skills
- [ ] Matching produces detailed breakdown
- [ ] Ranking sorts candidates correctly
- [ ] Fallbacks work when Gemini unavailable
- [ ] No backend crashes on AI failures
- [ ] Confidence scores reflect extraction quality

---

## 🎉 Next Steps

1. **Test all endpoints** using this guide
2. **Implement authentication middleware** for protected routes
3. **Add role-based access control** (applicant vs company vs admin)
4. **Hide hidden skills** from applicant-facing endpoints
5. **Build frontend** to consume these APIs
6. **Monitor Gemini costs** and rate limits
7. **Fine-tune prompts** based on real-world data
8. **Add caching** for repeated JD analyses

---

**Happy Testing! 🚀**
