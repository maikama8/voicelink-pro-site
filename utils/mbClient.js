const axios = require('axios');

class MagnusBillingClient {
  constructor({ baseURL, apiKey, apiSecret, timeout = 10000 }) {
    if (!baseURL) throw new Error('MB_API_BASE_URL is required');
    this.http = axios.create({ baseURL, timeout });
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  // NOTE: Adjust auth headers/signature per MagnusBilling API docs.
  authHeaders() {
    const headers = {};
    // Prefer Bearer token if present
    if (this.apiKey && !this.apiSecret) headers['Authorization'] = `Bearer ${this.apiKey}`;
    if (process.env.MB_API_TOKEN) headers['Authorization'] = `Bearer ${process.env.MB_API_TOKEN}`;
    // Key/secret header pattern (adjust if your MB requires different naming)
    if (this.apiKey) headers['X-API-KEY'] = this.apiKey;
    if (this.apiSecret) headers['X-API-SECRET'] = this.apiSecret;
    return headers;
  }

  async ping() {
    // Example path; update to the correct health/status path as per your MB API
    const res = await this.http.get('/api/ping', { headers: this.authHeaders() });
    return res.data;
  }

  async listCustomers(params = {}) {
    // Example path; update to your MB endpoint
    const res = await this.http.get('/api/customers', { headers: this.authHeaders(), params });
    return res.data;
  }

  async request(method, path, { params, data } = {}) {
    const res = await this.http.request({ method, url: path, params, data, headers: this.authHeaders() });
    return res.data;
  }
}

module.exports = { MagnusBillingClient };