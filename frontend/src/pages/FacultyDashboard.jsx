import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './FacultyDashboard.css';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'analytics'
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Student Profile Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [readiness, setReadiness] = useState('All');
  const [skill, setSkill] = useState('');
  const [minScore, setMinScore] = useState('');
  const [hasInternship, setHasInternship] = useState('');

  useEffect(() => {
    loadFacultyData();
  }, []);

  const loadFacultyData = async () => {
    setLoading(true);
    setError('');
    try {
      const [aRes, sRes] = await Promise.all([
        apiClient.get('/api/faculty/analytics'),
        apiClient.get('/api/faculty/students')
      ]);
      setAnalytics(aRes.data);
      setStudents(sRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/faculty/login');
      } else {
        setError('Failed to fetch faculty analytics. Please verify server connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (department !== 'All') params.department = department;
      if (readiness !== 'All') params.readiness = readiness;
      if (skill.trim()) params.skill = skill.trim();
      if (minScore) params.minScore = parseInt(minScore);
      if (hasInternship === 'true') params.hasInternship = true;
      if (hasInternship === 'false') params.hasInternship = false;

      const res = await apiClient.get('/api/faculty/students', { params });
      setStudents(res.data);
    } catch (err) {
      setError('Filter query failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setDepartment('All');
    setReadiness('All');
    setSkill('');
    setMinScore('');
    setHasInternship('');
    loadFacultyData();
  };

  const openStudentModal = async (studentId) => {
    setSelectedStudent(studentId);
    setModalLoading(true);
    try {
      const res = await apiClient.get(`/api/faculty/students/${studentId}`);
      setStudentDetails(res.data);
    } catch (err) {
      alert('Failed to load candidate details.');
    } finally {
      setModalLoading(false);
    }
  };

  const closeStudentModal = () => {
    setSelectedStudent(null);
    setStudentDetails(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('careernav_token');
    localStorage.removeItem('careernav_user');
    localStorage.removeItem('careernav_role');
    navigate('/faculty/login');
  };

  const getReadinessBadgeClass = (r) => {
    if (r === 'Highly Ready' || r === 'Placement Ready') return 'badge-ready';
    if (r === 'Nearly Ready' || r === 'Developing') return 'badge-developing';
    return 'badge-needs-dev';
  };

  return (
    <div className="faculty-layout">
      {/* Top Navbar */}
      <header className="faculty-nav">
        <div className="nav-left">
          <div className="brand-icon">CN</div>
          <div>
            <div className="brand-text">CAREER NAVIGATOR</div>
            <div className="portal-sub">Faculty & Academic Advisory Portal</div>
          </div>
        </div>
        <div className="nav-links">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            Cohort Overview
          </button>
          <button className={activeTab === 'students' ? 'active' : ''} onClick={() => setActiveTab('students')}>
            Student Directory & Filters ({students.length})
          </button>
          <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
            Institutional Analytics
          </button>
          <button onClick={handleLogout} className="btn-outline btn-sm">
            Sign Out
          </button>
        </div>
      </header>

      {error && <div className="alert-error" style={{ margin: '20px 36px' }}>{error}</div>}

      <main className="faculty-content">
        {loading ? (
          <div className="dashboard-loading">
            <div className="spinner"></div>
            <p>Loading faculty metrics & cohort data...</p>
          </div>
        ) : (
          <>
            {/* TAB 1: COHORT OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <div className="stats-row">
                  <div className="metric-card card">
                    <div className="metric-label">Total Monitored Students</div>
                    <div className="metric-value">{analytics?.totalStudents || 0}</div>
                  </div>
                  <div className="metric-card card">
                    <div className="metric-label">Average Employability Score</div>
                    <div className="metric-value" style={{ color: 'var(--color-green-primary)' }}>
                      {analytics?.averageScore || 0} <span style={{ fontSize: '14px', color: 'var(--text-dim)' }}>/100</span>
                    </div>
                  </div>
                  <div className="metric-card card">
                    <div className="metric-label">Students Needing Development</div>
                    <div className="metric-value" style={{ color: 'var(--danger-color)' }}>
                      {analytics?.studentsNeedingImprovement || 0}
                    </div>
                  </div>
                </div>

                {/* Readiness Tier Distribution */}
                <div className="card" style={{ marginTop: '24px' }}>
                  <h3 style={{ marginBottom: '16px' }}>Readiness Level Distribution</h3>
                  <div className="readiness-bars">
                    {analytics?.readinessDistribution && Object.entries(analytics.readinessDistribution).map(([tier, count]) => {
                      const pct = analytics.totalStudents > 0 ? Math.round((count / analytics.totalStudents) * 100) : 0;
                      return (
                        <div key={tier} className="tier-row">
                          <div className="tier-info">
                            <span className={`badge ${getReadinessBadgeClass(tier)}`}>{tier}</span>
                            <span style={{ fontWeight: 600 }}>{count} students ({pct}%)</span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Skills Observed */}
                <div className="card" style={{ marginTop: '24px' }}>
                  <h3 style={{ marginBottom: '16px' }}>Frequent Skills Across Cohort</h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {analytics?.topSkills?.map((s, idx) => (
                      <div key={idx} className="skill-pill">
                        <strong>{s.name}</strong>
                        <span className="skill-count">{s.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STUDENT DIRECTORY & BACKEND FILTERS */}
            {activeTab === 'students' && (
              <div>
                {/* Filter Form */}
                <form onSubmit={handleApplyFilters} className="filter-panel card">
                  <div className="filter-grid">
                    <div className="form-group">
                      <label>Search Name / Email</label>
                      <input
                        type="text"
                        placeholder="Search student..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                        <option value="All">All Departments</option>
                        <option value="Computer Science & Engineering">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics & Communication">Electronics</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Readiness Level</label>
                      <select value={readiness} onChange={(e) => setReadiness(e.target.value)}>
                        <option value="All">All Tiers</option>
                        <option value="Highly Ready">Highly Ready (90+)</option>
                        <option value="Placement Ready">Placement Ready (75-89)</option>
                        <option value="Nearly Ready">Nearly Ready (60-74)</option>
                        <option value="Developing">Developing (40-59)</option>
                        <option value="Needs Development">Needs Development (&lt;40)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Skill</label>
                      <input
                        type="text"
                        placeholder="e.g. Java, Docker"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Min Score</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={minScore}
                        onChange={(e) => setMinScore(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Internship Done</label>
                      <select value={hasInternship} onChange={(e) => setHasInternship(e.target.value)}>
                        <option value="">Any</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                  </div>
                  <div className="filter-actions">
                    <button type="button" onClick={resetFilters} className="btn-secondary">Reset</button>
                    <button type="submit" className="btn-primary">Apply Filters</button>
                  </div>
                </form>

                {/* Table of Students */}
                <div className="card table-responsive" style={{ marginTop: '24px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Department</th>
                        <th>CGPA</th>
                        <th>Score</th>
                        <th>Readiness Tier</th>
                        <th>Skills</th>
                        <th>Projects</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                            No students match the current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        students.map(({ student: s, skillsCount, projectsCount }) => (
                          <tr key={s.userId}>
                            <td style={{ fontWeight: 600 }}>{s.firstName} {s.lastName}</td>
                            <td>{s.department || 'General'}</td>
                            <td>{s.cgpa != null ? s.cgpa : 'N/A'}</td>
                            <td style={{ fontWeight: 700, color: 'var(--color-green-primary)' }}>
                              {s.employabilityScore || 0}/100
                            </td>
                            <td>
                              <span className={`badge ${getReadinessBadgeClass(s.readinessLevel)}`}>
                                {s.readinessLevel || 'Needs Development'}
                              </span>
                            </td>
                            <td>{skillsCount}</td>
                            <td>{projectsCount}</td>
                            <td>
                              <button
                                onClick={() => openStudentModal(s.userId)}
                                className="btn-outline btn-sm"
                              >
                                View Profile
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: INSTITUTIONAL ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="card">
                <h2>Department Readiness Metrics</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Aggregated performance metrics across academic departments.
                </p>

                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Enrolled Students</th>
                        <th>Average Score</th>
                        <th>Cohort Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.departmentStats && Object.entries(analytics.departmentStats).map(([dept, data]) => (
                        <tr key={dept}>
                          <td style={{ fontWeight: 600 }}>{dept}</td>
                          <td>{data.count} students</td>
                          <td style={{ fontWeight: 700, color: 'var(--color-green-primary)' }}>
                            {data.averageScore} / 100
                          </td>
                          <td>
                            <div className="progress-track" style={{ width: '140px' }}>
                              <div className="progress-fill" style={{ width: `${data.averageScore}%` }}></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Student Profile Inspection Modal (Read-Only) */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={closeStudentModal}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            {modalLoading ? (
              <div className="dashboard-loading"><div className="spinner"></div></div>
            ) : studentDetails && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px' }}>{studentDetails.student.firstName} {studentDetails.student.lastName}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {studentDetails.student.department} • CGPA: {studentDetails.student.cgpa || 'N/A'}
                    </p>
                  </div>
                  <span className={`badge ${getReadinessBadgeClass(studentDetails.student.readinessLevel)}`}>
                    {studentDetails.student.readinessLevel} ({studentDetails.student.employabilityScore}/100)
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '8px' }}>Verified Skills ({studentDetails.skills?.length || 0})</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {studentDetails.skills?.map((sk) => (
                      <span key={sk.id} className="badge badge-ready">{sk.name} ({sk.proficiency})</span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '8px' }}>Projects ({studentDetails.projects?.length || 0})</h4>
                  {studentDetails.projects?.map((pr) => (
                    <div key={pr.id} style={{ marginBottom: '8px' }}>
                      <strong>{pr.title}</strong> — <span style={{ color: 'var(--text-muted)' }}>{pr.technologies}</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '8px' }}>Internships ({studentDetails.internships?.length || 0})</h4>
                  {studentDetails.internships?.map((i) => (
                    <div key={i.id} style={{ marginBottom: '6px' }}>
                      <strong>{i.role}</strong> at {i.organization} ({i.startDate} - {i.endDate || 'Present'})
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button onClick={closeStudentModal} className="btn-secondary">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
