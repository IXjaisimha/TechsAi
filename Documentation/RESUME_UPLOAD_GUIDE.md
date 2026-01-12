# 📄 Resume Upload & AI Skill Extraction Guide

## 🎯 Overview

Upload a resume (PDF/DOC/DOCX) and automatically extract:
- ✅ **Skills** (Java, React, AWS, etc.) with proficiency levels
- ✅ **Education** (B.E., MBA, etc.)
- ✅ **Experience** (years of work experience)
- ✅ **Confidence Score** (how confident the AI is)

**Architecture:**
- **MySQL**: Stores resume metadata (file info, user association)
- **MongoDB**: Stores extracted skills and analysis results

---

## 📦 What Gets Uploaded Where

### MySQL (Structured)
```sql
-- Resume metadata (TODO: Create this table)
CREATE TABLE resumes (
    resume_id INT PRIMARY KEY,
    user_id INT,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_size_kb INT,
    uploaded_at TIMESTAMP
);
```

### MongoDB (Unstructured/AI)
```javascript
// Resume Skills Collection
{
  _id: ObjectId,
  resume_id: 3,
  skills: [
    {
      skill_name: "Java",
      proficiency_level: "Expert",
      years_of_experience: 5,
      category: "Technical",
      confidence_score: 85
    },
    // ... more skills
  ],
  education: ["B.E. in Computer Science"],
  experience_years: 5,
  extraction_method: "AI",
  confidence_score: 78,
  extracted_at: ISODate
}
```

---

## 🚀 Quick Start

### 1. Start Your Server

```powershell
npm start
```

Expected logs:
```
✅ MySQL connected successfully
✅ MongoDB ready (AI & Skills Data)
🚀 Server is running on port 5000
```

### 2. Upload a Resume

#### Using PowerShell/Curl:

```powershell
$FilePath = "C:\path\to\your\resume.pdf"
curl -X POST http://localhost:5000/api/resumes/upload `
  -F "file=@$FilePath" `
  -F "resume_id=3"
```

#### Using Python:

```python
import requests

with open('resume.pdf', 'rb') as f:
    files = {'file': f}
    data = {'resume_id': 3}
    response = requests.post(
        'http://localhost:5000/api/resumes/upload',
        files=files,
        data=data
    )
    print(response.json())
```

#### Using JavaScript/Fetch:

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('resume_id', '3');

