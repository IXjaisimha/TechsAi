# 🏗️ AI-Powered JD Matcher - Architecture Overview

## 📐 System Architecture

### Design Philosophy
**"AI for Analysis, Node.js for Control"**
- ✅ **Gemini**: Performs analysis only (resume parsing, JD analysis, matching)
- ✅ **Node.js**: Controls all business logic, persistence, and orchestration
- ✅ **Fallbacks**: Regex/keyword/rule-based backups ensure system never breaks
- ✅ **Strict JSON**: All AI responses parsed strictly; invalid responses trigger fallbacks

---

## 🗄️ Polyglot Persistence Architecture

### MySQL (Structured Data)
**Purpose:** Store metadata and relationships

**Tables:**
- `users` - User authentication and profiles
- `resumes` - **File path only** (not content), file metadata
- `jobs` - Job postings and requirements
- `applications` - Applicant-job relationships
- `companies` - Company profiles

**Why MySQL?**
- ACID transactions for critical data
- Relational integrity (foreign keys)
- Efficient joins for user-resume-application queries

### MongoDB (Unstructured/AI Data)
**Purpose:** Store AI-extracted insights and analysis results

**Collections:**
- `resume_skills` - Extracted skills, education, experience from resumes
- `job_skills` - Normal + hidden skills from JD analysis
- `ai_match_results` - Detailed match breakdowns with scores

**Why MongoDB?**
- Flexible schema for AI outputs
- Nested documents for complex skill hierarchies
- Fast reads for skill matching queries
- No schema migrations needed when AI output evolves

---

## 🎯 Core Workflows

### 1. Resume Upload & Extraction

```
User uploads PDF
    ↓
Multer saves to local filesystem (uploads/resumes/)
    ↓
MySQL stores: { file_path, file_name, size, user_id }
    ↓
AI Extraction Service:
    - Extract text via pdf-parse
    - Call Gemini with strict JSON prompt
    - Parse response (strip code fences)
    - On failure: Fallback to regex extraction
    ↓
MongoDB stores: { resume_id, skills[], education[], experience[], confidence }
    ↓
Return combined response (MySQL + MongoDB)
```

**Key Features:**
- Accepts any field name via `upload.any()`
- 5MB file size limit
- Supports PDF/DOC/DOCX
- Extraction never blocks upload (graceful fallback)

---

### 2. Job Description Analysis

```
Company posts JD with description + requirements
    ↓
MySQL stores: { job_id, title, description, requirements, company_id }
    ↓
JD Analysis Service:
    - Build Gemini prompt for public + hidden skills
    - Call Gemini wrapper with fallback chain
    - Parse strict JSON response
    - On failure: Keyword-based extraction
    ↓
MongoDB stores: { 
    job_id, 
    normal_skills[], 
    hidden_skills[], 
    extraction_method, 
    confidence 
}
    ↓
Return analysis result
```

**Hidden Skills Detection:**
Gemini identifies implicit requirements like:
- "Team player" → Collaboration
- "Fast-paced environment" → Stress management
- "Ownership mindset" → Initiative

---

### 3. Resume-JD Matching

```
User triggers match (resume_id, job_id)
    ↓
Fetch resume skills from MongoDB (resume_skills)
    ↓
Fetch job skills from MongoDB (job_skills)
    ↓
Matching Service:
    - Build prompt with resume JSON + job skills
    - Call Gemini for intelligent matching
    - Calculate 4 scores:
        * Normal skills match (40% weight)
        * Hidden skills match (20% weight)
        * Experience alignment (30% weight)
        * Overall score (weighted average)
    - Extract strengths and gaps
    - Generate recommendation
    - On Gemini failure: Rule-based scoring
    ↓
MongoDB stores: { 
    resume_id, 
    job_id, 
    scores, 
    strengths[], 
    gaps[], 
    recommendation,
    extraction_method,
    model_version 
}
    ↓
Return match result
```

**Scoring Breakdown:**
- `normal_skills_score` (0-100): Technical skill alignment
- `hidden_skills_score` (0-100): Soft skills match
- `experience_score` (0-100): Years + relevance
- `overall_score` (0-100): Weighted composite

---

### 4. Candidate Ranking

```
Company requests ranking for job_id
    ↓
Fetch all match results from MongoDB (ai_match_results)
    ↓
Ranking Service:
    - Sort by overall_score (DESC)
    - Assign rank numbers (1, 2, 3...)
    - Apply decision logic:
        * Top 30%: "Interview"
        * Middle 40%: "Review"
        * Bottom 30%: "Reject"
    ↓
Return ranked candidate list
```

