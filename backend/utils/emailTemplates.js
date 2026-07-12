/**
 * Generates HTML email template for password reset.
 * @param {string} userName - Name of the user
 * @param {string} resetLink - The recovery URL
 * @returns {string} HTML content
 */
const getPasswordResetTemplate = (userName, resetLink) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #1a1a1a; color: #e8dcc8; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #d4af37; padding-bottom: 20px; }
    .header h1 { color: #d4af37; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
    .content { background: #2a2a2a; padding: 30px; border-radius: 6px; border: 1px solid #3a3a3a; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { 
      display: inline-block; 
      padding: 12px 30px; 
      background: #d4af37; 
      color: #1a1a1a !important; 
      text-decoration: none; 
      border-radius: 4px; 
      font-weight: bold; 
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: background 0.3s ease;
    }
    .button:hover { background: #f3cf65; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #333; padding-top: 20px; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Velocity Studio</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>You requested a password reset for your Velocity Studio account. Click the button below to reset your password:</p>
      <div class="button-container">
        <a href="${resetLink}" class="button" target="_blank">Reset Password</a>
      </div>
      <p>This link expires in <strong>1 hour</strong>. If you didn't request this reset, you can safely ignore this email and your password will remain unchanged.</p>
      <p>If the button above doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #d4af37;"><small>${resetLink}</small></p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Velocity Studio. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generates HTML email template for password change confirmation.
 * @param {string} userName - Name of the user
 * @returns {string} HTML content
 */
const getPasswordChangedTemplate = (userName) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 20px auto; padding: 20px; background: #1a1a1a; color: #e8dcc8; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 1px solid #d4af37; padding-bottom: 20px; }
    .header h1 { color: #d4af37; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
    .content { background: #2a2a2a; padding: 30px; border-radius: 6px; border: 1px solid #3a3a3a; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999; border-top: 1px solid #333; padding-top: 20px; }
    p { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Velocity Studio</h1>
    </div>
    <div class="content">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>This is a confirmation that the password for your Velocity Studio account has been successfully changed.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Velocity Studio. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = {
  getPasswordResetTemplate,
  getPasswordChangedTemplate,
};
