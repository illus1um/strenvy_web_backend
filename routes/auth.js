const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

const setTokenCookies = (res, accessToken, refreshToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000, // 15 min
        path: '/',
    });
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });
};

const clearTokenCookies = (res) => {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, name } = req.body;

        if (!username || !email || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        if (username.length < 3 || username.length > 30) {
            return res.status(400).json({ error: 'Username must be 3-30 characters' });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        const newUser = await User.create({
            username,
            email,
            password,
            name,
            role: email === 'admin@strenvy.com' ? 'admin' : 'user',
            emailVerificationToken,
            emailVerificationExpires,
            preferences: {
                units: 'metric',
                theme: 'dark',
                notifications: true,
            },
            goals: [],
        });

        try {
            await sendVerificationEmail(email, emailVerificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError.message);
        }

        res.status(201).json({
            message: 'Registration successful. Please check your email to verify your account.',
            user: newUser.toSafeObject(),
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({ error: 'Please verify your email before logging in' });
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshTokens.push(refreshToken);
        // Keep only last 5 refresh tokens
        if (user.refreshTokens.length > 5) {
            user.refreshTokens = user.refreshTokens.slice(-5);
        }
        await user.save();

        setTokenCookies(res, accessToken, refreshToken);
        res.json({ user: user.toSafeObject() });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            req.user.refreshTokens = req.user.refreshTokens.filter(t => t !== refreshToken);
            await req.user.save();
        }
        clearTokenCookies(res);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        clearTokenCookies(res);
        res.json({ message: 'Logged out' });
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || !user.refreshTokens.includes(refreshToken)) {
            clearTokenCookies(res);
            return res.status(401).json({ error: 'Invalid refresh token' });
        }

        // Rotate refresh token
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        if (user.refreshTokens.length > 5) {
            user.refreshTokens = user.refreshTokens.slice(-5);
        }
        await user.save();

        setTokenCookies(res, newAccessToken, newRefreshToken);
        res.json({ user: user.toSafeObject() });
    } catch (error) {
        clearTokenCookies(res);
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
    res.json({ user: req.user.toSafeObject() });
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Verification token required' });
        }

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ error: 'Email verification failed' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal whether email exists
            return res.json({ message: 'If this email is registered, you will receive a password reset link.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        try {
            await sendPasswordResetEmail(email, resetToken);
        } catch (emailError) {
            console.error('Failed to send reset email:', emailError.message);
        }

        res.json({ message: 'If this email is registered, you will receive a password reset link.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to process request' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.refreshTokens = []; // Invalidate all sessions
        await user.save();

        clearTokenCookies(res);
        res.json({ message: 'Password reset successful. Please log in with your new password.' });
    } catch (error) {
        res.status(500).json({ error: 'Password reset failed' });
    }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user || user.isEmailVerified) {
            return res.json({ message: 'If this email needs verification, a new link has been sent.' });
        }

        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        try {
            await sendVerificationEmail(email, emailVerificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError.message);
        }

        res.json({ message: 'If this email needs verification, a new link has been sent.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to resend verification' });
    }
});

module.exports = router;
