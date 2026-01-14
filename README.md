# AI-Assisted Job Description Matcher & ATS 🚀

A powerful, full-stack Applicant Tracking System (ATS) that uses **Advanced AI (DeepSeek, Llama 3, Gemini)** to match candidate resumes against job descriptions with human-like reasoning.

## 🌟 Key Features

*   **Polyglot Persistence Architecture**:
    *   **MySQL**: Handles structured data (Users, Jobs, Applications, Auth).
    *   **MongoDB**: Handles unstructured AI data (Resume Parsing, Scoring Breakdowns, Insights).
*   **AI-Powered Matching Engine**:
    *   Uses **OpenRouter API** to access top-tier models (DeepSeek R1, Llama 3.3).
    *   Performs **Deep Reasoning Analysis** on resumes.
    *   Extracts both **Technical Skills** and **Soft Skills**.
*   **Dual-Score System**:
    *   **Public Score**: Visible to candidates (Fair match based on JD).
    *   **Overall Score**: Visible only to Admins (Includes "Hidden Criteria" like salary/culture fit).
*   **Admin Dashboard**:
    *   Post & Manage Jobs.
    *   View Ranked Applicants.
    *   **One-Click Email Actions** (Shortlist/Reject) via Gmail Integration.
    *   Detailed AI Analysis Reports.
*   **Candidate Portal**:
    *   Upload Resume (PDF).
    *   Verify Extracted Skills.
    *   Get instant feedback on job fit.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Tailwind CSS, Lucide Icons.
*   **Backend**: Node.js, Express.
*   **Database**: MySQL (Sequelize ORM) + MongoDB (Mongoose).
*   **AI Service**: OpenRouter API (DeepSeek/Llama) + Google Gemini (Fallback).
*   **Email**: Nodemailer (Gmail SMTP).

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MySQL Server running on port 3306.
*   MongoDB running on port 27017.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "AI Assisted and JD Matcher - FullEnd"
```

### 2. Backend Setup
Navigate to the backend folder and install dependencies:
```bash
cd Backend
npm install
```

**Configure Environment Variables:**
Create a `.env` file in the `Backend` folder:
```ini
PORT=5000
NODE_ENV=development

# Database Config
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=your_db_name
MONGODB_URI=mongodb://localhost:27017/db_name

# JWT Secret
JWT_SECRET=your_super_secret_key_change_this

# AI API Keys
OPENROUTER_API_KEY=sk-or-v1-your-key-here
SITE_URL=http://localhost:5173
SITE_NAME=site_name

# Email Service (Gmail App Password)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
```

**Start the Backend:**
```bash
npm start
```
*The server will automatically create MySQL tables and sync with MongoDB.*

### 3. Frontend Setup
Open a new terminal and navigate to the client folder:
```bash
cd ../client
npm install
```

**Start the Frontend:**
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

## 📧 Email Configuration
This app uses **Gmail SMTP**. Standard passwords do not work. You must use an **App Password**:
1.  Go to [Google Account Security](https://myaccount.google.com/security).
2.  Enable **2-Step Verification**.
3.  Search for **"App passwords"**.
4.  Create one named "ATS" and copy the 16-character code into `.env`.

## 🤖 AI Customization
You can configure the preferred AI models in `Backend/services/geminiService.js`.
The default stack prioritizes **DeepSeek R1** for reasoning and **Llama 3** for speed.

## 👥 Usage
1.  **Register a Company Account** (Admin).
2.  **Post a Job**: Define technical requirements and *hidden* criteria.
3.  **Apply as a Candidate**: Upload a PDF resume.
4.  **View Analysis**: The Admin dashboard will show the ranked candidates with detailed AI insights.
