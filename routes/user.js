const express = require('express');
const router = express.Router();
const User = require('../models/User');

const simulateAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userId = userId;
    next();
};

// GET /api/user/profile
router.get('/profile', simulateAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.toSafeObject());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /api/user/profile
router.put('/profile', simulateAuth, async (req, res) => {
    try {
        const { password, ...updates } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
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
router.put('/preferences', simulateAuth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.preferences = { ...user.preferences.toObject(), ...req.body };
        await user.save();
        res.json(user.toSafeObject());
    } catch (error) {
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

// PUT /api/user/goals
router.put('/goals', simulateAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.userId,
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
