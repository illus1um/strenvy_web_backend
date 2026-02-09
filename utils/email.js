const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

const sendVerificationEmail = async (email, token) => {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"Strenvy" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Verify your email - Strenvy',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #6c63ff; text-align: center;">Strenvy</h1>
                <h2 style="text-align: center;">Email Verification</h2>
                <p>Welcome to Strenvy! Please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyUrl}"
                       style="background-color: #6c63ff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px;">
                        Verify Email
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
                <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
            </div>
        `,
    });
};

const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
        from: `"Strenvy" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Reset your password - Strenvy',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #6c63ff; text-align: center;">Strenvy</h1>
                <h2 style="text-align: center;">Password Reset</h2>
                <p>You requested a password reset. Click the button below to set a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}"
                       style="background-color: #6c63ff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
        `,
    });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
