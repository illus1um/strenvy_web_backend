const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');
const { authenticate, requireAdmin } = require('../middleware/auth');

const getImageId = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
};

const transformExercise = (exercise) => ({
    ...exercise,
    localGif: `/gifs/${getImageId(exercise.gifUrl)}.gif`,
    localPng: `/gifs/${getImageId(exercise.gifUrl)}.png`,
});

// GET /api/exercises
router.get('/', async (req, res) => {
    try {
        const exercises = await Exercise.find().lean();
        res.json(exercises.map(transformExercise));
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

// PUT /api/exercises/:id
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const { name, bodyPart, equipment, target, secondaryMuscles, instructions } = req.body;
        const exercise = await Exercise.findOneAndUpdate(
            { id: req.params.id },
            { name, bodyPart, equipment, target, secondaryMuscles, instructions },
            { new: true, runValidators: true }
        );
        if (!exercise) {
            return res.status(404).json({ error: 'Exercise not found' });
        }
        const obj = exercise.toObject();
        res.json(transformExercise(obj));
    } catch (error) {
        res.status(500).json({ error: 'Failed to update exercise' });
    }
});

module.exports = router;
