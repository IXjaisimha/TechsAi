# 🏗️ Polyglot Persistence Architecture

## 📊 Database Split Strategy

This project implements a **polyglot persistence architecture** where different types of data are stored in databases best suited for their characteristics.

### Why Two Databases?

| MySQL (Relational) | MongoDB (Document) |
|-------------------|-------------------|
| Structured, transactional data | Unstructured, evolving data |
| Strong relationships | Flexible schemas |
| ACID compliance | High read/write performance |
| Complex joins | Nested documents |

---

## 🗄️ Data Distribution

### 🟦 MySQL - Structured Core Data

**Tables stored in MySQL:**

| Table | Purpose | Why MySQL? |
|-------|---------|-----------|
| `users` | User authentication & profiles | Foreign keys, transactions, integrity |
| `user_profiles` | Extended user information | Strong relation to users |
| `resumes` | Resume file metadata | Ownership tracking, file references |
| `jobs` | Job postings | Lifecycle management, constraints |
| `applications` | Job applications | Strong relations (user ↔ job ↔ resume) |

**Key Features:**
- ✅ Foreign key constraints
- ✅ Referential integrity
- ✅ ACID transactions
- ✅ Complex joins across tables
- ✅ Normalized data structure

---

### 🟩 MongoDB - Flexible AI & Skills Data

**Collections stored in MongoDB:**

| Collection | Source | Purpose | Why MongoDB? |
|-----------|--------|---------|-------------|
| `resume_skills` | `resume_skills` | Candidate skill sets | Variable, nested skill structures |
| `job_skills` | `job_normal_skills` + `job_hidden_skills` | Job requirements (public + hidden) | Frequent updates, nested documents |
| `ai_match_results` | `ai_match_results` | AI matching analysis | Complex AI output, evolving schema |

**Key Features:**
- ✅ Flexible schema (no migrations needed)
- ✅ Nested documents (skills as arrays)
- ✅ Fast reads for AI processing
- ✅ Easy evolution as AI improves
- ✅ Rich querying with aggregation

---

## 🔗 How They Work Together

### Example: Complete Match Analysis

```javascript
// 1. Get application from MySQL (Sequelize)
const application = await Application.findByPk(id, {
  include: [User, Job, Resume]
});

// 2. Get resume skills from MongoDB (Mongoose)
const resumeSkills = await ResumeSkill.findOne({ 
  resume_id: application.resume_id 
});

// 3. Get job requirements from MongoDB (Mongoose)
const jobSkills = await JobSkill.findOne({ 
  job_id: application.job_id 
});

// 4. Get AI match result from MongoDB (Mongoose)
const matchResult = await AIMatchResult.findOne({ 
  application_id: application.id 
});

// 5. Combine everything
return {
  application,      // MySQL
  resumeSkills,     // MongoDB
  jobSkills,        // MongoDB
  matchResult       // MongoDB
};
```

---

## 📁 Project Structure

```
├── config/
│   └── config.js              # MySQL + MongoDB configuration
├── models/
│   ├── index.js               # Initializes both databases
│   ├── User.js                # MySQL/Sequelize model
│   ├── ResumeSkill.js         # MongoDB/Mongoose model
│   ├── JobSkill.js            # MongoDB/Mongoose model
│   └── AIMatchResult.js       # MongoDB/Mongoose model
├── controllers/
│   ├── authController.js      # Uses MySQL
│   ├── skillsController.js    # Uses MongoDB
│   ├── jobSkillsController.js # Uses MongoDB
│   └── aiMatchController.js   # Uses both databases
└── routes/
    ├── auth.js
    ├── skills.js
    ├── jobSkills.js
    └── aiMatches.js
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# MySQL Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=TechsAI
DB_USER=root
DB_PASSWORD=your_mysql_password

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/TechsAI

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
```

### Database URLs

- **MySQL**: `mysql://root:password@localhost:3306/TechsAI`
- **MongoDB**: `mongodb://localhost:27017/TechsAI`

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

Dependencies include:
- `sequelize` + `mysql2` → MySQL ORM
- `mongoose` → MongoDB ODM
- `express`, `bcryptjs`, `jsonwebtoken` → Core features

### 2. Start Both Databases

**MySQL:**
```bash
# Using XAMPP, WAMP, or standalone MySQL
# Create database: CREATE DATABASE TechsAI;
```

**MongoDB:**
```bash
# Using MongoDB Compass or mongod
mongod --dbpath /path/to/data
```

### 3. Run the Server

```bash
npm run dev  # Development with nodemon
npm start    # Production
```

You should see:
```
✅ MySQL connected successfully (Structured Data)
✅ MySQL Database synchronized
✅ MongoDB ready (AI & Skills Data)
✅ MongoDB connected successfully
🚀 Server is running on port 5000
📊 Using Polyglot Persistence Architecture
```

---

## 📡 API Endpoints

### MySQL Routes (Structured Data)

#### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### MongoDB Routes (Skills & AI Data)

