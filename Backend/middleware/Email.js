// Backend/middleware/Email.js

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// =============================
// EMAIL TEMPLATE FUNCTIONS
// =============================

// 1️⃣ Verification Email Template
const getVerificationTemplate = (code) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; }
        .container {
            max-width: 600px; margin: 30px auto; background: #fff;
            border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            overflow: hidden; border: 1px solid #ddd;
        }
        .header { background: #4CAF50; color: #fff; padding: 20px; text-align: center; font-size: 26px; font-weight: bold; }
        .content { padding: 25px; color: #333; line-height: 1.8; }
        .verification-code {
            display: block; margin: 20px 0; font-size: 22px; color: #4CAF50;
            background: #e8f5e9; border: 1px dashed #4CAF50;
            padding: 10px; text-align: center; border-radius: 5px;
            font-weight: bold; letter-spacing: 2px;
        }
        .footer {
            background: #f4f4f4; padding: 15px; text-align: center;
            color: #777; font-size: 12px; border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Verify Your Email</div>
        <div class="content">
            <p>Hello,</p>
            <p>Thank you for signing up! Please enter the verification code below:</p>
            <span class="verification-code">${code}</span>
            <p>If you didn't create an account, no further action is required.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Talkio. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;


// 2️⃣ Welcome Email Template
const getWelcomeTemplate = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome Email</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; }
        .container {
            max-width: 600px; margin: 30px auto; background: #fff;
            border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            overflow: hidden; border: 1px solid #ddd;
        }
        .header { background: #007BFF; color: #fff; padding: 20px; text-align: center; font-size: 26px; font-weight: bold; }
        .content { padding: 25px; line-height: 1.8; }
        .footer {
            background: #f4f4f4; padding: 15px; text-align: center;
            color: #777; font-size: 12px; border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Welcome to Talkio!</div>
        <div class="content">
            <p>Hello ${name},</p>
            <p>We're thrilled to have you join our community!</p>
            <p>Enjoy exploring new features and connecting with amazing people.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Talkio. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;


// 3️⃣ Reset Password Template
const getResetPasswordTemplate = (code) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; padding: 20px;">
    <h2>Password Reset Request</h2>
    <p>Your reset code:</p>
    <h1 style="letter-spacing: 5px; color: #d9534f;">${code}</h1>
    <p>This code expires in 15 minutes.</p>
</body>
</html>
`;


// =============================
// SEND EMAIL FUNCTIONS
// =============================

const sendVerificationCode = async (email, code) => {
    try {
        const response = await resend.emails.send({
            from: "Talkio <onboarding@resend.dev>",
            to: email,
            subject: "Verify Your Email",
            html: getVerificationTemplate(code),
        });

        console.log("Verification email sent:", response);
        return response;
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw error;
    }
};


const WelcomeEmail = async (email, name) => {
    try {
        const response = await resend.emails.send({
            from: "Talkio <onboarding@resend.dev>",
            to: email,
            subject: "Welcome to Talkio!",
            html: getWelcomeTemplate(name),
        });

        console.log("Welcome email sent:", response);
        return response;
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw error;
    }
};


const ResetPasswordEmail = async (email, code) => {
    try {
        const response = await resend.emails.send({
            from: "Talkio <onboarding@resend.dev>",
            to: email,
            subject: "Reset Your Password",
            html: getResetPasswordTemplate(code),
        });

        console.log("Reset password email sent:", response);
        return response;
    } catch (error) {
        console.error("Error sending reset password email:", error);
        throw error;
    }
};


// EXPORT
module.exports = {
    sendVerificationCode,
    WelcomeEmail,
    ResetPasswordEmail,
};
