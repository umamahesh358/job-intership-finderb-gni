const emailService = require('../services/emailService');
const crypto = require('crypto');

// In-memory store for tokens (in a real app, use a database or Redis)
const tokens = {};

const login = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const token = crypto.randomBytes(20).toString('hex');
  tokens[email] = {
    token,
    expires: Date.now() + 15 * 60 * 1000 // 15 minutes
  };

  try {
    await emailService.sendMagicLink(email, token);
    res.json({ message: 'Magic link sent. Please check your email. (Check console for ethereal email preview URL if no SMTP credentials provided)' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send email' });
  }
};

const verify = async (req, res) => {
  const { token, email } = req.query;

  if (!token || !email) {
    return res.status(400).json({ error: 'Token and email are required' });
  }

  const storedTokenData = tokens[email];

  if (!storedTokenData) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  if (storedTokenData.token !== token) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  if (Date.now() > storedTokenData.expires) {
    delete tokens[email];
    return res.status(400).json({ error: 'Token expired' });
  }

  // Token is valid, log the user in
  delete tokens[email]; // Consume token
  req.session.user = { email }; // Start session

  res.json({ message: 'Successfully logged in', user: { email } });
};

const me = (req, res) => {
    if (req.session.user) {
        res.json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
}

const logout = (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
}


module.exports = {
  login,
  verify,
  me,
  logout
};
