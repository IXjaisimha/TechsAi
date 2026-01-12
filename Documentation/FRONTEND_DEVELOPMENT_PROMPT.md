# 🎨 Frontend Development Prompt - AI Assisted JD Matcher

## PROJECT OVERVIEW

You are tasked with building a modern, secure, and beautiful frontend for an **AI-Powered Job Description Matcher** application. This system uses Artificial Intelligence (Gemini API) to automatically extract skills from resumes and job descriptions, then intelligently match candidates with job opportunities.

**Key Purpose:** Help recruiters and HR professionals quickly identify the best candidate-job matches using AI-powered analysis.

---

## TECH STACK REQUIREMENTS

### Core Framework
- **Framework:** React.js (Latest version with Hooks) OR Next.js (13+)
- **State Management:** Redux Toolkit or Zustand (for global auth, job, resume data)
- **Styling:** Tailwind CSS (primary) + shadcn/ui or Material-UI (component library)
- **HTTP Client:** Axios (with interceptors for JWT auth)
- **Form Handling:** React Hook Form + Zod/Yup validation
- **File Upload:** react-dropzone or custom file handling
- **Charts/Analytics:** Recharts or Chart.js (for match score visualization)
- **Icons:** Lucide React or React Icons
- **Testing:** Jest + React Testing Library (unit & integration tests)
- **Build Tool:** Vite (recommended for faster dev experience)

### Additional Libraries
- **Authentication:** JWT tokens via localStorage/sessionStorage
- **API Documentation:** Auto-generated from Swagger/OpenAPI spec
- **PDF Handling:** pdfjs-dist (for resume preview)
- **Loading States:** React Query (TanStack Query) for server state
- **Notifications:** Sonner or react-toastify (toast notifications)
- **Date Handling:** date-fns or Day.js

---

## BACKEND API DOCUMENTATION

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register (User)
```
POST /auth/register
Headers: Content-Type: application/json
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
Response: { 
  "success": true, 
  "message": "User registered successfully",
  "user": { "id", "name", "email", "role" },
  "token": "JWT_TOKEN_HERE"
}
```

#### 2. Login (User)
```
POST /auth/login
Headers: Content-Type: application/json
Body: {
  "email": "john@example.com",
  "password": "securePassword123"
}
Response: { 
  "success": true, 
  "message": "Login successful",
  "user": { "id", "name", "email", "role" },
  "token": "JWT_TOKEN_HERE"
}
```

#### 3. Admin Login
```
POST /auth/admin/login
Headers: Content-Type: application/json
Body: {
  "email": "admin@example.com",
  "password": "adminPassword123"
}
Response: { 
  "success": true, 
  "message": "Admin login successful",
  "user": { "id", "name", "email", "role": "ADMIN" },
  "token": "JWT_TOKEN_HERE"
}
```

#### 4. Get Current User (Protected)
```
GET /auth/me
Headers: Authorization: Bearer JWT_TOKEN
Response: { 
  "success": true, 
  "user": { "id", "name", "email", "role" }
}
```

---

### Resume Management Endpoints

#### 5. Upload & AI Extract Resume
```
POST /resumes/upload
Headers: 
  - Authorization: Bearer JWT_TOKEN
  - Content-Type: multipart/form-data
Body: {
  "file": <PDF/DOC/DOCX file>,
  "user_id": "user_id_here"
}
Response: {
  "success": true,
  "message": "Resume uploaded and skills extracted successfully",
  "resume": {
    "id": "resume_id",
    "filename": "john_resume.pdf",
    "uploadedAt": "2026-01-11T10:00:00Z",
    "extractedSkills": [
      { "skill": "JavaScript", "confidence": 0.95 },
      { "skill": "React", "confidence": 0.92 },
      { "skill": "Node.js", "confidence": 0.88 }
    ],
    "education": ["B.Tech in Computer Science"],
    "experience": "5+ years in full-stack development"
  }
}
```

#### 6. Get Resume Skills
```
GET /resumes/:resumeId/skills
Headers: Authorization: Bearer JWT_TOKEN
Response: {
  "success": true,
  "skills": [
    { "skill": "JavaScript", "confidence": 0.95, "category": "technical" },
    { "skill": "Project Management", "confidence": 0.85, "category": "soft-skill" }
  ],
  "rawData": { "education", "experience", "certifications" }
}
```

#### 7. Re-Extract Skills from Resume
```
POST /resumes/:resumeId/re-extract
Headers: Authorization: Bearer JWT_TOKEN
Response: { "success": true, "message": "Skills re-extracted successfully" }
```

