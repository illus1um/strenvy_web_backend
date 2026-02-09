const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
    },
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
        minlength: 6,
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
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshTokens: [String],
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

// Hash password before save
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

// Return user without sensitive fields
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshTokens;
    delete obj.emailVerificationToken;
    delete obj.emailVerificationExpires;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    delete obj.__v;
    obj.id = obj._id;
    delete obj._id;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
