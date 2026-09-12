import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudentDashboard from './StudentDashboard';
import './Dashboard.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!storedUser || !token) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) return <div>Loading...</div>;

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">CAREERPULSE</div>
        <div className="nav-user">
          <span className="user-role badge">{user.role}</span>
          <span className="user-email">{user.email}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="dashboard-content">
        {user.role === 'STUDENT' && <StudentDashboard />}
        {user.role === 'FACULTY' && <div>Faculty Dashboard Under Construction</div>}
        {user.role === 'RECRUITER' && <div>Recruiter Dashboard Under Construction</div>}
        {user.role === 'ADMIN' && <div>Admin Dashboard Under Construction</div>}
      </main>
    </div>
  );
}
