// Backend/middleware/Email.js

const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY,
  process.env.MAILJET_SECRET_KEY
);

// ===================================================
// EMAIL TEMPLATES
// ===================================================

const Verification_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
...
<span class="verification-code">{verificationCode}</span>
...
</html>
`;

const Welcome_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
...
<p class="welcome-message">Hello {name},</p>
...
</html>
`;

const Reset_Password_Template = (code) => `
<!DOCTYPE html>
<html lang="en">
<body>
<h2>Password Reset Request</h2>
<p>Your reset code:</p>
<h1 style="letter-spacing:5px;">${code}</h1>
<p>This code expires in 15 minutes.</p>
</body>
</html>
`;

// ===================================================
// MAILJET SENDER FUNCTION
// ===================================================

async function sendMail(to, subject, html) {
  try {
    const request = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "noreply@yourdomain.com",
            Name: "Talkio",
          },
          To: [
            {
              Email: to,
            },
          ],
          Subject: subject,
          HTMLPart: html,
        },
      ],
    });

    console.log("Mailjet: Email sent", request.body);
    return request.body;
  } catch (error) {
    console.error("Mailjet error:", error);
    throw error;
  }
}

// ===================================================
// PUBLIC EMAIL FUNCTIONS
// ===================================================

// 1. Send Verification Email
const sendVerificationCode = async (email, code) => {
  const html = Verification_Email_Template.replace("{verificationCode}", code);
  return sendMail(email, "Verify your Email", html);
};

// 2. Send Welcome Email
const WelcomeEmail = async (email, name) => {
  const html = Welcome_Email_Template.replace("{name}", name);
  return sendMail(email, "Welcome to Talkio!", html);
};

// 3. Send Reset Password Email
const ResetPasswordEmail = async (email, code) => {
  return sendMail(email, "Reset Your Password", Reset_Password_Template(code));
};

// ===================================================
// EXPORT
// ===================================================

module.exports = {
  sendVerificationCode,
  WelcomeEmail,
  ResetPasswordEmail,
};
