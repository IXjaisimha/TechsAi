# AI-Assisted Resume & Job Description Matcher

A sophisticated full-stack application that leverages artificial intelligence to intelligently match job seekers with suitable job opportunities by analyzing resumes and job descriptions using advanced NLP and machine learning techniques.

## Overview

This system provides an intelligent matching platform that automates the recruitment process by:
- Extracting and analyzing resume data with AI-powered skills detection
- Processing job descriptions to identify explicit and hidden skill requirements
- Computing match scores using advanced ranking algorithms
- Providing recruiters with intelligent candidate recommendations

## Key Features

- ✅ **AI-Powered Resume Analysis** - Automatic skill extraction from resumes using Google Gemini
- ✅ **Job Description Intelligence** - Intelligent extraction of explicit and hidden skill requirements
- ✅ **Smart Matching Algorithm** - Sophisticated resume-to-job matching with weighted scoring
- ✅ **Ranking & Scoring** - Advanced ranking system with multiple scoring dimensions
- ✅ **User Authentication** - Secure JWT-based authentication with role-based access control
- ✅ **File Management** - Resume upload and storage with validation
- ✅ **Admin Dashboard** - Comprehensive admin interface for job and user management
- ✅ **RESTful API** - Complete API for all matching, ranking, and administration functions
- ✅ **Security** - Password hashing with bcrypt, CORS protection, input validation

## Technology Stack

- **Backend:**
  - Node.js & Express.js - Server framework
  - MongoDB - NoSQL database for flexibility and scalability
  - Mongoose - ODM for MongoDB
  - Google Gemini API - Advanced NLP for AI analysis
  
- **Authentication & Security:**
  - JWT (JSON Web Tokens) - Stateless authentication
  - bcryptjs - Password hashing
  - express-validator - Input validation and sanitization
  
- **Frontend:**
  - HTML5, CSS3, Vanilla JavaScript
  - Responsive design for mobile and desktop
  
- **Development Tools:**
  - Multer - File upload handling
  - CORS - Cross-Origin Resource Sharing
  - dotenv - Environment configuration

## Project Architecture

### Directory Structure

```
├── server.js                          # Main application entry point
├── config/
│   ├── config.js                     # Configuration settings
│   └── multerConfig.js               # File upload configuration
├── controllers/                       # Business logic layer
│   ├── authController.js             # Authentication logic
│   ├── resumeController.js           # Resume management
│   ├── jobAnalysisController.js      # Job description analysis
│   ├── jobSkillsController.js        # Job skills extraction
│   ├── aiMatchController.js          # AI matching engine
│   ├── matchingController.js         # Matching operations
│   ├── rankingController.js          # Ranking & scoring
│   ├── skillsController.js           # Skills management
│   └── adminController.js            # Admin operations
├── services/                          # Business logic services
│   ├── aiExtractionService.js        # AI-powered extraction
│   ├── geminiService.js              # Google Gemini integration
│   ├── jdAnalysisService.js          # Job description analysis
│   ├── matchingService.js            # Matching algorithms
│   └── rankingService.js             # Ranking calculations
├── models/                            # MongoDB schemas
│   ├── User.js                       # User model
│   ├── Resume.js                     # Resume data model
│   ├── ResumeSkill.js                # Extracted resume skills
│   ├── Job.js                        # Job posting model
│   ├── JobSkill.js                   # Job skill requirements
│   ├── Application.js                # Job application model
│   ├── AIMatchResult.js              # AI matching results
│   └── index.js                      # Database initialization
├── middleware/
│   └── auth.js                       # JWT authentication middleware
├── routes/                            # API endpoint definitions
│   ├── auth.js                       # Authentication routes
│   ├── resumes.js                    # Resume management routes
│   ├── jobs.js                       # Job posting routes
│   ├── jobAnalysis.js                # Job analysis routes
│   ├── jobSkills.js                  # Job skills routes
│   ├── aiMatches.js                  # AI matching routes
│   ├── matching.js                   # Matching routes
│   ├── ranking.js                    # Ranking routes
│   ├── skills.js                     # Skills management routes
│   └── admin.js                      # Admin management routes
├── public/                            # Frontend static files
│   ├── index.html                    # Main HTML page
│   ├── app.js                        # Frontend JavaScript
│   └── styles.css                    # Styling
├── uploads/
│   └── resumes/                      # Resume file storage
├── DebuggingFiles/                   # Utility scripts for testing
├── Documentation/                    # Comprehensive documentation
└── package.json                      # Project dependencies & scripts
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB instance (local or cloud-based)
- Google Gemini API key
- npm or yarn package manager

### Installation Steps

1. **Clone and Navigate to Project:**
   ```bash
   cd "AI Assisted and JD Matcher"
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/AI-Matcher
   MONGODB_USER=your_username
   MONGODB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   
   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # File Upload
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=10485760
   ```

4. **Start the Application:**
   ```bash
   # Development mode (with hot reload)
   npm run dev
   
   # Production mode
   npm start
   ```

The application will be available at `http://localhost:5000`

