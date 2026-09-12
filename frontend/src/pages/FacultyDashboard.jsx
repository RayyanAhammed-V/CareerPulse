import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FacultyDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/faculty/students`);
        setStudents(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <div>Loading students...</div>;

  return (
    <div className="role-dashboard">
      <div className="card">
        <h2>Faculty Dashboard</h2>
        <p>Student Analytics and Monitoring</p>
      </div>

      <div className="list-card">
        <h3>All Students ({students.length})</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Employability Score</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.userId}>
                <td>{s.firstName} {s.lastName}</td>
                <td>{s.user?.email}</td>
                <td><strong>{s.employabilityScore || 0}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
