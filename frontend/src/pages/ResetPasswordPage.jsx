import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { validateResetToken, resetPassword } from '../services/api';
import '../styles/PasswordPages.css';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [strength, setStrength] = useState({ score: 0, text: 'Too short', class: 'weak' });

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await validateResetToken(token);
        setIsTokenValid(true);
      } catch (err) {
        setIsTokenValid(false);
        setError('Token invalid or expired. Please request a new link.');
      } finally {
        setIsValidating(false);
      }
    };
    verifyToken();
  }, [token]);

  // Evaluate password strength
  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, text: 'Too short', class: 'weak' });
      return;
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[!@#$%^&*]/.test(password)) score += 1;

    let text = 'Weak';
    let className = 'weak';

    if (score === 4) {
      text = 'Strong';
      className = 'strong';
    } else if (score >= 2) {
      text = 'Medium';
      className = 'medium';
    }

    setStrength({ score, text, class: className });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      setError('Password must contain an uppercase letter, a number, and a special character');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPassword(token, password);
      setMessage(response.data.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to reset password. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    password &&
    confirmPassword &&
    password === confirmPassword &&
    strength.score === 4;

  if (isValidating) {
    return (
      <div className="password-page-container">
        <div className="password-right-panel" style={{ flex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 20px auto', width: '40px', height: '40px' }}></div>
            <p style={{ color: '#a89f91' }}>Verifying reset token security...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="password-page-container">
      <div className="password-left-panel">
        <div className="brand-showcase">
          <h1>Velocity Studio</h1>
          <p>Please construct a robust new password to secure your account. A combination of upper/lowercase letters, numerals, and special characters is mandatory.</p>
          <div className="instruction-list">
            <h3>Password Policy</h3>
            <ul>
              <li>Minimum length of 8 characters.</li>
              <li>At least one uppercase alphabetical character (A-Z).</li>
              <li>At least one numeric digit (0-9).</li>
              <li>At least one special character (!@#$%^&*).</li>
              <li>Cannot contain spaces or match your email address.</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="password-right-panel">
        <div className="password-form-box">
          <h2>Create New Password</h2>
          <p className="subtitle">Please configure your new login credentials.</p>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {isTokenValid ? (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="password-strength-meter">
                  <div className="strength-bar">
                    <div className={`strength-bar-fill ${strength.class}`}></div>
                  </div>
                  <span className="strength-text">Strength: {strength.text}</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || !isFormValid}
              >
                {isSubmitting ? <div className="spinner"></div> : 'Reset Password'}
              </button>
            </form>
          ) : (
            <Link to="/forgot-password" className="btn-primary" style={{ textDecoration: 'none' }}>
              Request New Link
            </Link>
          )}

          <Link to="/login" className="back-to-login">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
