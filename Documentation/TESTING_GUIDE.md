# AI-Powered Resume Matcher - Complete Setup

## 🎯 Overview
Your app is now **fully AI-powered** with:
- **Local File System Storage** for resumes
- **MySQL** stores only file paths & metadata
- **MongoDB** stores AI-extracted skills
- **Google Gemini AI** for intelligent extraction
- **Admin APIs** to access resumes and user data

---

## 📁 Architecture

```
User Upload → Local File System (uploads/resumes/)
           ↓
         MySQL (file_path, user_id, metadata)
           ↓
         Gemini AI (Extract skills, education, experience)
           ↓
         MongoDB (AI-extracted skills & insights)
           ↓
         Admin Access (Get paths, download files)
```

---

## 🔌 API Endpoints

### **1. User: Upload Resume**
```http
POST /api/resumes/upload
Content-Type: multipart/form-data

Body:
- file: [PDF/DOC/DOCX file]
- user_id: [User ID]
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully (MySQL) and AI-extracted skills saved (MongoDB)",
  "data": {
    "resume_id": 1,
    "mysql_resume": {
      "id": 1,
      "file_name": "john_doe_resume.pdf",
      "file_path": "uploads\\resumes\\1234567890-john_doe_resume.pdf",
      "uploaded_at": "2026-01-07T10:30:00.000Z"
    },
    "ai_extracted_data": {
      "skills_count": 15,
      "education": ["B.S. Computer Science"],
      "experience_years": 5,
      "confidence_score": 92,
      "extraction_method": "AI-Gemini"
    },
    "mongodb_skills_id": "677d1234567890abcdef"
  }
}
```

---

### **2. Admin: Get All Resumes**
```http
GET /api/admin/resumes
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "resume_id": 1,
      "user_id": 5,
      "file_name": "john_doe_resume.pdf",
      "file_path": "uploads\\resumes\\1234567890-john_doe_resume.pdf",
      "file_size_kb": 245,
      "is_active": true,
      "uploaded_at": "2026-01-07T10:30:00.000Z",
      "User": {
        "user_id": 5,
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone_number": "+1234567890"
      }
    }
  ]
}
```

---

### **3. Admin: Get Single Resume Details**
```http
GET /api/admin/resumes/:resume_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mysql_data": {
      "resume_id": 1,
      "file_name": "john_doe_resume.pdf",
      "file_path": "uploads\\resumes\\1234567890-john_doe_resume.pdf",
      "User": {...}
    },
    "ai_skills": {
      "resume_id": 1,
      "skills": [
        {
          "skill_name": "Python",
          "proficiency_level": "Expert",
          "years_of_experience": 5,
          "category": "Technical"
        },
        {
          "skill_name": "React",
          "proficiency_level": "Advanced",
          "years_of_experience": 3,
          "category": "Framework"
        }
      ],
      "extraction_method": "AI-Gemini",
      "confidence_score": 92
    },
    "file_access": {
      "path": "uploads\\resumes\\1234567890-john_doe_resume.pdf",
      "name": "john_doe_resume.pdf",
      "size_kb": 245
    }
  }
}
```

---

### **4. Admin: Download Resume File**
```http
GET /api/admin/resumes/:resume_id/download
```

**Response:** PDF file download

---

### **5. Admin: Get All Resumes for a User**
```http
GET /api/admin/users/:user_id/resumes
```

---

### **6. Admin: Delete Resume**
```http
DELETE /api/admin/resumes/:resume_id
```

Deletes:
- ✅ File from local file system
- ✅ MySQL record
- ✅ MongoDB AI-extracted skills

---

## 🧪 Testing in Postman

### **Upload Resume**
1. **Method:** POST
2. **URL:** `http://localhost:5000/api/resumes/upload`
3. **Body:** 
   - Select **form-data**
   - Add key: `file` (Type: **File**)
   - Choose your PDF
   - Add key: `user_id` (Type: Text, Value: `1`)
4. **Send**

### **Admin: View All Resumes**
1. **Method:** GET
2. **URL:** `http://localhost:5000/api/admin/resumes`
3. **Send**

### **Admin: Download Resume**
1. **Method:** GET
2. **URL:** `http://localhost:5000/api/admin/resumes/1/download`
3. **Send** → File will download

---

## 🗄️ Database Structure

### **MySQL (Structured Data)**
```sql
Table: resumes
- resume_id (PK)
- user_id (FK → users)
- file_name
- file_path (Local file system path)
- file_size_kb
- is_active
- uploaded_at
```

### **MongoDB (AI Data)**
```javascript
Collection: resume_skills
{
  resume_id: 1,
  skills: [
    {
      skill_name: "Python",
      proficiency_level: "Expert",
      years_of_experience: 5,
      category: "Technical"
    }
  ],
  extraction_method: "AI-Gemini",
  confidence_score: 92,
  metadata: {
    education: ["B.S. Computer Science"],
    experience_years: 5
  }
}
```

---

## 🤖 AI Features

### **Gemini AI Extraction**
- Analyzes resume text
- Extracts skills with proficiency levels
- Identifies education background
- Calculates total experience years
- Returns confidence score (0-100)
- Falls back to regex if AI fails

### **Supported File Types**
- PDF (via pdf-parse + pdfjs-dist)
- DOC/DOCX (TODO: Add mammoth library)

---

## 🔐 Next Steps

1. **Add Authentication Middleware**
   - Protect `/api/resumes/upload` (require user JWT)
   - Protect `/api/admin/*` (require admin role)

2. **Add Job Matching**
   - Create job posting endpoints
   - AI-powered job-resume matching
   - Score candidates automatically

3. **Add DOCX Support**
   ```bash
   npm install mammoth
   ```

---

## 📊 File Storage Details

- **Location:** `uploads/resumes/`
- **Format:** `{timestamp}-{original_filename}`
- **Max Size:** 5MB
- **Admin Access:** Via file_path in MySQL

---

## ✅ System Ready

Your server is running at **http://localhost:5000** with:
- ✅ MySQL connected (Structured data)
- ✅ MongoDB connected (AI data)
- ✅ Gemini AI integrated
- ✅ Local file system storage configured
- ✅ Admin APIs ready

Start uploading resumes and let AI do the work! 🚀
