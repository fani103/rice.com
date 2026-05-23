/**
 * FANEESH RICE SHOP — sendEmail utility
 * backend/utils/sendEmail.js
 */

const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER / EMAIL_PASS not set — skipping email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // 16-char Gmail App Password
    },
  });

  const info = await transporter.sendMail({
    from: `"${process.env.SHOP_NAME || 'Faneesh Rice Shop'}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`✅ Email sent to ${to} — ${info.messageId}`);
};

module.exports = sendEmail;