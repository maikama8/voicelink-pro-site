const express = require('express');
const { makeAuthClient } = require('../utils/mbAuth');

const router = express.Router();

// Render pages
router.get('/login', (req, res) => res.render('pages/login', { error: null }));
router.get('/signup', (req, res) => res.render('pages/signup', { error: null }));

// Handle login
router.post('/login', async (req, res) => {
  const { email, username, password } = req.body || {};
  try {
    const auth = makeAuthClient();
    const { token } = await auth.login({ email, username, password });
    if (!token) throw new Error('No token returned');
    const profile = await auth.profileWithToken(token);

    // Derive a role field (common possibilities: role, usertype, group, level)
    const role = profile?.role || profile?.user_type || profile?.group || profile?.level || 'user';

    req.session.user = { id: profile?.id || profile?.user_id || null, email: profile?.email || email || username };
    req.session.role = String(role).toLowerCase();
    req.session.mbToken = token;

    res.redirect('/dashboard');
  } catch (e) {
    res.status(401).render('pages/login', { error: e.message || 'Login failed' });
  }
});

// Handle signup (creates user via MB; may require admin/root credentials depending on MB config)
router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body || {};
  try {
    const auth = makeAuthClient();
    await auth.signup({ email, username, password });
    // After signup, redirect to login
    res.redirect('/login');
  } catch (e) {
    res.status(400).render('pages/signup', { error: e.message || 'Signup failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
