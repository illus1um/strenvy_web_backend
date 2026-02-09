const mongoose = require('mongoose');

const historyExerciseSchema = new mongoose.Schema({
    id: String,
    name: String,
    sets: Number,
    reps: Number,
    weight: Number,
    bodyPart: String,
    target: String,
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
    exercises: [historyExerciseSchema],
    completedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('History', historySchema);
