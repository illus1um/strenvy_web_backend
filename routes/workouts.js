const express = require('express');
const router = express.Router();
const Workout = require('../models/Workout');

// GET /api/workouts
router.get('/', async (req, res) => {
    try {
        const workouts = await Workout.find().lean();
        const result = workouts.map(w => {
            w.id = w._id;
            delete w._id;
            delete w.__v;
            return w;
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workouts' });
    }
});

// POST /api/workouts
router.post('/', async (req, res) => {
    try {
        const workout = await Workout.create(req.body);
        const obj = workout.toObject();
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
        res.status(201).json(obj);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create workout' });
    }
});

// PUT /api/workouts/:id
router.put('/:id', async (req, res) => {
    try {
        const workout = await Workout.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        const obj = workout.toObject();
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
        res.json(obj);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update workout' });
    }
});

// DELETE /api/workouts/:id
router.delete('/:id', async (req, res) => {
    try {
        const workout = await Workout.findByIdAndDelete(req.params.id);
        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete workout' });
    }
});

module.exports = router;
