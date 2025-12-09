const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// ================= EMAIL TEMPLATES =================

// Verification Email Template
const Verification_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<body>
    <h2>Verify Your Email</h2>
    <p>Your verification code:</p>
    <h1 style="letter-spacing: 5px; color: green;">{verificationCode}</h1>
    <p>This code expires in 15 minutes.</p>
</body>
</html>
`;

// Welcome Email Template
const Welcome_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<body>
    <h2>Welcome to Talkio!</h2>
    <p>Hello {name}, we're excited to have you on board!</p>
</body>
</html>
`;

// ================= SEND EMAIL FUNCTIONS =================

// 1. Send Verification Code
const sendVerificationCode = async (email, code) => {
    try {
        const response = await resend.emails.send({
            from: "Talkio <noreply@yourdomain.com>",
            to: email,
            subject: "Verify your Email",
            html: Verification_Email_Template.replace("{verificationCode}", code),
        });

        console.log("Verification email sent (Resend):", response);
        return response;
    } catch (error) {
        console.error("Resend Error (Verification):", error);
        throw error;
    }
};

// 2. Send Welcome Email
const WelcomeEmail = async (email, name) => {
    try {
        const response = await resend.emails.send({
            from: "Talkio <noreply@yourdomain.com>",
            to: email,
            subject: "Welcome to Talkio",
            html: Welcome_Email_Template.replace("{name}", name),
        });

        console.log("Welcome email sent (Resend):", response);
        return response;
    } catch (error) {
        console.error("Resend Error (Welcome):", error);
        throw error;
    }
};

// 3. Send Reset Password Email
const ResetPasswordEmail = async (email, code) => {
    try {
        const response = await resend.emails.send({
            from: "Talkio <noreply@yourdomain.com>",
            to: email,
            subject: "Reset Your Password",
            html: `
                <h2>Password Reset Request</h2>
                <p>Your reset code:</p>
                <h1 style="letter-spacing: 5px;">${code}</h1>
                <p>This code expires in 15 minutes.</p>
            `,
        });

        console.log("Reset password email sent (Resend):", response);
        return response;
    } catch (error) {
        console.error("Resend Error (Reset Password):", error);
        throw error;
    }
};

// EXPORT ALL FUNCTIONS
module.exports = {
    sendVerificationCode,
    WelcomeEmail,
    ResetPasswordEmail,
};
