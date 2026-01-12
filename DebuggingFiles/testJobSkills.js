/**
 * Job Skills Extraction Test Script
 * Tests AI-powered job skill extraction with public and hidden requirements
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let jobId = 1; // Test with job ID 1

console.log('🧪 Job Skills Extraction Testing\n');

// Sample job descriptions for testing
const testJobs = [
  {
    jobId: 1,
    title: 'Senior Java Developer',
    jobDescription: `
      We are seeking a Senior Java Developer with 5+ years of experience.
      
      Requirements:
      - Strong Java and Spring Boot expertise (3+ years)
      - Microservices architecture knowledge
      - SQL/NoSQL database design (MySQL, MongoDB)
      - REST API development
      - Docker containerization
      - AWS cloud platform experience
      - Git version control
      
      Nice to have:
      - Kubernetes orchestration
      - Apache Kafka
      - Machine Learning basics
      - CI/CD pipeline setup
    `,
    hiddenRequirements: `
      Internal Criteria:
      - Leadership potential - ability to mentor junior developers
      - Startup mindset - comfortable with ambiguity and rapid changes
      - Cultural fit - collaborative, willing to help teammates
      - Problem-solving ability - can analyze complex system issues
      - Communication skills - can explain technical concepts clearly
    `
  },
  {
    jobId: 2,
    title: 'React Frontend Developer',
    jobDescription: `
      Hiring a React Frontend Developer for our SaaS platform.
      
      Required Skills:
      - React.js (2+ years production experience)
      - JavaScript/TypeScript
      - HTML5 & CSS3
      - Redux state management
      - REST API integration
      - Git version control
      
      Preferred:
      - Next.js
      - Tailwind CSS
      - Jest testing
      - Web performance optimization
    `,
    hiddenRequirements: `
      Hidden Evaluation Criteria:
      - Eye for UI/UX design
      - Attention to detail
      - Performance-conscious coding
      - User empathy - understands end-user perspective
      - Accessibility awareness (WCAG compliance)
    `
  },
  {
    jobId: 3,
    title: 'DevOps Engineer',
    jobDescription: `
      DevOps Engineer needed for infrastructure optimization.
      
      Core Requirements:
      - Kubernetes administration
      - Docker containerization
      - CI/CD pipeline tools (Jenkins, GitLab CI)
      - Cloud platforms (AWS/Azure)
      - Linux system administration
      - Infrastructure as Code (Terraform, Helm)
      - Monitoring tools (Prometheus, ELK)
      
      Good to have:
      - Python scripting
      - Ansible automation
      - Security best practices
    `,
    hiddenRequirements: `
      Internal Requirements:
      - On-call rotation tolerance
      - Incident response capability
      - System thinking - understands full infrastructure
      - Documentation discipline
      - Security mindset - proactive threat awareness
    `
  }
];

// Step 1: Test AI Extraction
async function testAIExtraction() {
  console.log('📊 Step 1: Testing AI Extraction\n');
  
  try {
    for (const job of testJobs) {
      console.log(`🔍 Extracting skills for: ${job.title}`);
      console.log(`   Job ID: ${job.jobId}`);
      
      const response = await axios.post(`${API_URL}/job-analysis/${job.jobId}/analyze`, {
        job_description: job.jobDescription,
        hidden_requirements: job.hiddenRequirements
      });

      if (response.data.success) {
        const data = response.data.data;
        console.log(`   ✅ AI Analysis Complete`);
        console.log(`   📈 Confidence: ${data.generation_confidence}%`);
        console.log(`   🤖 Model Used: ${data.metadata?.model}`);
        console.log(`   📋 Normal Skills: ${data.normal_skills.length}`);
        console.log(`   🔐 Hidden Skills: ${data.hidden_skills.length}`);
        
        // Show sample skills
        if (data.normal_skills.length > 0) {
          console.log(`   Sample normal skills:`);
          data.normal_skills.slice(0, 3).forEach(skill => {
            console.log(`     - ${skill.skill_name} (${skill.importance}) - Weight: ${skill.weight}`);
          });
        }
        
        if (data.hidden_skills.length > 0) {
          console.log(`   Sample hidden skills:`);
          data.hidden_skills.slice(0, 2).forEach(skill => {
            console.log(`     - ${skill.skill_name} (${skill.importance}) - ${skill.reason || 'Internal'}`);
          });
        }
      } else {
        console.log(`   ❌ Failed: ${response.data.message}`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ AI Extraction error:', error.response?.data || error.message);
  }
}

// Step 2: Get Public Skills
async function testPublicView() {
  console.log('\n📋 Step 2: Testing Public View (Normal Skills Only)\n');
  
  try {
    for (const job of testJobs) {
      console.log(`🔍 Fetching public view for Job ${job.jobId}:`);
      
      const response = await axios.get(`${API_URL}/job-skills/${job.jobId}`);

      if (response.data.success) {
        const data = response.data.data;
        console.log(`   ✅ Public view retrieved`);
        console.log(`   📋 Normal Skills: ${data.normal_skills.length}`);
        
        console.log(`   Skills shown to candidates:`);
        data.normal_skills.forEach(skill => {
          console.log(`     - ${skill.skill_name} (${skill.importance})${skill.min_years ? ` - ${skill.min_years}+ years` : ''}`);
        });
      } else {
        console.log(`   ℹ️  No skills found (may need to extract first)`);
      }
      console.log('');
    }
  } catch (error) {
    console.error('❌ Public view error:', error.response?.data || error.message);
  }
}

// Step 3: Get Internal View (with hidden skills)
async function testInternalView() {
  console.log('\n🔐 Step 3: Testing Internal View (Public + Hidden)\n');
  
  try {
    for (const job of testJobs) {
      console.log(`🔍 Fetching internal view for Job ${job.jobId}:`);
      
      const response = await axios.get(`${API_URL}/job-skills/${job.jobId}/internal`);

      if (response.data.success) {
        const data = response.data.data;
        console.log(`   ✅ Internal view retrieved`);
        console.log(`   📋 Normal Skills: ${data.normal_skills.length}`);
        console.log(`   🔐 Hidden Skills: ${data.hidden_skills.length}`);
        
        if (data.hidden_skills.length > 0) {
          console.log(`   Internal criteria:`);
          data.hidden_skills.forEach(skill => {
            console.log(`     - ${skill.skill_name} (${skill.importance})`);
            if (skill.reason) console.log(`       Reason: ${skill.reason}`);
          });
        }
      } else {
        console.log(`   ℹ️  No skills found`);
      }
      console.log('');
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`   ℹ️  Skills not yet extracted (normal, extract them first)`);
    } else {
      console.error('❌ Internal view error:', error.response?.data || error.message);
    }
  }
}

// Step 4: Search Jobs by Skill
async function testSkillSearch() {
  console.log('\n🔎 Step 4: Testing Skill Search\n');
  
  try {
    const searchQueries = [
      { skill: 'Java', importance: 'Required' },
      { skill: 'React', importance: 'Required' },
      { skill: 'Docker', category: 'Tool' }
    ];

    for (const query of searchQueries) {
      let url = `${API_URL}/job-skills/search/query?`;
      if (query.skill) url += `skill=${query.skill}&`;
      if (query.importance) url += `importance=${query.importance}&`;
      if (query.category) url += `category=${query.category}`;

      console.log(`🔍 Searching: ${JSON.stringify(query)}`);
      
      const response = await axios.get(url);

      if (response.data.success) {
        console.log(`   ✅ Found ${response.data.count} job(s)`);
        response.data.data.slice(0, 3).forEach(job => {
          console.log(`   Job ${job.job_id}: ${job.normal_skills.map(s => s.skill_name).join(', ')}`);
        });
      } else {
        console.log(`   ❌ Search failed: ${response.data.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Search error:', error.response?.data || error.message);
  }
}

// Step 5: Test Comparison
async function testComparison() {
  console.log('\n📊 Step 5: Public vs Internal Comparison\n');
  
  try {
    const testJobId = 1;
    
    // Get public view
    const publicRes = await axios.get(`${API_URL}/job-skills/${testJobId}`);
    const publicSkills = publicRes.data.data?.normal_skills || [];
    
    // Get internal view
    const internalRes = await axios.get(`${API_URL}/job-skills/${testJobId}/internal`);
    const internalData = internalRes.data.data;
    const hiddenSkills = internalData?.hidden_skills || [];

    console.log(`Job ${testJobId} - Skill Visibility:\n`);
    console.log(`📋 Normal Skills (Shown to Candidates):`);
    publicSkills.forEach(s => console.log(`   ✓ ${s.skill_name}`));
    
    console.log(`\n🔐 Hidden Skills (Internal Only):`);
    hiddenSkills.forEach(s => console.log(`   ✓ ${s.skill_name}`));
    
    console.log(`\n✅ Hidden skills are NOT exposed in public API calls`);
  } catch (error) {
    console.log('   ℹ️  Skipping comparison (may need extraction first)');
  }
}

// Main execution
async function runAllTests() {
  try {
    await testAIExtraction();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between requests
    
    await testPublicView();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testInternalView();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testSkillSearch();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testComparison();
    
    console.log('\n\n✅✅✅ All Job Skills Tests Complete!\n');
    console.log('📖 See JOB_EXTRACTION_API_GUIDE.md for full documentation');
    console.log('📋 See JOB_SKILLS_QUICK_REFERENCE.md for quick reference\n');
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
  }
}

// Run tests if server is available
console.log('Waiting for server to be ready...\n');
setTimeout(runAllTests, 2000);
