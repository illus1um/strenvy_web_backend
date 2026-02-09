const express = require('express');
const router = express.Router();
const Exercise = require('../models/Exercise');

const getImageId = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
};

// GET /api/exercises
router.get('/', async (req, res) => {
    try {
        const exercises = await Exercise.find().lean();
        const transformed = exercises.map(exercise => ({
            ...exercise,
            localGif: `/gifs/${getImageId(exercise.gifUrl)}.gif`,
            localPng: `/gifs/${getImageId(exercise.gifUrl)}.png`,
        }));
        res.json(transformed);
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ error: 'Failed to fetch exercises' });
    }
});

module.exports = router;
