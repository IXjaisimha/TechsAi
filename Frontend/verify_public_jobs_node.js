const axios = require('axios');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'verify_output.txt');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

async function testPublicJobs() {
    try {
        fs.writeFileSync(logFile, ''); // Init
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
        } else {
            log('No jobs found. Did the admin post one?');
        }

        // 3. Simple connectivity check for analysis (Header check only, no payload to avoid FormData issues)
        // We just want to know if the route is 404 or something else.
        try {
            await axios.post('http://localhost:5000/api/applications/analyze', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            log(`Analyze Route Response: ${err.response?.status} - ${err.response?.statusText}`);
        }

    } catch (error) {
        log('Error: ' + error.message);
        if (error.response) {
            log('Response Data: ' + JSON.stringify(error.response.data));
        }
    }
}

testPublicJobs();
