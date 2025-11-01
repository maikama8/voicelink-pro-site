const express = require('express');
const axios = require('axios');

const router = express.Router();

// Generic proxy for MagnusBilling API
// Forwards /api/mb/* to MB_API_BASE_URL/* with auth headers.
router.use(async (req, res) => {
  try {
    const baseURL = process.env.MB_API_BASE_URL;
    if (!baseURL) return res.status(503).json({ error: 'MagnusBilling not configured' });

    // Build target URL
    const path = req.originalUrl.replace(/^\/api\/mb/, '') || '/';
    const url = baseURL.replace(/\/$/, '') + path;

    // Build headers: forward minimal safe headers + auth
    const headers = {
      'Content-Type': req.get('Content-Type') || undefined,
      Accept: req.get('Accept') || 'application/json',
    };
    // Auth options: Bearer token or key/secret headers
    if (process.env.MB_API_TOKEN) headers['Authorization'] = `Bearer ${process.env.MB_API_TOKEN}`;
    if (process.env.MB_API_KEY) headers['X-API-KEY'] = process.env.MB_API_KEY;
    if (process.env.MB_API_SECRET) headers['X-API-SECRET'] = process.env.MB_API_SECRET;

    const method = req.method.toLowerCase();
    const config = { method, url, headers, params: req.query, validateStatus: () => true };

    if (['post', 'put', 'patch'].includes(method)) {
      config.data = req.body;
    }

    const resp = await axios(config);
    // Pass through status and data
    res.status(resp.status);
    // Prefer JSON, else send raw
    if (typeof resp.data === 'object') return res.json(resp.data);
    return res.send(resp.data);
  } catch (e) {
    const status = e.response?.status || 502;
    const msg = e.response?.data || { error: e.message };
    res.status(status).send(msg);
  }
});

module.exports = router;
