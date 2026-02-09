const mongoose = require('mongoose');

const workoutExerciseSchema = new mongoose.Schema({
    id: String,
    name: String,
    sets: Number,
    reps: Number,
    weight: Number,
    rest: Number,
}, { _id: false });

const workoutSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    exercises: [workoutExerciseSchema],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Workout', workoutSchema);
