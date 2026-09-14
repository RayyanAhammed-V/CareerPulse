import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient, { prewarmServer, extractErrorMessage } from '../api/client';
import './PortalLogin.css';

export default function StudentSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    prewarmServer();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide a contact phone number.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/auth/student/signup', formData);
      setSuccess('Account created successfully! Redirecting to Student Login...');
      setTimeout(() => {
        navigate('/student/login');
      }, 1500);
    } catch (err) {
      const msg = extractErrorMessage(err, 'Registration failed. Please check your network and try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-login-wrapper">
      <div className="login-card card" style={{ maxWidth: '520px' }}>
        <div className="login-header">
          <Link to="/" className="login-brand-link">
            <div className="brand-icon">CN</div>
            <span className="brand-text">CAREER NAVIGATOR</span>
          </Link>
          <div className="portal-badge-label">Student Registration</div>
          <h2 className="login-subtitle">Create Student Account</h2>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="e.g. John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="student@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Data Science & AI">Data Science & AI</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="degree">Degree *</label>
              <select
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                required
              >
                <option value="B.Tech">B.Tech</option>
                <option value="B.E.">B.E.</option>
                <option value="B.S.">B.S.</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MCA">MCA</option>
              </select>
            </div>
          </div>

          <div className="form-row-2col">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="password-input-wrap">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-type password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: '-10px' }}>
            <button
              type="button"
              className="toggle-password-btn"
              style={{ position: 'static' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide Passwords' : 'Show Passwords'}
            </button>
          </div>

          <button
            type="submit"
            className="btn-primary login-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="signup-prompt">
          <span>Already have an account? </span>
          <Link to="/student/login" className="signup-link">
            Sign In to Student Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
