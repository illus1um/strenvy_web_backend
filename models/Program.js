const mongoose = require('mongoose');

const scheduleExerciseSchema = new mongoose.Schema({
    id: String,
    name: String,
    sets: Number,
    reps: Number,
    rest: Number,
}, { _id: false });

const scheduleDaySchema = new mongoose.Schema({
    name: String,
    exercises: [scheduleExerciseSchema],
}, { _id: false });

const programSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: String,
    duration: Number,
    daysPerWeek: [String],
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    schedule: {
        type: Map,
        of: scheduleDaySchema,
        default: {},
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Program', programSchema);
