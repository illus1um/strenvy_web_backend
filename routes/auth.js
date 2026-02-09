const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = await User.create({
            email,
            password,
            name,
            role: email === 'admin@strenvy.com' ? 'admin' : 'user',
            preferences: {
                units: 'metric',
                theme: 'dark',
                notifications: true,
            },
            goals: [],
        });

        res.status(201).json(newUser.toSafeObject());
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json(user.toSafeObject());
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
