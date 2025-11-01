const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static assets and body parsing
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Site-wide locals
app.locals.SITE_NAME = 'Voicelink Pro';
app.locals.MB_PORTAL_URL = process.env.MB_PORTAL_URL || '#';

// Routes (pages)
app.get('/', (req, res) => res.render('pages/index'));
app.get('/services', (req, res) => res.render('pages/services'));
app.get('/pricing', (req, res) => res.render('pages/pricing'));
app.get('/about', (req, res) => res.render('pages/about'));
app.get('/contact', (req, res) => res.render('pages/contact', { status: null, error: null }));
app.get('/billing', (req, res) => res.render('pages/billing'));

// Contact form submission
app.post('/contact', async (req, res) => {
  const { name = '', email = '', company = '', message = '' } = req.body || {};

  // naive validation
  const errors = [];
  if (!name.trim()) errors.push('Name is required');
  if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
  if (!message.trim()) errors.push('Message is required');

  if (errors.length) {
    return res.status(400).render('pages/contact', { status: null, error: errors.join('. ') });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const to = process.env.CONTACT_TO_EMAIL;
    if (!to) throw new Error('CONTACT_TO_EMAIL is not set');

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `Website <${process.env.SMTP_USER}>`,
      to,
      replyTo: email,
      subject: `Contact form: ${name} (${email})`,
      text: `Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\nMessage:\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
             <p><strong>Email:</strong> ${escapeHtml(email)}</p>
             <p><strong>Company:</strong> ${escapeHtml(company)}</p>
             <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`
    });

    return res.render('pages/contact', { status: 'sent', error: null });
  } catch (err) {
    console.error('Contact send error:', err.message);
    return res.status(500).render('pages/contact', { status: null, error: 'Failed to send message. Please try again later.' });
  }
});

// MagnusBilling minimal API endpoints (adjust paths per real API)
const { MagnusBillingClient } = require('./utils/mbClient');
const mbClient = process.env.MB_API_BASE_URL
  ? new MagnusBillingClient({
      baseURL: process.env.MB_API_BASE_URL,
      apiKey: process.env.MB_API_KEY || process.env.MB_API_TOKEN, // support either
      apiSecret: process.env.MB_API_SECRET,
    })
  : null;

app.get('/api/mb/ping', async (req, res) => {
  if (!mbClient) return res.status(503).json({ error: 'MagnusBilling not configured' });
  try {
    const data = await mbClient.ping();
    res.json({ ok: true, data });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
});

app.get('/api/mb/customers', async (req, res) => {
  if (!mbClient) return res.status(503).json({ error: 'MagnusBilling not configured' });
  try {
    const data = await mbClient.listCustomers(req.query);
    res.json({ ok: true, data });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
