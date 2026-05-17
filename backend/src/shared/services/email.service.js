const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

exports.sendPasswordResetEmail = async (to, resetUrl) => {
  await transporter.sendMail({
    from: `"BookShelf" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below (valid for 1 hour):</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you didn't request this, ignore this email.</p>
    `
  });
};