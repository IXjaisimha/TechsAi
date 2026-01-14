const axios = require('axios');
const fs = require('fs');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('verify_output.txt', msg + '\n');
};

async function testPublicJobs() {
    try {
        log('Testing GET /api/jobs...');

        // 1. Signup a test user to get a valid token
        const email = `testuser_${Date.now()}@example.com`;
        log(`Creating user: ${email}`);

        let token;
        try {
            const signupRes = await axios.post('http://localhost:5000/api/auth/register', {
                full_name: 'Test User',
                email: email,
                password: 'password123',
                role: 'user'
            });
            token = signupRes.data.token;
            log('Signup successful, got token.');
        } catch (e) {
            log('Signup failed: ' + (e.response?.data?.message || e.message));
            // Try login if user exists? Unlikely with timestamp.
            return;
        }

        // 2. Fetch Jobs
        log('Fetching jobs with token...');
        const res = await axios.get('http://localhost:5000/api/jobs', {
            headers: { Authorization: `Bearer ${token}` }
        });

        log(`Status: ${res.status}`);
        log(`Is Array? ${Array.isArray(res.data)}`);
        log(`Count: ${res.data.length}`);

        if (res.data.length > 0) {
            log('First Job Sample: ' + JSON.stringify(res.data[0], null, 2));
            const jobId = res.data[0].job_id;

            // 3. Test Apply (Analysis)
            log(`Testing Application Analysis for Job ID: ${jobId}`);
            // We need a dummy PDF.
            fs.writeFileSync('dummy.pdf', 'Dummy PDF content');
            const formData = new FormData();
            // Node axios requires 'form-data' lib for FormData, or we can mock the request if complex.
            // But let's at least verify /api/jobs returned something. 
            // If jobs are visible, then the user's issue "unable to apply" might be the analysis endpoint.

            // Checking if Application Analysis route exists and is reachable (400 if no file)
            try {
                await axios.post('http://localhost:5000/api/applications/analyze', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } catch (err) {
                log(`Analyze Route Status: ${err.response?.status} (Expected 400 or 500 without file)`);
            }

        } else {
            log('No jobs found. Did the admin post one?');
        }

    } catch (error) {
        log('Error: ' + error.message);
        if (error.response) {
            log('Response Data: ' + JSON.stringify(error.response.data));
            log('Response Status: ' + error.response.status);
        }
    }
}

// Clear log file
fs.writeFileSync('verify_output.txt', '');
testPublicJobs();