fetch('http://localhost:5000/api/resumes/upload', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 📋 API Endpoints

### 1. Upload Resume & Extract Skills
**POST** `/api/resumes/upload`

**Request:**
```
Content-Type: multipart/form-data

file: [PDF/DOC/DOCX file]
resume_id: 3 (optional, for demo)
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded and skills extracted successfully",
  "data": {
    "file": {
      "name": "resume.pdf",
      "size_kb": 245,
      "path": "/uploads/resumes/user_3_1704855600000_resume.pdf"
    },
    "extracted_data": {
      "skills": [
        {
          "skill_name": "Java",
          "proficiency_level": "Expert",
          "category": "Technical",
          "confidence_score": 85
        },
        {
          "skill_name": "Spring Boot",
          "proficiency_level": "Intermediate",
          "category": "Framework",
          "confidence_score": 78
        }
        // ... more skills
      ],
      "education": ["B.E. in Computer Science"],
      "experience_years": 5,
      "confidence_score": 78,
      "extraction_method": "AI"
    },
    "resume_skills_mongodb": {
      "_id": "507f1f77bcf86cd799439011",
      "resume_id": 3,
      "skills": [...],
      "extracted_at": "2026-01-07T10:30:00Z"
    }
  }
}
```

---

### 2. Get Extracted Skills
**GET** `/api/resumes/:resumeId/skills`

**Example:**
```powershell
curl http://localhost:5000/api/resumes/3/skills
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resume_id": 3,
    "skills": [
      {
        "skill_name": "Java",
        "proficiency_level": "Expert",
        "category": "Technical",
        "confidence_score": 85
      }
      // ...
    ],
    "extraction_method": "AI",
    "confidence_score": 78,
    "extracted_at": "2026-01-07T10:30:00Z",
    "metadata": {
      "education": ["B.E. in Computer Science"],
      "experience_years": 5,
      "file_name": "resume.pdf",
      "file_size_kb": 245
    }
  }
}
```

---

### 3. Re-Extract Skills
**POST** `/api/resumes/:resumeId/re-extract`

Re-run AI extraction on an existing resume (useful if AI model improves).

```powershell
curl -X POST http://localhost:5000/api/resumes/3/re-extract
```

---

### 4. Bulk Extract
**POST** `/api/resumes/bulk-extract`

Extract skills from all uploaded resumes at once.

```powershell
curl -X POST http://localhost:5000/api/resumes/bulk-extract
```

---

### 5. Delete Resume
**DELETE** `/api/resumes/:resumeId`

Deletes the file and MongoDB records.

```powershell
curl -X DELETE http://localhost:5000/api/resumes/3
```

---

## 🤖 How AI Extraction Works

### Current Demo (Rule-Based Regex)

The AI service uses pattern matching to identify:
- **Programming Languages**: Java, Python, JavaScript, TypeScript, C++, Go, Rust
- **Frameworks**: React, Angular, Vue, Spring, Django, Express
- **Databases**: MySQL, PostgreSQL, MongoDB, Redis, Oracle
- **Cloud**: AWS, Azure, GCP, Docker, Kubernetes
- **Soft Skills**: Communication, Leadership, Problem Solving, Agile

**Example:**
- Resume contains: "5+ years Java experience" → Detects "Java" with "Expert" proficiency
- Resume contains: "Intermediate React developer" → Detects "React" with "Intermediate" proficiency

### Real AI Integration (TODO)

Replace the demo with real AI services:

#### **Option 1: OpenAI GPT-4**
```javascript
const extractWithOpenAI = async (resumeText) => {
  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: `Extract all skills from this resume:\n${resumeText}\n
      Return JSON with: skill_name, proficiency_level, category, years_experience`
    }]
  });
  return JSON.parse(response.choices[0].message.content);
};
```

#### **Option 2: Azure Document Intelligence**
```javascript
const extractWithAzureAI = async (filePath) => {
  const client = new DocumentAnalysisClient(endpoint, credentials);
  const poller = await client.beginAnalyzeDocumentFromPath('prebuilt-resume', filePath);
  return poller.pollUntilDone();
};
```

#### **Option 3: Custom NLP Model**
```python
# Using spaCy or transformers
from transformers import pipeline

nlp_extractor = pipeline('ner', model='distilbert-base-uncased')
entities = nlp_extractor(resume_text)
```

---

## 📁 File Structure

```
uploads/
  resumes/
    user_3_1704855600000_resume.pdf
    user_5_1704855700000_resume.docx
    
config/
  multerConfig.js          # File upload settings
  
services/
  aiExtractionService.js   # Regex-based AI extraction
  
controllers/
  resumeController.js      # Resume upload & extraction logic
  
routes/
  resumes.js               # Resume endpoints
```

---

## ⚙️ Configuration

### Multer (File Upload)
**Location:** `config/multerConfig.js`

**Settings:**
- **Max file size:** 5MB
- **Allowed formats:** PDF, DOC, DOCX
- **Storage location:** `uploads/resumes/`

```javascript
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});
```

### AI Extraction
**Location:** `services/aiExtractionService.js`

**Current confidence score:** 78-85% (demo)
**Adjustable skills list:** Add/remove patterns in `extractSkillsDemo()`

---

## 🧪 Test with Sample Resume

Create a test resume with this content:

```text
JOHN DOE

SUMMARY
Java and Spring Boot developer with 5+ years of experience.

SKILLS
Programming: Java, JavaScript, Python
Frameworks: Spring Boot, React
Databases: MySQL, MongoDB
Cloud: AWS, Docker, Kubernetes
Soft Skills: Leadership, Problem Solving

EXPERIENCE
Senior Java Developer - 2021-Present
- Led team of 5 developers
- Built microservices using Spring Boot
- Worked with AWS and Docker

EDUCATION
B.E. in Computer Science Engineering
```

**Upload:**
```powershell
curl -X POST http://localhost:5000/api/resumes/upload `
  -F "file=@test_resume.txt" `
  -F "resume_id=1"
```

**Expected extracted skills:**
- Java (Expert)
- Spring Boot (Expert)
- JavaScript (Intermediate)
- Python (Intermediate)
- React (Intermediate)
- MySQL (Intermediate)
- MongoDB (Intermediate)
- AWS (Intermediate)
- Docker (Intermediate)
- Kubernetes (Intermediate)
- Leadership (Intermediate)
- Problem Solving (Intermediate)

---

## 🔗 Integration with Matching

Once skills are extracted, use them for job matching:

```powershell
# 1. Upload resume and extract skills
curl -X POST http://localhost:5000/api/resumes/upload -F "file=@resume.pdf" -F "resume_id=3"

# 2. Get job requirements
curl http://localhost:5000/api/job-skills/1

# 3. Create AI match result
curl -X POST http://localhost:5000/api/ai-matches `
  -H "Content-Type: application/json" `
  -d '{
    "application_id": 3,
    "resume_id": 3,
    "job_id": 1,
    "user_id": 1,
    "overall_score": 85,
    "match_grade": "Excellent",
    "confidence_score": 90,
    "ai_model_version": "v1.0"
  }'

# 4. Get complete analysis (both databases)
curl http://localhost:5000/api/ai-matches/3/complete
```

---

## 🐛 Troubleshooting

### Error: "No file uploaded"
- Ensure `file` parameter is sent with multipart form data
- Check file size is under 5MB

### Error: "Only PDF, DOC, and DOCX files are allowed"
- Resume file must be `.pdf`, `.doc`, or `.docx`
- Check MIME type is correct

### MongoDB insertion fails
- Ensure MongoDB service is running: `Get-Service MongoDB`
- Check `.env` has correct `MONGODB_URI`

### No skills extracted
- Check resume contains common skill names (Java, React, etc.)
- See `services/aiExtractionService.js` for recognized skills
- Add more skill patterns if needed

---

## 📊 Next Steps

1. **Connect to MySQL:** Create `Resume` Sequelize model for file metadata
2. **Real AI:** Integrate OpenAI, Azure AI, or custom NLP
3. **Authentication:** Add JWT protection to upload endpoint
4. **Frontend:** Build UI for drag-drop resume upload
5. **Monitoring:** Add logging and performance tracking

---

**Happy resume processing!** 🎉
