import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import './PortalLogin.css';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine initial role from URL query param if present (e.g. ?role=faculty)
  const queryRole = new URLSearchParams(location.search).get('role');
  const getInitialRole = () => {
    if (queryRole === 'faculty') return 'ROLE_FACULTY';
    if (queryRole === 'recruiter') return 'ROLE_RECRUITER';
    return 'ROLE_STUDENT';
  };

  const [role, setRole] = useState(getInitialRole());
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech',
    company: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: role,
        department: formData.department,
        degree: formData.degree,
      };

      await apiClient.post('/api/auth/signup', payload);
      
      const roleLabel = role === 'ROLE_FACULTY' ? 'Faculty' : role === 'ROLE_RECRUITER' ? 'Recruiter' : 'Student';
      const redirectPath = role === 'ROLE_FACULTY' ? '/faculty/login' : role === 'ROLE_RECRUITER' ? '/recruiter/login' : '/student/login';

      setSuccess(`Account registered successfully as ${roleLabel}! Redirecting to login...`);
      setTimeout(() => {
        navigate(redirectPath);
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please check your network and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-login-wrapper">
      <div className="login-card card" style={{ maxWidth: '540px' }}>
        <div className="login-header">
          <Link to="/" className="login-brand-link">
            <div className="brand-icon">CN</div>
            <span className="brand-text">CAREER NAVIGATOR</span>
          </Link>
          <div className="portal-badge-label">Account Onboarding</div>
          <h2 className="login-subtitle">Create Your Account</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Select your platform role to get started with Career Navigator
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          <button
            type="button"
            className={role === 'ROLE_STUDENT' ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '8px 12px', fontSize: '13px' }}
            onClick={() => setRole('ROLE_STUDENT')}
          >
            🎓 Student
          </button>
          <button
            type="button"
            className={role === 'ROLE_FACULTY' ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '8px 12px', fontSize: '13px' }}
            onClick={() => setRole('ROLE_FACULTY')}
          >
            👨‍🏫 Faculty
          </button>
          <button
            type="button"
            className={role === 'ROLE_RECRUITER' ? 'btn-primary' : 'btn-outline'}
            style={{ padding: '8px 12px', fontSize: '13px' }}
            onClick={() => setRole('ROLE_RECRUITER')}
          >
            💼 Recruiter
          </button>
        </div>

        {error && <div className="alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
        {success && <div className="alert-success" style={{ marginBottom: '16px' }}>{success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name *</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder={role === 'ROLE_FACULTY' ? 'e.g. Dr. Jane Smith' : role === 'ROLE_RECRUITER' ? 'e.g. Alex Johnson' : 'e.g. John Doe'}
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Contact Phone *</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 555 0192"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Role-specific fields */}
          {role === 'ROLE_STUDENT' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="department">Department *</label>
                <select id="department" name="department" value={formData.department} onChange={handleChange}>
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="degree">Degree Program *</label>
                <select id="degree" name="degree" value={formData.degree} onChange={handleChange}>
                  <option value="B.Tech">B.Tech</option>
                  <option value="B.E.">B.E.</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="B.Sc CS">B.Sc CS</option>
                </select>
              </div>
            </div>
          )}

          {role === 'ROLE_FACULTY' && (
            <div className="form-group">
              <label htmlFor="department">Department / Faculty Specialization *</label>
              <select id="department" name="department" value={formData.department} onChange={handleChange}>
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Applied Sciences & Humanities">Applied Sciences & Humanities</option>
              </select>
            </div>
          )}

          {role === 'ROLE_RECRUITER' && (
            <div className="form-group">
              <label htmlFor="company">Company / Organization Name *</label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="e.g. Acme Technologies Inc."
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label htmlFor="password">Password *</label>
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
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input
              type="checkbox"
              id="showPass"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              style={{ cursor: 'pointer', width: 'auto', accentColor: 'var(--color-green-primary)' }}
            />
            <label htmlFor="showPass" style={{ margin: 0, fontSize: '13px', cursor: 'pointer', color: 'var(--text-dim)' }}>
              Show Passwords
            </label>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : `Register as ${role === 'ROLE_FACULTY' ? 'Faculty' : role === 'ROLE_RECRUITER' ? 'Recruiter' : 'Student'}`}
          </button>
        </form>

        <div className="login-footer" style={{ marginTop: '20px' }}>
          <span>Already have an account? </span>
          {role === 'ROLE_FACULTY' ? (
            <Link to="/faculty/login" className="login-link">Faculty Sign In</Link>
          ) : role === 'ROLE_RECRUITER' ? (
            <Link to="/recruiter/login" className="login-link">Recruiter Sign In</Link>
          ) : (
            <Link to="/student/login" className="login-link">Student Sign In</Link>
          )}
        </div>
      </div>
    </div>
  );
}
