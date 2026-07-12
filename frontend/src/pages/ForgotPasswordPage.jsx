import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';
import '../styles/PasswordPages.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (val) => {
    return /^\S+@\S+\.\S+$/.test(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setMessage(response.data.message || 'Check your email for a password reset link. It expires in 1 hour.');
      setCountdown(60);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Connection lost. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-page-container">
      <div className="password-left-panel">
        <div className="brand-showcase">
          <h1>Velocity Studio</h1>
          <p>Luxury Auto Detailing & Premier Car Service Center. Restore, protect, and maintain your vehicle to pristine conditions.</p>
          <div className="instruction-list">
            <h3>Password Recovery Instructions</h3>
            <ul>
              <li>Enter your registered email address on the password reset form.</li>
              <li>A cryptographically secure link will be dispatched to your inbox.</li>
              <li>Click the link to verify your identity and enter a new password.</li>
              <li>For security, this link expires after exactly 1 hour.</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="password-right-panel">
        <div className="password-form-box">
          <h2>Recover Password</h2>
          <p className="subtitle">Enter your email and we'll send you a link to reset your password.</p>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || countdown > 0}
            >
              {loading ? (
                <div className="spinner"></div>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          <Link to="/login" className="back-to-login">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
