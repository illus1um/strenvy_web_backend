const express = require('express');
const router = express.Router();
const History = require('../models/History');
const { authenticate } = require('../middleware/auth');

// GET /api/history
router.get('/', authenticate, async (req, res) => {
    try {
        const history = await History.find({ userId: req.user._id }).sort({ completedAt: -1 }).lean();
        const result = history.map(h => {
            h.id = h._id;
            delete h._id;
            delete h.__v;
            return h;
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workout history' });
    }
});

// POST /api/history
router.post('/', authenticate, async (req, res) => {
    try {
        const entry = await History.create({
            ...req.body,
            userId: req.user._id,
            completedAt: new Date(),
        });
        const obj = entry.toObject();
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
        res.status(201).json(obj);
    } catch (error) {
        res.status(500).json({ error: 'Failed to log workout' });
    }
});

// PUT /api/history/:id
router.put('/:id', authenticate, async (req, res) => {
    try {
        const entry = await History.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!entry) {
            return res.status(404).json({ error: 'History entry not found' });
        }
        const obj = entry.toObject();
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
        res.json(obj);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update workout log' });
    }
});

// DELETE /api/history/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const entry = await History.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!entry) {
            return res.status(404).json({ error: 'History entry not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete workout log' });
    }
});

module.exports = router;
