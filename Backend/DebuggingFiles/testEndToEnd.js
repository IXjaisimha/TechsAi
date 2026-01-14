/**
 * End-to-End Test Script
 * Tests: Register → Login → Upload Resume → View Resume
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';
let resumeId = '';

// Test user credentials
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'Test@123',
  role: 'USER'
};

console.log('🧪 Starting End-to-End Test\n');

// Step 1: Register User
async function registerUser() {
  try {
    console.log('📝 Step 1: Registering user...');
    const response = await axios.post(`${API_URL}/auth/register`, testUser);
    
    authToken = response.data.token;
    userId = response.data.user.id;
    
    console.log(`✅ User registered: ID=${userId}`);
    console.log(`🔑 Token: ${authToken.substring(0, 20)}...`);
    return true;
  } catch (error) {
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('⚠️  User exists, trying login...');
      return await loginUser();
    }
    console.error('❌ Registration failed:', error.response?.data || error.message);
    return false;
  }
}

// Step 2: Login (if registration fails)
async function loginUser() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    authToken = response.data.token;
    userId = response.data.user.id;
    
    console.log(`✅ User logged in: ID=${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

// Step 3: Upload Resume
async function uploadResume() {
  try {
    console.log('\n📤 Step 2: Uploading resume...');
    
    const resumePath = path.join(__dirname, 'uploads', 'resumes', 'unknown_1767777929833_Kothari Jaisimha updated.pdf');
    
    if (!fs.existsSync(resumePath)) {
      console.error(`❌ Resume file not found: ${resumePath}`);
      return false;
    }
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(resumePath));
    formData.append('user_id', userId);
    
    const response = await axios.post(`${API_URL}/resumes/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    resumeId = response.data.data.resume_id;
    
    console.log(`✅ Resume uploaded: ID=${resumeId}`);
    console.log(`📊 Skills found: ${response.data.data.ai_extracted_data.skills_count}`);
    console.log(`🎓 Education: ${response.data.data.ai_extracted_data.education.join(', ')}`);
    console.log(`💼 Experience: ${response.data.data.ai_extracted_data.experience_years} years`);
    console.log(`🔧 Method: ${response.data.data.ai_extracted_data.extraction_method}`);
    
    return true;
  } catch (error) {
    console.error('❌ Resume upload failed:', error.response?.data || error.message);
    return false;
  }
}

// Step 4: Get Resume Details
async function getResumeDetails() {
  try {
    console.log('\n🔍 Step 3: Fetching resume details...');
    
    const response = await axios.get(`${API_URL}/resumes/${resumeId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log(`✅ Resume retrieved successfully`);
    console.log(`📄 File: ${response.data.data.resume.file_name}`);
    console.log(`💾 Size: ${response.data.data.resume.file_size_kb}KB`);
    console.log(`🎯 Skills in MongoDB: ${response.data.data.ai_skills?.skills?.length || 0}`);
    
    if (response.data.data.ai_skills?.skills) {
      console.log('\n🛠️  Extracted Skills:');
      response.data.data.ai_skills.skills.slice(0, 5).forEach((skill, i) => {
        console.log(`   ${i+1}. ${skill.skill_name} (${skill.proficiency_level})`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to fetch resume:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  const step1 = await registerUser();
  if (!step1) {
    console.log('\n❌ Test failed at Step 1');
    return;
  }
  
  const step2 = await uploadResume();
  if (!step2) {
    console.log('\n❌ Test failed at Step 2');
    return;
  }
  
  const step3 = await getResumeDetails();
  if (!step3) {
    console.log('\n❌ Test failed at Step 3');
    return;
  }
  
  console.log('\n✅✅✅ All tests passed! End-to-end verification complete.\n');
}

runTests();
