const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Testing Email Configuration...");
console.log("User:", process.env.EMAIL_USER);
// Don't log the password!

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendTestEmail = async () => {
    try {
        console.log("Attempting to send test email...");
        const info = await transporter.sendMail({
            from: `"Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: "Test Email from Chat App",
            text: "If you see this, your email configuration is working!",
        });
        console.log("✅ Email sent successfully!");
        console.log("Message ID:", info.messageId);
    } catch (error) {
        console.error("❌ Failed to send email.");
        console.error("Error:", error.message);
        if (error.response) {
            console.error("SMTP Response:", error.response);
        }
    }
};

sendTestEmail();
