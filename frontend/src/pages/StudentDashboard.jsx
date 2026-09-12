import { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentDashboard() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ type: 'skill', name: '', description: '' });

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`);
      setProfileData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/profile/${newItem.type}`, newItem);
      setNewItem({ ...newItem, name: '', description: '' });
      fetchProfile(); // Refresh data
    } catch (err) {
      alert('Error adding item');
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!profileData) return <div>Error loading profile</div>;

  const { student, skills, projects, internships, certifications, hackathons } = profileData;

  return (
    <div className="student-dashboard">
      <div className="profile-header card">
        <h2>{student.firstName} {student.lastName}</h2>
        <div className="score-badge">
          <h3>Employability Score</h3>
          <div className="score-circle">{student.employabilityScore || 0}</div>
        </div>
      </div>

      <div className="add-item-form card">
        <h3>Add New Record</h3>
        <form onSubmit={handleAddItem} className="flex-form">
          <select value={newItem.type} onChange={e => setNewItem({...newItem, type: e.target.value})}>
            <option value="skill">Skill</option>
            <option value="project">Project</option>
            <option value="internship">Internship</option>
            <option value="certification">Certification</option>
            <option value="hackathon">Hackathon</option>
          </select>
          <input 
            type="text" 
            placeholder="Name/Title" 
            value={newItem.name} 
            onChange={e => setNewItem({...newItem, name: e.target.value})} 
            required
          />
          {newItem.type === 'project' && (
            <input 
              type="text" 
              placeholder="Description" 
              value={newItem.description} 
              onChange={e => setNewItem({...newItem, description: e.target.value})} 
            />
          )}
          <button type="submit">Add</button>
        </form>
      </div>

      <div className="dashboard-grid">
        <div className="list-card">
          <h3>Skills</h3>
          <ul>{skills.map(s => <li key={s.id}>{s.name}</li>)}</ul>
        </div>
        <div className="list-card">
          <h3>Projects</h3>
          <ul>{projects.map(p => <li key={p.id}><strong>{p.name}</strong>: {p.description}</li>)}</ul>
        </div>
        <div className="list-card">
          <h3>Internships</h3>
          <ul>{internships.map(i => <li key={i.id}>{i.name}</li>)}</ul>
        </div>
        <div className="list-card">
          <h3>Certifications</h3>
          <ul>{certifications.map(c => <li key={c.id}>{c.name}</li>)}</ul>
        </div>
        <div className="list-card">
          <h3>Hackathons</h3>
          <ul>{hackathons.map(h => <li key={h.id}>{h.name}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