## Core Features & Functionality

### 1. Resume Management
- Upload and parse resumes in PDF/DOC format
- Automatic skill extraction using AI
- Resume data storage and retrieval
- Skill validation and normalization

### 2. Job Description Analysis
- Intelligent extraction of job requirements
- Identification of explicit skills (explicitly mentioned)
- Detection of hidden skills (implied or contextual)
- Job categorization and enrichment

### 3. AI-Powered Matching
- Sophisticated algorithm matching resumes to jobs
- Multi-dimensional scoring system
- Weighted skill matching
- Experience level compatibility assessment

### 4. Ranking & Scoring
- Advanced ranking algorithms for candidates
- Score normalization and calibration
- Comparative analysis of multiple matches
- Detailed scoring breakdowns

### 5. User Management
- Secure user registration and authentication
- Role-based access control (Admin/User)
- Profile management and verification
- Session management with JWT tokens

### 6. Admin Dashboard
- Job posting and management
- Candidate profile review
- Match result analysis
- System configuration and monitoring

## API Endpoints Overview

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Authenticate user |
| GET | `/api/auth/me` | Get current user profile |

### Resume Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resumes/upload` | Upload resume file |
| GET | `/api/resumes/:id` | Retrieve resume data |
| DELETE | `/api/resumes/:id` | Delete resume |
| GET | `/api/resume-skills/:resumeId` | Get extracted skills |

### Job Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs/create` | Create job posting |
| GET | `/api/jobs/:id` | Get job details |
| PUT | `/api/jobs/:id` | Update job posting |
| DELETE | `/api/jobs/:id` | Delete job |
| GET | `/api/jobs` | List all jobs |

### AI Matching & Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai-matches/calculate` | Calculate AI match score |
| GET | `/api/ai-matches/:jobId/:resumeId` | Get match results |
| POST | `/api/matching/find-matches` | Find matching candidates |
| POST | `/api/ranking/rank-candidates` | Rank candidates |

### Job Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/job-analysis/analyze` | Analyze job description |
| POST | `/api/job-skills/extract` | Extract job skills |
| GET | `/api/job-skills/:jobId` | Get job requirements |

### Skills Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skills` | List all skills |
| POST | `/api/skills/normalize` | Normalize skill names |
| GET | `/api/skills/:skillId` | Get skill details |

### Admin Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | System statistics |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:userId` | Update user |
| DELETE | `/api/admin/users/:userId` | Delete user |

## Testing & Validation

### Using Postman
1. Import the API endpoints from the collection
2. Set authorization header: `Authorization: Bearer YOUR_JWT_TOKEN`
3. Configure environment variables for base URL and tokens
4. Test each endpoint with sample data

### Using cURL
```bash
# User Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'

# User Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'

# Upload Resume
curl -X POST http://localhost:5000/api/resumes/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@path/to/resume.pdf"

# Calculate AI Match
curl -X POST http://localhost:5000/api/ai-matches/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "jobId": "job_id_here",
    "resumeId": "resume_id_here"
  }'
```

