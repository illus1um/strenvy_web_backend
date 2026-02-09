const express = require('express');
const router = express.Router();
const User = require('../models/User');

const simulateAuth = (req, res, next) => {
    next();
};

// GET /api/users
router.get('/', simulateAuth, async (req, res) => {
    try {
        const users = await User.find().lean();
        const safeUsers = users.map(user => {
            delete user.password;
            user.id = user._id;
            delete user._id;
            delete user.__v;
            return user;
        });
        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /api/users
router.post('/', simulateAuth, async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = await User.create({
            email,
            password,
            name,
            role: role || 'user',
            preferences: {
                units: 'metric',
                theme: 'dark',
                notifications: true,
            },
            goals: [],
        });

        res.status(201).json(newUser.toSafeObject());
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// PUT /api/users/:id
router.put('/:id', simulateAuth, async (req, res) => {
    try {
        const updates = { ...req.body };
        delete updates.id;
        if (!updates.password) {
            delete updates.password;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.toSafeObject());
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// DELETE /api/users/:id
router.delete('/:id', simulateAuth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;
