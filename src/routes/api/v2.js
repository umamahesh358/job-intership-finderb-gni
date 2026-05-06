const express = require('express');
const router = express.Router();
const v2Controller = require('../../controllers/api/v2Controller');

// Middleware to check authentication (reused from V1 context conceptually)
const checkAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

router.use(checkAuth);

// Resume Tailoring & ATS Optimization
router.post('/tailor-resume', v2Controller.tailorResume);

module.exports = router;
