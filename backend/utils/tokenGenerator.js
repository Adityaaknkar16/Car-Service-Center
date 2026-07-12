const crypto = require('crypto');

/**
 * Generates a cryptographically secure random token and its hash.
 * @returns {Object} { token: String (raw), hashedToken: String }
 */
const generateResetToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hashedToken };
};

/**
 * Verifies if a raw token matches a hashed token.
 * @param {string} token - Raw reset token
 * @param {string} hashedToken - Hashed token from database
 * @returns {boolean} True if they match
 */
const verifyResetToken = (token, hashedToken) => {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return hash === hashedToken;
};

module.exports = {
  generateResetToken,
  verifyResetToken,
};
