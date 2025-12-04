const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️  Email credentials missing in .env file!");
} else {
  console.log("✅ Email configuration loaded for:", process.env.EMAIL_USER);
}

module.exports = { transporter };