**Decision Thresholds:**
- Score ≥ 85: Strong match → Interview
- Score 70-84: Moderate → Review
- Score < 70: Poor match → Reject

---

## 🤖 AI Integration Strategy

### Gemini Wrapper Service

**Model Fallback Chain:**
1. `gemini-1.5-pro-latest` (preferred)
2. `gemini-1.5-pro`
3. `gemini-1.0-pro-latest`
4. `gemini-1.0-pro`
5. `gemini-pro`

**Strict JSON Parsing:**
```javascript
// Remove markdown code fences
text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');

// Parse strictly
const result = JSON.parse(text);

// On error: Return null → Trigger fallback
```

### Prompt Engineering Principles

**1. Resume Extraction Prompt:**
- Instructs JSON-only output
- Specifies schema structure
- Provides category examples
- Requests confidence score

**2. JD Analysis Prompt:**
- Separates public vs hidden skills
- Explains "importance" levels (required/preferred/nice-to-have)
- Asks for hidden skill reasoning

**3. Matching Prompt:**
- Passes full resume JSON + job skills
- Requests 4-score breakdown
- Asks for specific strengths and gaps
- Demands actionable recommendations

---

## 🛡️ Resilience & Fallbacks

### Three-Layer Fallback Strategy

**Layer 1: Gemini with Strict JSON**
- Primary AI analysis
- High accuracy, rich insights
- Handles complex scenarios

**Layer 2: Regex/Keyword/Rule-Based**
- **Resume**: Regex patterns for skills, education, experience
- **JD**: Keyword extraction from requirements
- **Matching**: Rule-based scoring (skill overlap %, experience match)

**Layer 3: Graceful Degradation**
- Set `extraction_method: "Parsed"`
- Lower confidence scores (0.3-0.5)
- Still returns valid structured data
- Backend never crashes

### Error Handling Flow

```
Try Gemini Model 1
    ↓ (404/500)
Try Gemini Model 2
    ↓ (404/500)
Try Gemini Model 3
    ↓ (invalid JSON)
Strip code fences → Re-parse
    ↓ (still fails)
Fallback extraction
    ↓
Return valid response with lower confidence
```

---

## 📂 File Organization

```
project-root/
├── config/
│   ├── config.js              # DB credentials
│   └── multerConfig.js        # File upload config
│
├── controllers/
│   ├── authController.js      # Auth endpoints
│   ├── resumeController.js    # Resume upload & management
│   ├── adminController.js     # Admin CRUD operations
│   ├── jobAnalysisController.js   # JD analysis endpoint
│   ├── matchingController.js      # Match computation
│   └── rankingController.js       # Candidate ranking
│
├── middleware/
│   └── auth.js                # JWT verification
│
├── models/
│   ├── index.js               # MySQL + MongoDB connections
│   ├── User.js                # MySQL user model
│   ├── Resume.js              # MySQL resume metadata
│   ├── Job.js                 # MySQL job posting
│   ├── Application.js         # MySQL application
│   ├── ResumeSkill.js         # MongoDB resume skills schema
│   ├── JobSkill.js            # MongoDB job skills schema
│   └── AIMatchResult.js       # MongoDB match result schema
│
├── routes/
│   ├── auth.js                # Auth routes
│   ├── resumes.js             # Resume CRUD
│   ├── admin.js               # Admin routes
│   ├── jobAnalysis.js         # JD analysis
│   ├── matching.js            # Matching routes
│   └── ranking.js             # Ranking routes
│
├── services/
│   ├── geminiService.js       # Gemini wrapper with fallbacks
│   ├── aiExtractionService.js # Resume extraction logic
│   ├── jdAnalysisService.js   # JD parsing logic
│   ├── matchingService.js     # Matching logic
│   └── rankingService.js      # Ranking logic
│
├── uploads/
│   └── resumes/               # Local file storage
│
├── .env                       # Environment variables
├── server.js                  # Express app entry point
└── package.json               # Dependencies
```

---

## 🔐 Security Considerations

### Current Implementation
- JWT authentication for all protected routes
- File size limits (5MB)
- File type validation (PDF/DOC/DOCX only)
- SQL injection protection via Sequelize ORM
- NoSQL injection protection via Mongoose

