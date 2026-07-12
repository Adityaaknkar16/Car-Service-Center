const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer. Falls back to console logging in development if email credentials are not set.
 * @param {Object} options - Email options { email, subject, html }
 * @returns {Promise<boolean>} Resolves to true if sent successfully
 */
const sendEmail = async (options) => {
  const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

  if (!isEmailConfigured) {
    console.log('\n==================================================');
    console.log('✉️  EMAIL SENT (DEVELOPMENT LOG)');
    console.log(`To:      ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log('HTML CONTENT:');
    console.log(options.html);
    console.log('==================================================\n');
    return true;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_SENDER || `"Velocity Studio" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending email via Nodemailer:', error);
    throw error;
  }
};

module.exports = sendEmail;
