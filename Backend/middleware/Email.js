const { transporter } = require("./Email.config.js");

const Verification_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Verify Your Email</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>Hello,</p>
        <p>Thank you for signing up! Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
        </div>
        <p>Enter this code on the verification page to complete your registration.</p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <p>Best regards,<br>Talkio Team</p>
    </div>
    <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
        <p>This is an automated message, please do not reply to this email.</p>
    </div>
</body>
</html>
`;

const Welcome_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Talkio</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to Talkio!</h1>
    </div>
    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
        <p>Hello {name},</p>
        <p>We're excited to have you on board!</p>
        <p>Start chatting with your friends and connecting with new people.</p>
        <p>Best regards,<br>Talkio Team</p>
    </div>
</body>
</html>
`;

const sendVerificationCode = async (email, VerificationCode) => {
    try {
        const response = await transporter.sendMail({
            from: `"Talkio" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your Email",
            text: "Verify your Email",
            html: Verification_Email_Template.replace("{verificationCode}", VerificationCode),
        })
        console.log("email send successfully", response)
        return response;
    } catch (error) {
        console.error("Error sending verification email:", error);
        throw error;
    }
}

const WelcomeEmail = async (email, name) => {
    try {
        const response = await transporter.sendMail({
            from: `"Talkio" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Welcome to Talkio",
            text: "Welcome to Talkio",
            html: Welcome_Email_Template.replace("{name}", name),
        })
        console.log("email send successfully", response)
        return response;
    } catch (error) {
        console.error("Error sending welcome email:", error);
        throw error;
    }
}


const ResetPasswordEmail = async (email, code) => {
    try {
        const response = await transporter.sendMail({
            from: `"Talkio" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset Your Password",
            html: `
        <h2>Password Reset Request</h2>
        <p>Your reset code is:</p>
        <h1 style="letter-spacing: 5px;">${code}</h1>
        <p>This code expires in 15 minutes.</p>
      `,
        });
        console.log("Reset Email Sent:", response);
        return response;
    } catch (error) {
        console.error("Error sending reset password email:", error);
        throw error;
    }
};

module.exports = { sendVerificationCode, WelcomeEmail, ResetPasswordEmail };


