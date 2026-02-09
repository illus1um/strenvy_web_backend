const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
    setNumber: Number,
    weight: { type: Number, default: 0 },
    reps: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
}, { _id: false });

const historyExerciseSchema = new mongoose.Schema({
    id: String,
    name: String,
    bodyPart: String,
    target: String,
    secondaryMuscles: [String],
    sets: [setSchema],
}, { _id: false });

const historySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    programId: String,
    exercises: [historyExerciseSchema],
    duration: Number,
    startedAt: Date,
    completedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('History', historySchema);
