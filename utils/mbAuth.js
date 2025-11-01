const axios = require('axios');

function makeAuthClient() {
  const baseURL = process.env.MB_API_BASE_URL;
  if (!baseURL) throw new Error('MB_API_BASE_URL is not set');
  const http = axios.create({ baseURL, timeout: 15000 });

  const LOGIN_PATH = process.env.MB_AUTH_LOGIN_PATH || '/api/auth/login';
  const SIGNUP_PATH = process.env.MB_AUTH_SIGNUP_PATH || '/api/auth/signup';
  const PROFILE_PATHS = [
    process.env.MB_AUTH_PROFILE_PATH || '/api/auth/me',
    '/api/users/me',
    '/api/me',
  ];

  async function login({ username, email, password }) {
    const payload = email ? { email, password } : { username, password };
    const res = await http.post(LOGIN_PATH, payload, { validateStatus: () => true });
    if (res.status >= 400) throw new Error((res.data && res.data.message) || 'Login failed');

    // Try to extract token from common fields
    const token = res.data?.token || res.data?.access_token || res.data?.accessToken;
    return { raw: res.data, token };
  }

  async function signup({ username, email, password, role = 'user' }) {
    const payload = { username, email, password, role };
    const res = await http.post(SIGNUP_PATH, payload, { validateStatus: () => true });
    if (res.status >= 400) throw new Error((res.data && res.data.message) || 'Signup failed');
    return res.data;
  }

  async function profileWithToken(token) {
    for (const p of PROFILE_PATHS) {
      try {
        const res = await http.get(p, {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: () => true,
        });
        if (res.status < 400) return res.data;
      } catch (_) {}
    }
    throw new Error('Unable to fetch profile');
  }

  return { login, signup, profileWithToken };
}

module.exports = { makeAuthClient };