#### 8. Delete Resume
```
DELETE /resumes/:resumeId
Headers: Authorization: Bearer JWT_TOKEN
Response: { "success": true, "message": "Resume deleted successfully" }
```

---

### Job & Skills Endpoints

#### 9. Get All Jobs
```
GET /job-skills
Headers: Authorization: Bearer JWT_TOKEN
Query Params: ?page=1&limit=10&search=developer
Response: {
  "success": true,
  "jobs": [
    {
      "id": "job_id",
      "title": "Senior React Developer",
      "company": "TechCorp",
      "description": "We are looking for...",
      "requiredSkills": ["React", "Node.js", "JavaScript"],
      "hiddenSkills": ["Docker", "AWS"] // AI-extracted non-obvious skills
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

#### 10. Create/Add Job
```
POST /job-skills
Headers: Authorization: Bearer JWT_TOKEN
Body: {
  "title": "Senior React Developer",
  "company": "TechCorp",
  "description": "Job posting text here...",
  "requirements": "Required skills..."
}
Response: {
  "success": true,
  "job": { "id", "title", "company", "requiredSkills", "hiddenSkills" }
}
```

#### 11. Analyze Job Description
```
POST /job-analysis/analyze
Headers: Authorization: Bearer JWT_TOKEN
Body: {
  "jobDescription": "Full job posting text...",
  "jobTitle": "React Developer"
}
Response: {
  "success": true,
  "analysis": {
    "normalSkills": ["React", "JavaScript", "HTML/CSS"],
    "hiddenSkills": ["Docker", "CI/CD", "Agile"],
    "experienceRequired": "3-5 years",
    "softSkills": ["Communication", "Leadership"]
  }
}
```

---

### Matching & Ranking Endpoints

#### 12. Match Resume with Job
```
POST /matching/match
Headers: Authorization: Bearer JWT_TOKEN
Body: {
  "resumeId": "resume_id",
  "jobId": "job_id"
}
Response: {
  "success": true,
  "match": {
    "resumeId": "resume_id",
    "jobId": "job_id",
    "matchScore": 0.87, // 0-1 scale
    "matchedSkills": ["React", "JavaScript", "Node.js"],
    "missingSkills": ["Docker", "AWS"],
    "skillBreakdown": {
      "technical": { "matched": 8, "missing": 2 },
      "soft": { "matched": 3, "missing": 1 }
    },
    "recommendation": "Strong match - candidate has most required skills"
  }
}
```

#### 13. Bulk Match (Resume vs Multiple Jobs)
```
POST /matching/bulk-match
Headers: Authorization: Bearer JWT_TOKEN
Body: {
  "resumeId": "resume_id"
}
Response: {
  "success": true,
  "matches": [
    { "jobId", "matchScore": 0.92, "matchedSkills", "missingSkills" },
    { "jobId", "matchScore": 0.78, "matchedSkills", "missingSkills" }
  ]
}
```

#### 14. Rank Candidates for Job
```
POST /ranking/rank-for-job
Headers: Authorization: Bearer JWT_TOKEN
Body: {
  "jobId": "job_id",
  "resumeIds": ["resume_id_1", "resume_id_2", "resume_id_3"]
}
Response: {
  "success": true,
  "rankedCandidates": [
    { "rank": 1, "resumeId", "score": 0.92, "matchedSkills", "analysis" },
    { "rank": 2, "resumeId", "score": 0.85, "matchedSkills", "analysis" }
  ]
}
```

#### 15. Get AI Match Results
```
GET /ai-matches
Headers: Authorization: Bearer JWT_TOKEN
Query Params: ?resumeId=X&jobId=Y
Response: {
  "success": true,
  "matches": [
    {
      "id": "match_id",
      "resumeId", "jobId",
      "overallScore": 0.87,
      "skillMatches": { "technical": [...], "soft-skills": [...] },
      "analysis": "Detailed AI-generated analysis",
      "recommendation": "STRONG_MATCH | MODERATE_MATCH | WEAK_MATCH"
    }
  ]
}
```

---

### Admin Endpoints

#### 16. Admin Dashboard Statistics
```
GET /admin/stats
Headers: Authorization: Bearer JWT_TOKEN (ADMIN role required)
Response: {
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalResumes": 320,
    "totalJobs": 85,
    "totalMatches": 4250,
    "averageMatchScore": 0.76
  }
}
```

#### 17. Manage Users (Admin)
```
GET /admin/users?page=1&limit=20
POST /admin/users/:userId/toggle-role
DELETE /admin/users/:userId
```

---

## SECURITY REQUIREMENTS

### Authentication & Authorization
1. **JWT Token Storage:**
   - Store JWT in `localStorage` with key `authToken`
   - Implement token refresh mechanism (if backend provides refresh token endpoint)
   - Clear token on logout

2. **Protected Routes:**
   - Implement PrivateRoute component to protect all routes except login/register
   - Redirect unauthenticated users to login page
   - Redirect non-admin users away from admin dashboard

3. **API Security:**
   - Add Authorization header to all API calls: `Authorization: Bearer ${token}`
   - Use Axios interceptors to automatically inject token
   - Handle 401 responses by clearing token and redirecting to login
   - Implement CSRF protection for state-changing operations

4. **Input Validation:**
   - Validate all form inputs on client-side before submission
   - Sanitize text inputs to prevent XSS
   - Validate file uploads (check file type, size)
   - Use zod/yup for schema validation

5. **Data Protection:**
   - Never log sensitive data (passwords, tokens) to console
   - Use HTTPS in production
   - Implement rate limiting for login attempts
   - Store sensitive data in environment variables

---

## UI/UX REQUIREMENTS

### Design Philosophy
- **Modern & Clean:** Minimal, professional aesthetic
- **Responsive:** Works perfectly on mobile (320px), tablet, and desktop (1920px+)
- **Accessible:** WCAG 2.1 AA compliance (keyboard navigation, screen readers, color contrast)
- **Dark Mode:** Support system preference for dark/light theme
- **Performance:** Fast load times, smooth animations, lazy loading

### Page Structure

#### 1. **Authentication Pages**
- **Login Page**
  - Email and password inputs with validation messages
  - "Forgot Password?" link (optional for phase 1)
  - "Sign Up" link to register page
  - Social login buttons (optional: Google, LinkedIn)
  - Loading state during authentication
  - Error toast notifications

- **Register Page**
  - Form fields: Name, Email, Password, Confirm Password
  - Password strength indicator
  - Terms & Conditions checkbox
  - Link to login page
  - Real-time validation feedback

#### 2. **Dashboard (Main Page)**
- **Navigation Bar**
  - Logo/App name
  - Navigation links: Dashboard, Resume Manager, Job Manager, Matches, Admin (if admin)
  - User profile dropdown menu
  - Logout button
  - Dark mode toggle

- **Main Content Area**
  - Welcome message with user's name
  - Quick stats cards:
    - Total Resumes Uploaded
    - Total Job Postings
    - Pending Matches
    - High-Scoring Matches (>80%)
  - Recent activity feed
  - Quick action buttons: "Upload Resume", "Add Job", "View Matches"

#### 3. **Resume Manager**
- **Resume List View**
  - Table/Card layout showing all uploaded resumes
  - Columns: Resume Name, Upload Date, Extraction Status, Actions
  - Search/filter functionality
  - Pagination
  - Action buttons: View, Re-extract, Match with Jobs, Delete
  - Bulk operations: Select multiple, bulk delete

- **Resume Upload Section**
  - Drag-and-drop file upload area
  - File browser button as fallback
  - Accepted formats: PDF, DOC, DOCX, TXT
  - File size limit display (e.g., "Max 10MB")
  - Upload progress bar
  - Success/error notifications

- **Resume Detail View**
  - Extracted skills display (with confidence scores)
  - Education section
  - Experience summary
  - Contact information
  - Edit extracted skills (allow manual correction)
  - PDF preview (if possible)
  - Quick actions: Match with Job, Delete, Re-extract

#### 4. **Job Manager**
- **Job List View**
  - Table showing all job postings
  - Columns: Job Title, Company, Posted Date, Status, Actions
  - Search and advanced filters
  - Pagination
  - Action buttons: View, Analyze, Match Candidates, Edit, Delete

- **Job Upload/Analysis Section**
  - Paste job description textarea
  - Auto-analyze button to extract skills using AI
  - Display analyzed skills: Required & Hidden Skills
  - Edit skills before saving
  - Create job with analyzed data

- **Job Detail View**
  - Job title, company, description
  - Required skills (with auto-detected badges)
  - Hidden skills (with confidence scores)
  - Experience level requirement
  - Soft skills needed
  - Number of matching candidates
  - Action buttons: Rank Candidates, Delete, Re-analyze

#### 5. **Matching & Ranking Page**
- **Single Resume to Single Job Match**
  - Select resume and job from dropdowns
  - Click "Match" button
  - Display results:
    - Match score (large, prominent display with color coding: Red <50%, Yellow 50-80%, Green >80%)
    - Matched skills (highlighted in green)
    - Missing skills (highlighted in red)
    - Skill breakdown chart (Technical vs Soft Skills)
    - AI recommendation text
    - Confidence/Analysis details

- **Bulk Matching Results**
  - Show top matched jobs for a selected resume
  - Table: Job Title, Company, Match Score, Top Skills
  - Click row to see detailed match analysis
  - Sort by score, date, relevance

- **Ranking Results**
  - Select a job, upload multiple resumes
  - Display ranked list of candidates
  - Table columns: Rank, Candidate Name, Score, Matched Skills, Actions
  - Downloadable ranking report (PDF)
  - Comparison view: side-by-side skill comparison of top candidates

#### 6. **Admin Dashboard (Protected - Admin only)**
- **Statistics Overview**
  - Total users, resumes, jobs, matches
  - Average match score
  - Charts: User growth, match distribution, skill frequency
  - Recent activity log

- **User Management**
  - User list table
  - Toggle user roles (USER → ADMIN or vice versa)
  - Delete user accounts
  - Search and filter users
  - Export user data (CSV)

- **System Health**
  - Database connection status
  - API endpoint status
  - Error logs
  - System performance metrics

---

## FEATURE REQUIREMENTS

### Core Features
1. ✅ User authentication (Register/Login)
2. ✅ Resume upload with AI skill extraction
3. ✅ Job posting management with AI analysis
4. ✅ Intelligent resume-to-job matching
5. ✅ Ranking multiple candidates for a job
6. ✅ View detailed match analysis and recommendations
7. ✅ Admin dashboard with system statistics
8. ✅ User account management

### Advanced Features
1. ✅ Bulk resume upload and processing
2. ✅ Bulk job analysis from multiple JDs
3. ✅ Skill confidence scoring
4. ✅ Hidden skill detection (AI extracts non-obvious skills)
5. ✅ Match comparison views
6. ✅ Skill category breakdown (Technical, Soft, etc.)
7. ✅ Downloadable match reports (PDF)
8. ✅ Search and filter across all pages
9. ✅ Real-time validation during form entry
10. ✅ Toast notifications for all operations (success, error, loading)

---

## ERROR HANDLING & USER FEEDBACK

### Error States
- Display clear, user-friendly error messages
- Log detailed errors to browser console for debugging
- Implement global error boundary component
- Specific error messages for:
  - Network errors
  - File upload errors (size, format)
  - Authentication failures
  - API validation errors
  - 401 (Unauthorized) - redirect to login
  - 403 (Forbidden) - show insufficient permissions
  - 500 (Server Error) - show generic error message

### Loading States
- Show spinners/skeletons during API calls
- Disable buttons during operations
- Display progress bars for file uploads
- Show "Analyzing..." status during AI extraction
- Implement cancel/abort functionality for long operations

### Success Feedback
- Toast notifications for successful operations
- Confirmation dialogs for destructive actions (delete)
- Show success messages with undo options when applicable

---

## PERFORMANCE OPTIMIZATION

1. **Code Splitting:**
   - Lazy load admin pages
   - Lazy load detailed views
   - Dynamic imports for heavy components

2. **Caching:**
   - Cache resume list and job list
   - Implement React Query cache invalidation
   - Use localStorage for user preferences

3. **Image & Asset Optimization:**
   - Optimize logo and UI images
   - Use SVGs for icons
   - Implement image lazy loading

4. **Bundle Size:**
   - Use Vite for fast build times
   - Tree-shake unused dependencies
   - Minify and compress production builds

---

## TESTING REQUIREMENTS

### Unit Tests
- Test all utility functions (validation, formatting)
- Test custom hooks
- Test reducers and state management

### Integration Tests
- Test authentication flow (login, logout)
- Test resume upload flow
- Test matching logic
- Test admin operations

### E2E Tests (Optional for Phase 1)
- Test complete user journey
- Test role-based access control
- Test error scenarios

### Coverage Target
- Minimum 70% code coverage
- 100% coverage for critical auth/matching paths

---

## DEPLOYMENT REQUIREMENTS

1. **Build:**
   - `npm run build` or `npm run build` produces optimized static files
   - Output to `dist/` folder
   - All assets gzipped and minified

2. **Environment Configuration:**
   - `.env.example` file with all required variables
   - Use Vite's `.env` system for different environments
   - Required variables:
     - `VITE_API_BASE_URL` - Backend API base URL
     - `VITE_APP_NAME` - Application name
     - `VITE_APP_VERSION` - Version info

3. **Hosting Options:**
   - Can be deployed to: Vercel, Netlify, GitHub Pages, AWS S3 + CloudFront, etc.
   - CORS must be enabled on backend for frontend origin

---

## FOLDER STRUCTURE (RECOMMENDED)

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── assets/
│       └── logo.svg
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   └── AuthLayout.jsx
│   │   ├── resume/
│   │   │   ├── ResumeUpload.jsx
│   │   │   ├── ResumeList.jsx
│   │   │   ├── ResumeDetail.jsx
│   │   │   └── SkillsDisplay.jsx
│   │   ├── job/
│   │   │   ├── JobList.jsx
│   │   │   ├── JobDetail.jsx
│   │   │   ├── JobAnalysis.jsx
│   │   │   └── SkillExtractor.jsx
│   │   ├── matching/
│   │   │   ├── MatchForm.jsx
│   │   │   ├── MatchResult.jsx
│   │   │   └── BulkMatchResults.jsx
│   │   ├── ranking/
│   │   │   ├── RankingForm.jsx
│   │   │   └── RankingResults.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── UserManagement.jsx
│   │       └── SystemStats.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── ResumeManager.jsx
│   │   ├── JobManager.jsx
│   │   ├── Matching.jsx
│   │   ├── Ranking.jsx
│   │   ├── Admin.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── services/
│   │   ├── api.js (Axios instance with interceptors)
│   │   ├── authService.js
│   │   ├── resumeService.js
│   │   ├── jobService.js
│   │   ├── matchingService.js
│   │   └── adminService.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useResume.js
│   │   ├── useJob.js
│   │   ├── useMatching.js
│   │   └── useLocalStorage.js
│   ├── store/ (Redux or Zustand)
│   │   ├── authSlice.js
│   │   ├── resumeSlice.js
│   │   ├── jobSlice.js
│   │   ├── matchingSlice.js
│   │   └── store.js
│   ├── utils/
│   │   ├── validation.js
│   │   ├── formatters.js
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── styles/
│   │   ├── globals.css (Tailwind imports)
│   │   └── custom.css (Custom styles)
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## STYLING GUIDE

### Color Scheme (Suggested)
- **Primary:** #3B82F6 (Blue) - Main actions, links
- **Success:** #10B981 (Green) - High match scores, confirmed actions
- **Warning:** #F59E0B (Amber) - Medium scores, warnings
- **Error:** #EF4444 (Red) - Low scores, errors
- **Neutral:** #6B7280 (Gray) - Secondary text, borders
- **Dark Background:** #1F2937 (Dark gray for dark mode)
- **Light Background:** #F9FAFB (Off-white for light mode)

### Typography
- **Headings:** Inter or Poppins font family
- **Body:** Inter or Roboto (sans-serif, readable at all sizes)
- **Monospace:** JetBrains Mono (for code snippets)

### Spacing
- Use 4px base unit for consistent spacing
- Padding/margin scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

---

## DELIVERABLES CHECKLIST

- [ ] Fully functional React/Next.js frontend
- [ ] All API endpoints integrated and tested
- [ ] Authentication system (login, register, JWT handling)
- [ ] Resume management (upload, extract, view, delete)
- [ ] Job management (create, analyze, view)
- [ ] Matching & ranking features fully implemented
- [ ] Admin dashboard with user management
- [ ] Responsive design (mobile-first)
- [ ] Dark mode support
- [ ] Comprehensive error handling
- [ ] Input validation on all forms
- [ ] At least 70% code coverage with tests
- [ ] Performance optimized (Lighthouse score >90)
- [ ] Accessibility compliant (WCAG 2.1 AA)
- [ ] README with setup and deployment instructions
- [ ] Environment variables documentation (.env.example)
- [ ] Production-ready build configuration

---

## ADDITIONAL NOTES

1. **Backend Integration:** The entire backend codebase will be provided. Study the structure, models, and API documentation.

2. **AI Features:** The backend uses Google Gemini API for AI-powered skill extraction from resumes and job descriptions. The frontend should display these results clearly with confidence scores.

3. **Database Architecture:** Backend uses polyglot persistence (MySQL for structured data, MongoDB for AI insights). Frontend doesn't need to handle this, just consume the APIs.

4. **Scalability:** Design components to handle large datasets (hundreds of resumes, thousands of matches).

5. **Internationalization (i18n):** Optional for phase 1, but architecture should allow for easy addition later.

6. **Analytics:** Consider integrating simple analytics (Google Analytics or Mixpanel) to track user behavior.

7. **Documentation:** Include JSDoc comments for all components and functions. Auto-generate API documentation.

---

**Let's build an amazing recruitment platform! 🚀**
