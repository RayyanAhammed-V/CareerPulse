import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import './PortalLogin.css';

export default function PortalLogin({
  portalType,
  title,
  subtitle,
  apiEndpoint,
  allowSignup,
  dashboardRoute
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post(apiEndpoint, {
        email: email.trim(),
        password: password
      });

      const { token, user, role, passwordResetRequired } = response.data;

      // Save token and user details in localStorage
      localStorage.setItem('careernav_token', token);
      localStorage.setItem('careernav_user', JSON.stringify(user));
      localStorage.setItem('careernav_role', role);

      // Handle temporary password forced change
      if (passwordResetRequired) {
        navigate('/change-password');
        return;
      }

      // Navigate to respective dashboard
      navigate(dashboardRoute);
    } catch (err) {
      const msg = err.response?.data?.error || 'Unable to connect to Career Navigator. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-login-wrapper">
      <div className="login-card card">
        {/* Header / Brand */}
        <div className="login-header">
          <Link to="/" className="login-brand-link">
            <div className="brand-icon">CN</div>
            <span className="brand-text">CAREER NAVIGATOR</span>
          </Link>
          <div className="portal-badge-label">{title}</div>
          <h2 className="login-subtitle">{subtitle}</h2>
        </div>

        {error && <div className="alert-error" role="alert">{error}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. name@careernavigator.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className="forgot-link"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot Password?
              </button>
            </div>
            <div className="password-input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Signup / Provisioning Prompt */}
        {portalType !== 'admin' ? (
          <div className="signup-prompt">
            <span>Don't have an account? </span>
            <Link to={`/signup?role=${portalType}`} className="signup-link">
              Create {portalType.charAt(0).toUpperCase() + portalType.slice(1)} Account
            </Link>
          </div>
        ) : (
          <div className="privileged-prompt">
            <span>Administrative access is strictly restricted.</span>
          </div>
        )}

        <div className="back-to-home">
          <Link to="/">← Back to Portals</Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Account Recovery</h3>
            <p className="modal-message">
              Please contact your <strong>Career Navigator administrator</strong> to recover your account.
            </p>
            <p className="modal-instruction">
              Your administrator can generate a secure temporary credential for you to regain access.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={() => setShowForgotModal(false)}
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
