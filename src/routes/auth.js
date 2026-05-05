const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/verify', authController.verify);
router.get('/me', authController.me);
router.post('/logout', authController.logout);

// For testing purposes
router.post('/test-login', (req, res) => {
    req.session.user = { email: 'test@example.com' };
    res.json({ message: 'Test login successful' });
});

module.exports = router;
