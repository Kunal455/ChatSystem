const nodemailer = require("nodemailer");

// ================= TRANSPORTER =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= EMAIL TEMPLATES =================
const Verification_Email_Template = (code) => `
<!DOCTYPE html>
<html>
<body>
  <h2>Email Verification</h2>
  <p>Your verification code is:</p>
  <h1 style="letter-spacing:4px;">${code}</h1>
  <p>This code is valid for 10 minutes.</p>
</body>
</html>
`;

const Welcome_Email_Template = (name) => `
<!DOCTYPE html>
<html>
<body>
  <h2>Welcome to Talkio 🎉</h2>
  <p>Hello <b>${name}</b>,</p>
  <p>Your account has been successfully verified.</p>
</body>
</html>
`;

const Reset_Password_Template = (code) => `
<!DOCTYPE html>
<html>
<body>
  <h2>Password Reset</h2>
  <p>Your reset code:</p>
  <h1>${code}</h1>
  <p>This code expires in 10 minutes.</p>
</body>
</html>
`;

// ================= SEND MAIL =================
const sendMail = async (to, subject, html) => {
  // Development safety
  if (process.env.NODE_ENV === "development") {
    console.log("📧 DEV EMAIL →", to);
    console.log(html);
    return;
  }

  await transporter.sendMail({
    from: `"Talkio" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// ================= PUBLIC FUNCTIONS =================
const sendVerificationCode = async (email, code) => {
  await sendMail(email, "Verify your Email", Verification_Email_Template(code));
};

const WelcomeEmail = async (email, name) => {
  await sendMail(email, "Welcome to Talkio!", Welcome_Email_Template(name));
};

const ResetPasswordEmail = async (email, code) => {
  await sendMail(email, "Reset Your Password", Reset_Password_Template(code));
};

module.exports = {
  sendVerificationCode,
  WelcomeEmail,
  ResetPasswordEmail,
};
