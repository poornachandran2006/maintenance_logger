const express = require('express');
const router = express.Router();
const { signup, signin, logout } = require('../controllers/auth.controller');

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/logout', logout);
router.get('/status', (req, res) => {
    try {
        const isAuthenticated = req.isAuthenticated() || req.session.user;

        res.status(200).json({
            authenticated: isAuthenticated,
            user: req.user || req.session.user
        });
    } catch (err) {
        console.error('Status check error:', err);
        res.status(500).json({ error: 'Unable to check auth status' });
    }
});

module.exports = router;