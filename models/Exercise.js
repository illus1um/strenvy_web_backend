const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    bodyPart: {
        type: String,
        required: true,
    },
    equipment: {
        type: String,
        required: true,
    },
    target: {
        type: String,
        required: true,
    },
    gifUrl: String,
    secondaryMuscles: [String],
    instructions: [String],
}, {
    timestamps: true,
});

module.exports = mongoose.model('Exercise', exerciseSchema);
