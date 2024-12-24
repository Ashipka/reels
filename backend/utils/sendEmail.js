const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  auth: {
    type: "OAuth2",
    user: "oleksandr.shypka@makemereels.com",
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN                           
  }
});

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Make me reels" <${process.env.EMAIL_FROM}>`, // Sender address
      to, // Receiver address
      subject, // Subject line
      html, // HTML body
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw err;
  }
};

module.exports = sendEmail;
