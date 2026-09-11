import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchStats(parsedUser.role);
    }
  }, [navigate]);

  const fetchStats = async (role) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/dashboard/stats?role=${role}`);
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user || !stats) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 className="sidebar-title">CAREERPULSE</h2>
        <div className="nav-items">
          <button className="nav-btn active">Overview</button>
          <button className="nav-btn">Profile</button>
          <button className="nav-btn">Settings</button>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </aside>
      
      <main className="main-content">
        <header>
          <h1>{user.role === 'STUDENT' ? 'Student Dashboard' : 
               user.role === 'FACULTY' ? 'Faculty Dashboard' : 
               user.role === 'RECRUITER' ? 'Recruiter Dashboard' : 'Admin Dashboard'}</h1>
          <p className="user-email">{user.email}</p>
        </header>

        <section className="stats-grid">
          {user.role === 'STUDENT' && (
            <>
              <div className="stat-card">
                <h3>Employability Score</h3>
                <p className="stat-value">{stats.employabilityScore}</p>
              </div>
              <div className="stat-card">
                <h3>Readiness Level</h3>
                <p className="stat-value">{stats.readinessLevel}</p>
              </div>
            </>
          )}

          {(user.role === 'FACULTY' || user.role === 'ADMIN') && (
            <>
              <div className="stat-card">
                <h3>Total Students</h3>
                <p className="stat-value">{stats.totalStudents}</p>
              </div>
              <div className="stat-card">
                <h3>Average Score</h3>
                <p className="stat-value">{stats.averageScore}</p>
              </div>
              <div className="stat-card">
                <h3>Placement Ready</h3>
                <p className="stat-value success">{stats.placementReady}</p>
              </div>
            </>
          )}

          {user.role === 'RECRUITER' && (
            <div className="stat-card">
              <h3>Available Candidates</h3>
              <p className="stat-value">{stats.candidates?.length || 0}</p>
            </div>
          )}
        </section>

        {(user.role === 'FACULTY' || user.role === 'ADMIN') && stats.studentsList && (
          <section className="data-table-section">
            <h3>Student Directory</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {stats.studentsList.map(s => (
                  <tr key={s.userId}>
                    <td>{s.firstName}</td>
                    <td>{s.lastName}</td>
                    <td>{s.employabilityScore || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
}
