const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

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

// ================= SEND MAIL (RESEND) =================
const sendMail = async (to, subject, html) => {
  try {
    // ✅ DEV MODE (local testing)
    if (process.env.NODE_ENV !== "production") {
      console.log("📧 DEV EMAIL →", to);
      console.log("SUBJECT:", subject);
      console.log(html);
      return true;
    }

    // ✅ PRODUCTION MODE
    await resend.emails.send({
      from: "Talkio <no-reply@talkio.space>", // 🔥 FIXED
      to,
      subject,
      html,
    });

    console.log("✅ Email sent via Resend →", to);
    return true;

  } catch (error) {
    console.error("❌ Resend email failed:", error);
    return false;
  }
};

// ================= PUBLIC FUNCTIONS =================
const sendVerificationCode = async (email, code) => {
  return sendMail(
    email,
    "Verify your Email",
    Verification_Email_Template(code)
  );
};

const WelcomeEmail = async (email, name) => {
  return sendMail(
    email,
    "Welcome to Talkio!",
    Welcome_Email_Template(name)
  );
};

const ResetPasswordEmail = async (email, code) => {
  return sendMail(
    email,
    "Reset Your Password",
    Reset_Password_Template(code)
  );
};

module.exports = {
  sendVerificationCode,
  WelcomeEmail,
  ResetPasswordEmail,
};
