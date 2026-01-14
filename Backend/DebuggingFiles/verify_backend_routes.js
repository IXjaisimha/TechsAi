const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function testRoutes() {
    console.log('🧪 Testing Backend Routes...');

    try {
        // 1. Health Check
        const health = await axios.get('http://localhost:5000/health');
        console.log('✅ Health Check:', health.data.message);

        // 2. Auth - Login (Need a valid user to test protected routes)
        // Assuming a user exists, or we fail gracefully if not.
        // For now, we just check if 401 is returned for protected routes, which proves the route exists and is protected.

        try {
            await axios.get(`${API_URL}/admin/jobs`);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ /api/admin/jobs exists and is protected (401 Unauthorized)');
            } else {
                console.error('❌ /api/admin/jobs check failed:', error.message);
            }
        }

        try {
            await axios.post(`${API_URL}/applications/analyze`, {}, { headers: { 'Content-Type': 'multipart/form-data' } });
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ /api/applications/analyze exists and is protected (401 Unauthorized)');
            } else {
                console.error('❌ /api/applications/analyze check failed:', error.message);
            }
        }

    } catch (error) {
        console.error('❌ Connectivity Error:', error.message);
    }
}

testRoutes();
