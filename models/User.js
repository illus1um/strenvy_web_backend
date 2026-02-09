const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    preferences: {
        units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
        theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
        notifications: { type: Boolean, default: true },
    },
    goals: {
        type: mongoose.Schema.Types.Mixed,
        default: [],
    },
}, {
    timestamps: true,
});

userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.password;
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
