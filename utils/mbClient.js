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
    if (this.apiKey) headers['X-API-KEY'] = this.apiKey;
    if (this.apiSecret) headers['X-API-SECRET'] = this.apiSecret;
    return headers;
  }

  async ping() {
    // Replace with the correct health/status endpoint per MB API
    const res = await this.http.get('/api/ping', { headers: this.authHeaders() });
    return res.data;
  }

  async listCustomers(params = {}) {
    // Replace path/params to match real MB API routes
    const res = await this.http.get('/api/customers', { headers: this.authHeaders(), params });
    return res.data;
  }
}

module.exports = { MagnusBillingClient };