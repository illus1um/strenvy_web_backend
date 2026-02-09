const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// GET /api/user/profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        res.json(req.user.toSafeObject());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/user/profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { password, role, ...updates } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.toSafeObject());
    } catch (error) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// PUT /api/user/preferences
router.put('/preferences', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const currentPrefs = user.preferences ? (typeof user.preferences.toObject === 'function' ? user.preferences.toObject() : { ...user.preferences }) : {};
        user.preferences = { ...currentPrefs, ...req.body };
        await user.save();
        res.json(user.toSafeObject());
    } catch (error) {
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// PUT /api/user/goals
router.put('/goals', authenticate, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { goals: req.body },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.toSafeObject());
    } catch (error) {
        res.status(500).json({ error: 'Failed to update goals' });
    }
});

module.exports = router;
