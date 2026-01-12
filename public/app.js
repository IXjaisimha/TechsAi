const outputEl = document.getElementById('output');
const clearBtn = document.getElementById('clear-output');
const authStatusEl = document.getElementById('auth-status');
const logoutBtn = document.getElementById('logout-btn');

let authState = {
  token: null,
  user: null,
};

function setOutput(text, isError = false) {
  outputEl.textContent = text;
  outputEl.classList.toggle('text-red-300', isError);
}

function authHeaders() {
  return authState.token ? { Authorization: `Bearer ${authState.token}` } : {};
}

function updateAuthUI() {
  if (authState.user) {
    authStatusEl.textContent = `${authState.user.name} (${authState.user.role})`;
    logoutBtn.classList.remove('hidden');
  } else {
    authStatusEl.textContent = 'Not logged in';
    logoutBtn.classList.add('hidden');
  }
}

function persistToken(token) {
  authState.token = token;
  if (token) localStorage.setItem('jwt', token);
  else localStorage.removeItem('jwt');
}

async function fetchMe() {
  if (!authState.token) return null;
  try {
    const res = await fetch('/api/auth/me', { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    authState.user = data.user;
    updateAuthUI();
    return data.user;
  } catch {
    persistToken(null);
    authState.user = null;
    updateAuthUI();
    return null;
  }
}

async function login(event) {
  event.preventDefault();
  const form = event.target;
  const body = {
    email: form.email.value,
    password: form.password.value,
  };

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    persistToken(data.token);
    authState.user = data.user;
    updateAuthUI();
    setOutput(`✅ Logged in as ${data.user.name} (${data.user.role})`);
  } catch (err) {
    setOutput(`❌ ${err.message}`, true);
  }
}

async function register(event) {
  event.preventDefault();
  const form = event.target;
  const body = {
    name: form.name.value,
    email: form.email.value,
    password: form.password.value,
    role: form.role.value,
  };
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Register failed');
    persistToken(data.token);
    authState.user = data.user;
    updateAuthUI();
    setOutput(`✅ Registered and logged in as ${data.user.name} (${data.user.role})`);
  } catch (err) {
    setOutput(`❌ ${err.message}`, true);
  }
}

async function uploadResume(event) {
  event.preventDefault();

  const form = event.target;
  const fileInput = form.file;

  if (!authState.token) {
    setOutput('Please login first to upload.', true);
    return;
  }

  if (!fileInput.files.length) {
    setOutput('Select a PDF file.', true);
    return;
  }

  const submitLabel = document.getElementById('resume-submit-label');
  const spinner = document.getElementById('resume-spinner');

  submitLabel.textContent = 'Uploading...';
  spinner.classList.remove('hidden');
  form.querySelector('button[type="submit"]').disabled = true;

  try {
    const formData = new FormData();
    // user_id will be derived server-side from JWT (controller uses req.user)
    formData.append('file', fileInput.files[0]);

    const res = await fetch('/api/resumes/upload', {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Upload failed');
    }

    const { resume_id, ai_extracted_data } = data.data || {};

    setOutput(
      [
        '✅ Resume uploaded and processed by AI.',
        '',
        `Resume ID: ${resume_id}`,
        `Extraction method: ${ai_extracted_data?.extraction_method}`,
        `Skills found: ${ai_extracted_data?.skills_count}`,
        `Experience (years): ${ai_extracted_data?.experience_years}`,
        `Education: ${(ai_extracted_data?.education || []).join(', ')}`,
        `Confidence score: ${ai_extracted_data?.confidence_score}`,
        '',
        'Full API response:',
        JSON.stringify(data, null, 2),
      ].join('\n'),
    );
  } catch (err) {
    setOutput(`❌ ${err.message}`, true);
  } finally {
    submitLabel.textContent = 'Upload & Extract with AI';
    spinner.classList.add('hidden');
    form.querySelector('button[type="submit"]').disabled = false;
  }
}

async function fetchMatch(event) {
  event.preventDefault();

  if (!authState.token) {
    setOutput('Please login first to fetch matches.', true);
    return;
  }

  const form = event.target;
  const applicationId = form.applicationId.value;
  const jobId = form.jobId.value;

  if (!applicationId && !jobId) {
    setOutput('Provide at least an Application ID or Job ID to fetch matches.', true);
    return;
  }

  const submitLabel = document.getElementById('match-submit-label');
  const spinner = document.getElementById('match-spinner');

  submitLabel.textContent = 'Fetching...';
  spinner.classList.remove('hidden');
  form.querySelector('button[type="submit"]').disabled = true;

  try {
    let url;

    if (applicationId) {
      url = `/api/ai-matches/application/${encodeURIComponent(applicationId)}/complete`;
    } else if (jobId) {
      url = `/api/ai-matches/job/${encodeURIComponent(jobId)}/top`;
    }

    const res = await fetch(url, { headers: authHeaders() });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch match results');
    }

    setOutput(JSON.stringify(data, null, 2));
  } catch (err) {
    setOutput(`❌ ${err.message}`, true);
  } finally {
    submitLabel.textContent = 'Fetch AI Match Summary';
    spinner.classList.add('hidden');
    form.querySelector('button[type="submit"]').disabled = false;
  }
}

async function fetchAdminResume(event) {
  event.preventDefault();

  if (!authState.token || authState.user?.role !== 'ADMIN') {
    setOutput('Admin only. Please login as ADMIN.', true);
    return;
  }

  const form = event.target;
  const resumeId = form.resumeId.value;
  if (!resumeId) return;

  try {
    const res = await fetch(`/api/admin/resumes/${encodeURIComponent(resumeId)}`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch resume');
    setOutput(JSON.stringify(data, null, 2));
  } catch (err) {
    setOutput(`❌ ${err.message}`, true);
  }
}

async function fetchAdminUserResumes(event) {
  event.preventDefault();

  if (!authState.token || authState.user?.role !== 'ADMIN') {
    setOutput('Admin only. Please login as ADMIN.', true);
    return;
  }

  const form = event.target;
  const userId = form.userId.value;
  if (!userId) return;

  try {
    const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/resumes`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user resumes');
    setOutput(JSON.stringify(data, null, 2));
  } catch (err) {
    setOutput(`❌ ${err.message}`, true);
  }
}

function logout() {
  persistToken(null);
  authState.user = null;
  updateAuthUI();
  setOutput('Logged out.');
}

// Wire up events
document.getElementById('resume-form')?.addEventListener('submit', uploadResume);
document.getElementById('match-form')?.addEventListener('submit', fetchMatch);
document.getElementById('admin-resume-form')?.addEventListener('submit', fetchAdminResume);
document.getElementById('admin-user-resumes-form')?.addEventListener('submit', fetchAdminUserResumes);
document.getElementById('login-form')?.addEventListener('submit', login);
document.getElementById('register-form')?.addEventListener('submit', register);
logoutBtn?.addEventListener('click', logout);
clearBtn?.addEventListener('click', () => setOutput('Ready. Login first, then upload a resume.'));

// Bootstrap: restore token if present
const saved = localStorage.getItem('jwt');
if (saved) {
  authState.token = saved;
  fetchMe();
} else {
  updateAuthUI();
}