### Recommended Additions
- [ ] Role-based access control (RBAC)
- [ ] Rate limiting on AI endpoints
- [ ] File virus scanning
- [ ] Hide hidden skills from applicant-facing APIs
- [ ] Encrypt resumes at rest
- [ ] Audit logging for admin actions

---

## 📊 Data Flow Summary

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ↓
┌─────────────────────────────────────────┐
│           Express Server                │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │    Routes & Controllers          │  │
│  └──────────┬───────────────────────┘  │
│             │                           │
│  ┌──────────┴───────────────────────┐  │
│  │     Services Layer              │  │
│  │  • Gemini Wrapper               │  │
│  │  • AI Extraction                │  │
│  │  • JD Analysis                  │  │
│  │  • Matching                     │  │
│  │  • Ranking                      │  │
│  └──────────┬───────────────────────┘  │
└─────────────┼───────────────────────────┘
              │
       ┌──────┴──────┐
       ↓             ↓
┌──────────┐   ┌──────────┐
│  MySQL   │   │ MongoDB  │
│          │   │          │
│ • users  │   │ • resume_│
│ • resumes│   │   skills │
│ • jobs   │   │ • job_   │
│ • apps   │   │   skills │
│          │   │ • ai_    │
│          │   │   matches│
└──────────┘   └──────────┘
       ↑             ↑
       └──────┬──────┘
              │
     ┌────────┴────────┐
     ↓                 ↓
┌──────────┐    ┌──────────┐
│Filesystem│    │  Gemini  │
│          │    │   API    │
│ uploads/ │    │          │
│ resumes/ │    │ (Fallback│
│          │    │  ready)  │
└──────────┘    └──────────┘
```

---

## 🚀 Deployment Considerations

### Environment Variables
```env
# Server
PORT=5000
NODE_ENV=production

# MySQL
DB_NAME=jd_matcher
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_DIALECT=mysql

# MongoDB
MONGODB_URI=mongodb://localhost:27017/jd_matcher

# JWT
JWT_SECRET=your_jwt_secret

# AI
GEMINI_API_KEY=your_api_key
```

### Production Checklist
- [ ] Use environment-specific DB credentials
- [ ] Enable HTTPS (TLS/SSL)
- [ ] Set up reverse proxy (nginx)
- [ ] Configure CORS for production domain
- [ ] Use production-grade MongoDB (Atlas/self-hosted replica set)
- [ ] Use production-grade MySQL (RDS/managed instance)
- [ ] Set up file storage (S3/Azure Blob instead of local FS)
- [ ] Monitor Gemini API costs and rate limits
- [ ] Set up logging (Winston/Morgan)
- [ ] Configure error tracking (Sentry)
- [ ] Implement backup strategy for both DBs

---

## 📈 Performance Optimization

### Database Indexing
**MySQL:**
```sql
CREATE INDEX idx_user_id ON resumes(user_id);
CREATE INDEX idx_job_id ON applications(job_id);
CREATE INDEX idx_applicant_id ON applications(applicant_id);
```

**MongoDB:**
```javascript
db.resume_skills.createIndex({ resume_id: 1 });
db.job_skills.createIndex({ job_id: 1 });
db.ai_match_results.createIndex({ job_id: 1, overall_score: -1 });
```

### Caching Strategy
- Cache JD analyses (same job analyzed multiple times)
- Cache Gemini responses for identical inputs
- Use Redis for session management

### Async Processing
- Move AI extraction to background queue (Bull/BullMQ)
- Process large batches asynchronously
- Send webhook on completion

---

## 🎓 Learning Resources

### Technologies Used
- **Express.js**: Web framework
- **Sequelize**: MySQL ORM
- **Mongoose**: MongoDB ODM
- **Multer**: File upload handling
- **pdf-parse**: PDF text extraction
- **@google/generative-ai**: Gemini API SDK
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing

### Key Concepts
- Polyglot persistence
- AI-first design with fallbacks
- Prompt engineering
- Structured data extraction
- Ranking algorithms
- Microservice-oriented architecture

---

## 🎉 Success Metrics

### Technical KPIs
- ✅ 99.9% uptime (fallbacks prevent crashes)
- ✅ < 3s avg response time for AI endpoints
- ✅ > 80% Gemini success rate
- ✅ 100% data persistence (MySQL + MongoDB)

### Business KPIs
- Resume extraction accuracy: > 85%
- JD analysis coverage: > 90% of required skills
- Matching relevance: > 80% recruiter agreement
- Ranking effectiveness: Top 30% interview rate > 50%

---

**Built with ❤️ using AI-powered architecture**