### Using Thunder Client
- VS Code extension for quick API testing
- Import endpoints and test with minimal setup
- Built-in environment variable management

### Unit Testing
Run the included debugging scripts:
```bash
node DebuggingFiles/testEndToEnd.js
node DebuggingFiles/testGemini.js
node DebuggingFiles/testJobSkills.js
node DebuggingFiles/verifyMongoDB.js
```

## Security & Best Practices

### Security Features
- **Password Security:** Passwords hashed with bcryptjs before storage
- **Authentication:** JWT-based stateless authentication
- **Input Validation:** All inputs validated and sanitized using express-validator
- **CORS Protection:** Cross-origin requests properly configured
- **Error Handling:** Comprehensive error handling without sensitive data exposure
- **API Rate Limiting:** Recommended implementation for production
- **Environment Variables:** Sensitive data stored in .env file

### Best Practices
- Always use HTTPS in production
- Rotate JWT secrets regularly
- Implement refresh token mechanism
- Log security events and monitor suspicious activities
- Keep dependencies updated
- Use strong password requirements
- Implement request timeout and file size limits

## Database Models

### User Model
Stores user account information with roles and authentication data

### Resume Model
Stores resume data, file references, and metadata

### ResumeSkill Model
Stores extracted skills from resumes with confidence scores

### Job Model
Stores job postings with descriptions and requirements

### JobSkill Model
Stores job skill requirements with proficiency levels

### Application Model
Tracks user applications to jobs

### AIMatchResult Model
Stores AI-generated match scores and analysis results

## Configuration

Edit `config/config.js` to customize:
- Server port and host
- Database connection parameters
- JWT expiration time
- File upload limits
- AI model parameters
- Logging levels

## Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Verify MongoDB is running
- Check connection string in .env
- Verify credentials and network access

**Gemini API Errors:**
- Verify API key is valid
- Check API quota limits
- Ensure proper error handling

**File Upload Issues:**
- Check upload directory permissions
- Verify file size limits
- Ensure multer configuration is correct

**JWT Authentication Failures:**
- Verify token format in Authorization header
- Check token expiration
- Ensure JWT_SECRET matches production settings

## Performance Optimization

- Implement database indexing for frequently queried fields
- Cache AI matching results for repeated calculations
- Use pagination for large result sets
- Implement request queuing for AI operations
- Monitor API response times and optimize bottlenecks

## Future Enhancements

- [ ] Real-time notifications for matches
- [ ] Advanced filtering and search options
- [ ] Batch resume/job processing
- [ ] Skill recommendation engine
- [ ] Interview scheduling integration
- [ ] Analytics and reporting dashboard
- [ ] Mobile application
- [ ] GraphQL API implementation
- [ ] Machine learning model customization
- [ ] Multi-language support

## Documentation

Comprehensive documentation is available in the `Documentation/` folder:
- [AI_MATCHING_GUIDE.md](Documentation/AI_MATCHING_GUIDE.md) - AI matching algorithm details
- [API_TESTING_GUIDE.md](Documentation/API_TESTING_GUIDE.md) - API testing procedures
- [ARCHITECTURE.md](Documentation/ARCHITECTURE.md) - System architecture
- [JOB_EXTRACTION_API_GUIDE.md](Documentation/JOB_EXTRACTION_API_GUIDE.md) - Job analysis details
- [RESUME_UPLOAD_GUIDE.md](Documentation/RESUME_UPLOAD_GUIDE.md) - Resume processing guide
- [TESTING_GUIDE.md](Documentation/TESTING_GUIDE.md) - Complete testing documentation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support & Contact

For issues, questions, or suggestions:
- Check existing documentation in the `Documentation/` folder
- Review debugging files in `DebuggingFiles/` folder
- Check error logs for detailed error information
- Contact development team for additional support

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini API for AI-powered text analysis
- MongoDB for scalable database solutions
- Express.js community for excellent web framework
- Open-source community for various dependencies and tools

---

**Last Updated:** January 12, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
