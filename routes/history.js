const express = require('express');
const router = express.Router();
const History = require('../models/History');

// GET /api/history
router.get('/', async (req, res) => {
    try {
        const history = await History.find().sort({ completedAt: -1 }).lean();
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
router.post('/', async (req, res) => {
    try {
        const entry = await History.create({
            ...req.body,
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
router.put('/:id', async (req, res) => {
    try {
        const entry = await History.findByIdAndUpdate(
            req.params.id,
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
router.delete('/:id', async (req, res) => {
    try {
        const entry = await History.findByIdAndDelete(req.params.id);
        if (!entry) {
            return res.status(404).json({ error: 'History entry not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete workout log' });
    }
});

module.exports = router;