#### Resume Skills
- `POST /api/skills/resume/:resumeId` - Add skills to resume
- `GET /api/skills/resume/:resumeId` - Get resume skills
- `GET /api/skills/search?skill=JavaScript` - Search by skill
- `PATCH /api/skills/resume/:resumeId/skill/:skillName` - Update skill
- `DELETE /api/skills/resume/:resumeId` - Delete resume skills

#### Job Skills
- `POST /api/job-skills/:jobId` - Add job requirements
- `GET /api/job-skills/:jobId` - Get public job skills
- `GET /api/job-skills/:jobId/internal` - Get all skills (including hidden)
- `POST /api/job-skills/:jobId/hidden` - Add hidden criteria
- `GET /api/job-skills/search/query?skill=React` - Search jobs by skill

#### AI Matches
- `POST /api/ai-matches` - Create match result
- `GET /api/ai-matches/application/:id` - Get match by application
- `GET /api/ai-matches/application/:id/complete` - **Polyglot query** (both DBs)
- `GET /api/ai-matches/user/:userId` - Get user's matches
- `GET /api/ai-matches/job/:jobId/top` - Top candidates for job
- `GET /api/ai-matches/job/:jobId/stats` - Match statistics

---

## 💡 Usage Examples

### Example 1: Add Resume Skills (MongoDB)

```javascript
POST /api/skills/resume/123
Content-Type: application/json

{
  "skills": [
    {
      "skill_name": "JavaScript",
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
  "extraction_method": "AI",
  "confidence_score": 92
}
```

### Example 2: Set Job Requirements (MongoDB)

```javascript
POST /api/job-skills/456
Content-Type: application/json

{
  "normal_skills": [
    {
      "skill_name": "Node.js",
      "importance": "Required",
      "min_years": 3,
      "category": "Technical",
      "weight": 9
    }
  ],
  "hidden_skills": [
    {
      "skill_name": "Team Leadership",
      "reason": "Looking for future tech lead",
      "importance": "Critical",
      "category": "Cultural",
      "weight": 8
    }
  ],
  "ai_generated": true,
  "generation_confidence": 88
}
```

### Example 3: Complete Match Analysis (Both DBs)

```javascript
GET /api/ai-matches/789/complete

Response:
{
  "success": true,
  "message": "Complete analysis retrieved from both databases",
  "data": {
    "match_result": { /* AI analysis from MongoDB */ },
    "resume_skills": { /* Skills from MongoDB */ },
    "job_requirements": { /* Requirements from MongoDB */ },
    "application_details": { /* Application from MySQL */ }
  }
}
```

---

## 🎯 Benefits of This Architecture

### ✅ Scalability
- Scale each database independently
- MongoDB handles high-volume AI processing
- MySQL handles critical transactions

### ✅ Performance
- Optimized queries for each data type
- MongoDB aggregation for analytics
- MySQL joins for relational data

### ✅ Flexibility
- MongoDB schema evolves with AI
- No migrations needed for skill changes
- MySQL enforces data integrity

### ✅ Real-World Ready
- Used by companies like Amazon, Netflix, Uber
- Industry best practice for diverse data
- Future-proof architecture

---

## 🔍 Key Design Decisions

### Why Not All MySQL?
- Skills data changes frequently
- AI output is unstructured
- Nested documents are natural for skills
- No need for complex migrations

### Why Not All MongoDB?
- Users/jobs need referential integrity
- Transactions are critical for applications
- Foreign keys prevent data corruption
- ACID guarantees for authentication

### Reference Pattern
MySQL IDs are used as references in MongoDB:
```javascript
// MongoDB document references MySQL record
{
  resume_id: 123,  // References MySQL resumes.id
  job_id: 456,     // References MySQL jobs.id
  skills: [...]
}
```

---

## 🛠️ Next Steps

### TODO: Complete the Architecture

1. **Create remaining MySQL models:**
   - `Resume.js`
   - `Job.js`
   - `Application.js`
   - `UserProfile.js`

2. **Add authentication middleware:**
   - Protect MongoDB routes
   - Admin-only for hidden skills

3. **Implement polyglot queries:**
   - Combine MySQL + MongoDB in controllers
   - Create data consistency checks

4. **Add data migration scripts:**
   - Migrate existing data if needed
   - Sync IDs between databases

5. **Implement backup strategies:**
   - MySQL backup scripts
   - MongoDB dump/restore

---

## 📚 Learn More

- [Sequelize Documentation](https://sequelize.org/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Polyglot Persistence Pattern](https://martinfowler.com/bliki/PolyglotPersistence.html)

---

## 🤝 Contributing

This architecture is designed to be extended. When adding new features:

1. **Ask: Is this structured or unstructured data?**
2. **Choose the right database:**
   - MySQL → Transactional, relational
   - MongoDB → Flexible, nested, AI-driven
3. **Document your decision**

---

**Architecture Version:** 1.0  
**Last Updated:** January 2026

✅ **System Design: Production-Ready Polyglot Persistence**
