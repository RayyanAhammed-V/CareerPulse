import { useState, useEffect } from 'react';
import axios from 'axios';

export default function RecruiterDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/recruiter/students`);
        setStudents(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) return <div>Loading candidates...</div>;

  return (
    <div className="role-dashboard">
      <div className="card">
        <h2>Recruiter Dashboard</h2>
        <p>Candidate Search and Shortlisting</p>
      </div>

      <div className="list-card">
        <h3>Top Candidates</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Employability Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.sort((a,b) => (b.employabilityScore||0) - (a.employabilityScore||0)).map(s => (
              <tr key={s.userId}>
                <td>{s.firstName} {s.lastName}</td>
                <td><strong>{s.employabilityScore || 0}</strong></td>
                <td><button onClick={() => alert('Shortlisted!')}>Shortlist</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
