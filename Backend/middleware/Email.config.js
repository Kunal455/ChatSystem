const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "kk6547015@gmail.com",
    pass: "ykbt febz ynme gxan",
  },
});

module.exports = { transporter };