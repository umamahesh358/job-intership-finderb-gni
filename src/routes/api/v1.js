const express = require('express');
const router = express.Router();
const v1Controller = require('../../controllers/api/v1Controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Middleware to check authentication
const checkAuth = (req, res, next) => {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

router.use(checkAuth);

// Resume Understanding
router.post('/parse-resume', upload.single('resume'), v1Controller.parseResume);

// Role Suggestion
router.post('/suggest-roles', v1Controller.suggestRoles);

// Job Discovery / Matching
router.post('/match-jobs', v1Controller.matchJobs);

module.exports = router;
