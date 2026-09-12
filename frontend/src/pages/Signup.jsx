import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        firstName,
        lastName,
        email,
        password
      });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">CAREERPULSE</h1>
        <p className="login-subtitle">Create a Student Account</p>
        
        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label>First Name</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Last Name</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="switch-auth">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
