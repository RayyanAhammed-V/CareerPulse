import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './PortalLogin.css';

export default function ChangePassword() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (response.data.token) {
        localStorage.setItem('careernav_token', response.data.token);
      }

      setSuccess('Password updated successfully! Redirecting to your dashboard...');
      
      const role = localStorage.getItem('careernav_role');
      setTimeout(() => {
        if (role === 'ROLE_ADMIN') navigate('/admin/dashboard');
        else if (role === 'ROLE_FACULTY') navigate('/faculty/dashboard');
        else if (role === 'ROLE_RECRUITER') navigate('/recruiter/dashboard');
        else navigate('/student/dashboard');
      }, 1500);

    } catch (err) {
      const msg = err.response?.data?.error || 'Unable to update password. Please verify current credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-login-wrapper">
      <div className="login-card card" style={{ maxWidth: '440px' }}>
        <div className="login-header">
          <div className="portal-badge-label" style={{ backgroundColor: 'rgba(234, 179, 8, 0.12)', color: '#FACC15', borderColor: 'rgba(234, 179, 8, 0.3)' }}>
            Security Required
          </div>
          <h2 className="login-subtitle">Set New Permanent Password</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            A password reset was requested or a temporary password was issued. Please set your permanent password to continue.
          </p>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="currentPassword">Current / Temporary Password</label>
            <input
              id="currentPassword"
              type="password"
              placeholder="Enter current or temporary password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">New Password (min 6 chars) *</label>
            <input
              id="newPassword"
              type="password"
              placeholder="Enter secure new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password *</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Updating Password...' : 'Save Permanent Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
