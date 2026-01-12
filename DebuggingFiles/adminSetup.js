/**
 * Admin Setup Script
 * - Registers the default admin using bootstrap endpoint (only if no admin exists)
 * - Logs in as admin to verify credentials
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';
const INIT_SECRET = process.env.ADMIN_INIT_SECRET;
const name = process.env.DEFAULT_ADMIN_NAME || 'Default Admin';
const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
const password = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';

async function bootstrapAdmin() {
  if (!INIT_SECRET) {
    console.log('❌ ADMIN_INIT_SECRET is not set. Add it to your .env.');
    return null;
  }
  try {
    console.log('🚀 Bootstrapping default admin...');
    const res = await axios.post(`${API_URL}/auth/register-admin/bootstrap`, {
      name,
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-init': INIT_SECRET
      }
    });
    console.log('✅ Bootstrap success:', res.data.message);
    return res.data.token;
  } catch (err) {
    const data = err.response?.data;
    if (data?.message && data.message.includes('admin already exists')) {
      console.log('ℹ️ Admin already exists. Skipping bootstrap.');
      return null;
    }
    console.error('❌ Bootstrap failed:', data || err.message);
    return null;
  }
}

async function secretUpsertAdmin() {
  if (!INIT_SECRET) {
    console.log('❌ ADMIN_INIT_SECRET is not set. Add it to your .env.');
    return null;
  }
  try {
    console.log('🔧 Secret upsert admin (create/update)...');
    const res = await axios.post(`${API_URL}/auth/register-admin/secret-upsert`, {
      name,
      email,
      password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'x-admin-init': INIT_SECRET
      }
    });
    console.log('✅ Secret upsert success:', res.data.message);
    return res.data.token;
  } catch (err) {
    console.error('❌ Secret upsert failed:', err.response?.data || err.message);
    return null;
  }
}
async function adminLogin() {
  try {
    console.log('🔑 Logging in as admin...');
    const res = await axios.post(`${API_URL}/auth/admin/login`, { email, password }, {
      headers: { 'Content-Type': 'application/json' }
    });
    const token = res.data.token;
    console.log('✅ Admin login successful');
    console.log('🔧 Role:', res.data.user.role);
    console.log('🔐 Token (first 24 chars):', token?.slice(0, 24), '...');
    return token;
  } catch (err) {
    console.error('❌ Admin login failed:', err.response?.data || err.message);
    return null;
  }
}

(async () => {
  // Bootstrap default admin (only if none exists)
  const bootToken = await bootstrapAdmin();
  if (!bootToken) {
    // If bootstrap skipped or failed, ensure admin exists/updated via secret
    await secretUpsertAdmin();
  }
  // Login with default admin creds
  await adminLogin();
})();
