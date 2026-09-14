import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './StudentDashboard.css';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const selectTab = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Data states
  const [profileData, setProfileData] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [internships, setInternships] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);

  // Modal State
  const [modalType, setModalType] = useState(null); // 'skill' | 'project' | 'cert' | 'internship' | 'hackathon' | 'academics' | 'profile'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadAllStudentData();
  }, []);

  const loadAllStudentData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, skRes, prRes, cRes, iRes, hRes, rRes, shRes] = await Promise.all([
        apiClient.get('/api/students/me'),
        apiClient.get('/api/students/me/employability-score'),
        apiClient.get('/api/students/me/skills'),
        apiClient.get('/api/students/me/projects'),
        apiClient.get('/api/students/me/certifications'),
        apiClient.get('/api/students/me/internships'),
        apiClient.get('/api/students/me/hackathons'),
        apiClient.get('/api/students/me/recommendations'),
        apiClient.get('/api/students/me/score-history'),
      ]);

      setProfileData(pRes.data);
      setScoreData(sRes.data);
      setSkills(skRes.data);
      setProjects(prRes.data);
      setCertifications(cRes.data);
      setInternships(iRes.data);
      setHackathons(hRes.data);
      setRecommendations(rRes.data);
      setScoreHistory(shRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/student/login');
      } else {
        setError('Failed to load student data. Please check backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('careernav_token');
    localStorage.removeItem('careernav_user');
    localStorage.removeItem('careernav_role');
    navigate('/student/login');
  };

  // Generic Open Modal helper
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      setFormData({ ...item });
    } else {
      if (type === 'skill') setFormData({ name: '', category: 'Technical', proficiency: 'Intermediate' });
      else if (type === 'project') setFormData({ title: '', description: '', technologies: '', role: '', duration: '', projectLink: '', githubLink: '' });
      else if (type === 'cert') setFormData({ name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '' });
      else if (type === 'internship') setFormData({ organization: '', role: '', startDate: '', endDate: '', description: '', technologies: '' });
      else if (type === 'hackathon') setFormData({ name: '', organizer: '', date: '', achievement: 'Participant', teamSize: 4, description: '', link: '' });
      else if (type === 'profile' || type === 'academics') setFormData({ ...profileData?.student });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setEditingItem(null);
    setFormData({});
  };

  // Submit modal form
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (modalType === 'skill') {
        if (editingItem) await apiClient.put(`/api/students/me/skills/${editingItem.id}`, formData);
        else await apiClient.post('/api/students/me/skills', formData);
      } else if (modalType === 'project') {
        if (editingItem) await apiClient.put(`/api/students/me/projects/${editingItem.id}`, formData);
        else await apiClient.post('/api/students/me/projects', formData);
      } else if (modalType === 'cert') {
        if (editingItem) await apiClient.put(`/api/students/me/certifications/${editingItem.id}`, formData);
        else await apiClient.post('/api/students/me/certifications', formData);
      } else if (modalType === 'internship') {
        if (editingItem) await apiClient.put(`/api/students/me/internships/${editingItem.id}`, formData);
        else await apiClient.post('/api/students/me/internships', formData);
      } else if (modalType === 'hackathon') {
        if (editingItem) await apiClient.put(`/api/students/me/hackathons/${editingItem.id}`, formData);
        else await apiClient.post('/api/students/me/hackathons', formData);
      } else if (modalType === 'profile' || modalType === 'academics') {
        await apiClient.put('/api/students/me', formData);
      }

      setSuccess('Updated successfully! Recalculating employability score...');
      closeModal();
      await loadAllStudentData();
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed. Please check inputs.');
    }
  };

  // Delete entity
  const handleDelete = async (endpoint, id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await apiClient.delete(`/api/students/me/${endpoint}/${id}`);
      setSuccess('Deleted record.');
      await loadAllStudentData();
    } catch (err) {
      setError('Failed to delete item.');
    }
  };

  const getReadinessBadgeClass = (readiness) => {
    if (readiness === 'Highly Ready' || readiness === 'Placement Ready') return 'badge-ready';
    if (readiness === 'Nearly Ready' || readiness === 'Developing') return 'badge-developing';
    return 'badge-needs-dev';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading Career Navigator profile & scores...</p>
      </div>
    );
  }

  const student = profileData?.student || {};
  const currentScore = scoreData?.totalScore || student.employabilityScore || 0;
  const readiness = scoreData?.readinessLevel || student.readinessLevel || 'Needs Development';

  return (
    <div className="student-dashboard-layout">
      {/* Mobile Top App Bar */}
      <div className="mobile-appbar">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
        <div className="mobile-appbar-title" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
          <div className="brand-icon mobile-brand-icon">CN</div>
          <span className="brand-text">CAREER NAVIGATOR</span>
        </div>
        <div className="score-pill mobile-score-pill">
          <span className="score-num">{currentScore}</span>
          <span className="score-denom">/100</span>
        </div>
      </div>

      {/* Backdrop for Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar Navigation (Fixed on desktop, Slide-over drawer on mobile) */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-wrap">
          <div className="sidebar-brand" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
            <div className="brand-icon">CN</div>
            <span className="brand-text">CAREER NAVIGATOR</span>
          </div>
          <button
            type="button"
            className="mobile-close-sidebar"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        <div className="user-brief">
          <div className="user-avatar">{student.firstName ? student.firstName.charAt(0) : 'S'}</div>
          <div className="user-info">
            <div className="user-name">{student.firstName} {student.lastName}</div>
            <div className="user-dept">{student.department || 'Student'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => selectTab('dashboard')}>
            <span>Dashboard</span>
          </button>
          <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => selectTab('profile')}>
            <span>Profile</span>
          </button>
          <button className={`nav-item ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => selectTab('skills')}>
            <span>Skills</span>
            <span className="nav-counter">{skills.length}</span>
          </button>
          <button className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => selectTab('projects')}>
            <span>Projects</span>
            <span className="nav-counter">{projects.length}</span>
          </button>
          <button className={`nav-item ${activeTab === 'certifications' ? 'active' : ''}`} onClick={() => selectTab('certifications')}>
            <span>Certifications</span>
            <span className="nav-counter">{certifications.length}</span>
          </button>
          <button className={`nav-item ${activeTab === 'internships' ? 'active' : ''}`} onClick={() => selectTab('internships')}>
            <span>Internships</span>
            <span className="nav-counter">{internships.length}</span>
          </button>
          <button className={`nav-item ${activeTab === 'hackathons' ? 'active' : ''}`} onClick={() => selectTab('hackathons')}>
            <span>Hackathons</span>
            <span className="nav-counter">{hackathons.length}</span>
          </button>
          <button className={`nav-item ${activeTab === 'academics' ? 'active' : ''}`} onClick={() => selectTab('academics')}>
            <span>Academics</span>
          </button>
          <button className={`nav-item ${activeTab === 'employability' ? 'active' : ''}`} onClick={() => selectTab('employability')}>
            <span>Employability Score</span>
          </button>
          <button className={`nav-item ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => selectTab('recommendations')}>
            <span>Recommendations</span>
            {recommendations.length > 0 && <span className="nav-counter" style={{ background: '#22C55E', color: '#040805' }}>{recommendations.length}</span>}
          </button>
          <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => selectTab('history')}>
            <span>Score History</span>
          </button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => selectTab('settings')}>
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="main-topbar">
          <div>
            <h1 className="topbar-title">
              {activeTab === 'dashboard' && `Welcome back, ${student.firstName || 'Student'}!`}
              {activeTab === 'profile' && 'Student Profile'}
              {activeTab === 'skills' && 'Verified Skills Portfolio'}
              {activeTab === 'projects' && 'Practical Projects'}
              {activeTab === 'certifications' && 'Professional Certifications'}
              {activeTab === 'internships' && 'Internship & Industry Experience'}
              {activeTab === 'hackathons' && 'Hackathons & Competitions'}
              {activeTab === 'academics' && 'Academic Performance Record'}
              {activeTab === 'employability' && 'Employability Assessment & Breakdown'}
              {activeTab === 'recommendations' && 'Readiness Recommendations'}
              {activeTab === 'history' && 'Employability Score History'}
              {activeTab === 'settings' && 'Account Settings'}
            </h1>
            <p className="topbar-desc">
              {student.degree || 'B.Tech'} in {student.department || 'Engineering'} • CGPA: {student.cgpa || 'N/A'}
            </p>
          </div>

          <div className="topbar-badges">
            <span className={`badge ${getReadinessBadgeClass(readiness)}`}>
              {readiness}
            </span>
            <div className="score-pill">
              <span className="score-num">{currentScore}</span>
              <span className="score-denom">/100</span>
            </div>
          </div>
        </header>

        {error && <div className="alert-error" style={{ margin: '16px 32px' }}>{error}</div>}
        {success && <div className="alert-success" style={{ margin: '16px 32px' }}>{success}</div>}

        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="tab-content dashboard-overview">
            {/* Quick Metrics Cards */}
            <div className="stats-grid">
              <div className="stat-card card">
                <div className="stat-label">Profile Completion</div>
                <div className="stat-value">{profileData?.profileCompletion || 0}%</div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${profileData?.profileCompletion || 0}%` }}></div>
                </div>
              </div>

              <div className="stat-card card">
                <div className="stat-label">Verified Skills</div>
                <div className="stat-value">{skills.length} <span className="stat-sub">skills</span></div>
                <button onClick={() => setActiveTab('skills')} className="stat-link">Manage Skills →</button>
              </div>

              <div className="stat-card card">
                <div className="stat-label">Projects Built</div>
                <div className="stat-value">{projects.length} <span className="stat-sub">projects</span></div>
                <button onClick={() => setActiveTab('projects')} className="stat-link">View Projects →</button>
              </div>

              <div className="stat-card card">
                <div className="stat-label">Internships</div>
                <div className="stat-value">{internships.length} <span className="stat-sub">exp</span></div>
                <button onClick={() => setActiveTab('internships')} className="stat-link">Update Internships →</button>
              </div>
            </div>

            {/* Score & Calculation Dial Banner */}
            <div className="score-banner card">
              <div className="score-banner-left">
                <div className="big-score-dial">
                  <span className="dial-value">{currentScore}</span>
                  <span className="dial-label">Score / 100</span>
                </div>
                <div className="score-tier-details">
                  <div className={`badge ${getReadinessBadgeClass(readiness)}`} style={{ marginBottom: '8px' }}>
                    {readiness}
                  </div>
                  <h3>Authoritative Java Employability Calculation</h3>
                  <p>
                    Your overall readiness score is computed authoritatively by the Spring Boot calculation engine across 6 weighted dimensions.
                  </p>
                  <button onClick={() => setActiveTab('employability')} className="btn-primary" style={{ marginTop: '12px' }}>
                    Inspect Full Weight Breakdown
                  </button>
                </div>
              </div>

              <div className="breakdown-bars">
                <div className="bar-row">
                  <div className="bar-header">
                    <span>Technical Skills (25%)</span>
                    <span>{scoreData?.skillsScore || 0} / 25</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${((scoreData?.skillsScore || 0) / 25) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-header">
                    <span>Projects Portfolio (20%)</span>
                    <span>{scoreData?.projectsScore || 0} / 20</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${((scoreData?.projectsScore || 0) / 20) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-header">
                    <span>Internships (20%)</span>
                    <span>{scoreData?.internshipsScore || 0} / 20</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${((scoreData?.internshipsScore || 0) / 20) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-header">
                    <span>Certifications (15%)</span>
                    <span>{scoreData?.certificationsScore || 0} / 15</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${((scoreData?.certificationsScore || 0) / 15) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-header">
                    <span>Hackathons (10%)</span>
                    <span>{scoreData?.hackathonsScore || 0} / 10</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${((scoreData?.hackathonsScore || 0) / 10) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-header">
                    <span>Academics & CGPA (10%)</span>
                    <span>{scoreData?.academicsScore || 0} / 10</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${((scoreData?.academicsScore || 0) / 10) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Recommendations */}
            <div className="card" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Priority Improvement Recommendations</h3>
                <button onClick={() => setActiveTab('recommendations')} className="btn-outline">View All</button>
              </div>

              {recommendations.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No pending recommendations. You are on track!</p>
              ) : (
                <div className="rec-mini-list">
                  {recommendations.slice(0, 3).map((r, idx) => (
                    <div key={idx} className="rec-card-mini">
                      <span className={`priority-tag ${r.priority?.toLowerCase()}`}>{r.priority}</span>
                      <div>
                        <h4>{r.title}</h4>
                        <p>{r.message}</p>
                      </div>
                      <button onClick={() => setActiveTab(r.actionTab || 'dashboard')} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                        Take Action
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Profile */}
        {activeTab === 'profile' && (
          <div className="tab-content card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2>Student Profile Details</h2>
                <p style={{ color: 'var(--text-muted)' }}>Personal and contact information displayed to verified campus recruiters.</p>
              </div>
              <button onClick={() => openModal('profile', student)} className="btn-primary">
                Edit Profile
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Full Name</span>
                <span className="value">{student.firstName} {student.lastName}</span>
              </div>
              <div className="detail-item">
                <span className="label">Registered Email</span>
                <span className="value">{profileData?.user?.email || student.user?.email || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Phone Number</span>
                <span className="value">{student.phone || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Department</span>
                <span className="value">{student.department || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Degree Program</span>
                <span className="value">{student.degree || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Batch Year</span>
                <span className="value">{student.batch || 'Not specified'}</span>
              </div>
              <div className="detail-item">
                <span className="label">GitHub Profile</span>
                <span className="value">
                  {student.githubUrl ? <a href={student.githubUrl} target="_blank" rel="noreferrer">{student.githubUrl}</a> : 'Not linked'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">LinkedIn Profile</span>
                <span className="value">
                  {student.linkedinUrl ? <a href={student.linkedinUrl} target="_blank" rel="noreferrer">{student.linkedinUrl}</a> : 'Not linked'}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Portfolio URL</span>
                <span className="value">
                  {student.portfolioUrl ? <a href={student.portfolioUrl} target="_blank" rel="noreferrer">{student.portfolioUrl}</a> : 'Not linked'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Skills CRUD */}
        {activeTab === 'skills' && (
          <div className="tab-content card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2>Verified Technical Skills</h2>
                <p style={{ color: 'var(--text-muted)' }}>Contributes 25% to your overall employability score.</p>
              </div>
              <button onClick={() => openModal('skill')} className="btn-primary">
                + Add Skill
              </button>
            </div>

            {skills.length === 0 ? (
              <div className="empty-state">
                <p>No skills added yet. Add your core programming languages and frameworks!</p>
                <button onClick={() => openModal('skill')} className="btn-primary" style={{ marginTop: '12px' }}>
                  Add First Skill
                </button>
              </div>
            ) : (
              <div className="items-grid">
                {skills.map((s) => (
                  <div key={s.id} className="item-card card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge badge-ready">{s.category || 'Skill'}</span>
                      <div className="item-actions">
                        <button onClick={() => openModal('skill', s)} className="btn-secondary btn-sm">Edit</button>
                        <button onClick={() => handleDelete('skills', s.id)} className="btn-danger btn-sm">Delete</button>
                      </div>
                    </div>
                    <h3 style={{ margin: '12px 0 6px' }}>{s.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Proficiency: <strong>{s.proficiency || 'Intermediate'}</strong></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Projects CRUD */}
        {activeTab === 'projects' && (
          <div className="tab-content card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2>Software Projects</h2>
                <p style={{ color: 'var(--text-muted)' }}>Contributes 20% to your overall employability score.</p>
              </div>
              <button onClick={() => openModal('project')} className="btn-primary">
                + Add Project
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="empty-state">
                <p>No projects added yet. Showcase your hands-on applications and GitHub code!</p>
                <button onClick={() => openModal('project')} className="btn-primary" style={{ marginTop: '12px' }}>
                  Add Project
                </button>
              </div>
            ) : (
              <div className="items-grid">
                {projects.map((p) => (
                  <div key={p.id} className="item-card card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{p.role || 'Developer'}</span>
                      <div className="item-actions">
                        <button onClick={() => openModal('project', p)} className="btn-secondary btn-sm">Edit</button>
                        <button onClick={() => handleDelete('projects', p.id)} className="btn-danger btn-sm">Delete</button>
                      </div>
                    </div>
                    <h3 style={{ margin: '12px 0 6px' }}>{p.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px', lineHeight: 1.5 }}>
                      {p.description}
                    </p>
                    <div style={{ fontSize: '12px', color: 'var(--color-green-light)', marginBottom: '8px' }}>
                      <strong>Technologies:</strong> {p.technologies || 'Not listed'}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                      {p.githubLink && <a href={p.githubLink} target="_blank" rel="noreferrer">GitHub Repo ↗</a>}
                      {p.projectLink && <a href={p.projectLink} target="_blank" rel="noreferrer">Live Demo ↗</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Certifications CRUD */}
        {activeTab === 'certifications' && (
          <div className="tab-content card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2>Certifications</h2>
                <p style={{ color: 'var(--text-muted)' }}>Contributes 15% to your overall score.</p>
              </div>
              <button onClick={() => openModal('cert')} className="btn-primary">
                + Add Certification
              </button>
            </div>

            {certifications.length === 0 ? (
              <div className="empty-state">
                <p>No certifications added yet.</p>
                <button onClick={() => openModal('cert')} className="btn-primary" style={{ marginTop: '12px' }}>
                  Add Certification
                </button>
              </div>
            ) : (
              <div className="items-grid">
                {certifications.map((c) => (
                  <div key={c.id} className="item-card card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="badge badge-ready">{c.issuer}</span>
                      <div className="item-actions">
                        <button onClick={() => openModal('cert', c)} className="btn-secondary btn-sm">Edit</button>
                        <button onClick={() => handleDelete('certifications', c.id)} className="btn-danger btn-sm">Delete</button>
                      </div>
                    </div>
                    <h3 style={{ margin: '12px 0 6px' }}>{c.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Issued: {c.issueDate || 'N/A'}</p>
                    {c.credentialId && <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>ID: {c.credentialId}</p>}
                    {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noreferrer" style={{ fontSize: '13px', marginTop: '8px', display: 'inline-block' }}>Verify Credential ↗</a>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Internships CRUD */}
        {activeTab === 'internships' && (
          <div className="tab-content card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2>Industry Internships</h2>
                <p style={{ color: 'var(--text-muted)' }}>Contributes 20% to your overall employability score.</p>
              </div>
              <button onClick={() => openModal('internship')} className="btn-primary">
                + Add Internship
              </button>
            </div>

            {internships.length === 0 ? (
              <div className="empty-state">
                <p>No internships added. Having real workplace experience significantly increases recruiter interest.</p>
                <button onClick={() => openModal('internship')} className="btn-primary" style={{ marginTop: '12px' }}>
                  Add Internship
                </button>
              </div>
            ) : (
              <div className="items-grid">
                {internships.map((i) => (
                  <div key={i.id} className="item-card card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="badge badge-ready">{i.organization}</span>
                      <div className="item-actions">
                        <button onClick={() => openModal('internship', i)} className="btn-secondary btn-sm">Edit</button>
                        <button onClick={() => handleDelete('internships', i.id)} className="btn-danger btn-sm">Delete</button>
                      </div>
                    </div>
                    <h3 style={{ margin: '12px 0 4px' }}>{i.role}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {i.startDate} — {i.endDate || 'Present'}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '8px' }}>
                      {i.description}
                    </p>
                    {i.technologies && <p style={{ fontSize: '12px', color: 'var(--color-green-light)' }}>Stack: {i.technologies}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Hackathons CRUD */}
        {activeTab === 'hackathons' && (
          <div className="tab-content card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2>Hackathons & Competitions</h2>
                <p style={{ color: 'var(--text-muted)' }}>Contributes 10% to your overall score.</p>
              </div>
              <button onClick={() => openModal('hackathon')} className="btn-primary">
                + Add Hackathon
              </button>
            </div>

            {hackathons.length === 0 ? (
              <div className="empty-state">
                <p>No hackathons recorded yet. Participate in coding contests to prove fast problem solving!</p>
                <button onClick={() => openModal('hackathon')} className="btn-primary" style={{ marginTop: '12px' }}>
                  Add Hackathon
                </button>
              </div>
            ) : (
              <div className="items-grid">
                {hackathons.map((h) => (
                  <div key={h.id} className="item-card card">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="badge" style={{ background: 'var(--color-green-subtle)', color: 'var(--color-green-light)' }}>
                        {h.achievement || 'Participant'}
                      </span>
                      <div className="item-actions">
                        <button onClick={() => openModal('hackathon', h)} className="btn-secondary btn-sm">Edit</button>
                        <button onClick={() => handleDelete('hackathons', h.id)} className="btn-danger btn-sm">Delete</button>
                      </div>
                    </div>
                    <h3 style={{ margin: '12px 0 4px' }}>{h.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Organizer: {h.organizer} • Date: {h.date}
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {h.description}
                    </p>
                    {h.link && <a href={h.link} target="_blank" rel="noreferrer" style={{ fontSize: '13px', marginTop: '8px', display: 'inline-block' }}>Project Link ↗</a>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Academics */}
        {activeTab === 'academics' && (
          <div className="tab-content card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2>Academic Performance</h2>
                <p style={{ color: 'var(--text-muted)' }}>Contributes 10% based on CGPA and backlog status.</p>
              </div>
              <button onClick={() => openModal('academics', student)} className="btn-primary">
                Update Academic Details
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Cumulative GPA (CGPA)</span>
                <span className="value" style={{ fontSize: '24px', color: 'var(--color-green-primary)', fontWeight: 800 }}>
                  {student.cgpa || 0.0} / 10.0
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Active Backlogs</span>
                <span className="value" style={{ color: student.backlogs > 0 ? 'var(--danger-color)' : 'var(--color-green-light)' }}>
                  {student.backlogs || 0}
                </span>
              </div>
              <div className="detail-item">
                <span className="label">Current Semester</span>
                <span className="value">Semester {student.semester || 'N/A'}</span>
              </div>
              <div className="detail-item">
                <span className="label">Degree & Department</span>
                <span className="value">{student.degree} in {student.department}</span>
              </div>
              <div className="detail-item">
                <span className="label">Academic Year</span>
                <span className="value">{student.academicYear || '2024-2025'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 9: Employability Score Breakdown */}
        {activeTab === 'employability' && (
          <div className="tab-content card">
            <h2>Detailed Employability Calculation Engine</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Transparent mathematical model executed authoritatively in Java on the Spring Boot backend.
            </p>

            <div className="breakdown-table table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Component Dimension</th>
                    <th>Evaluation Criteria</th>
                    <th>Max Weight</th>
                    <th>Earned Score</th>
                    <th>Achievement Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Verified Technical Skills</strong></td>
                    <td>Up to 5 skills weighted by proficiency level</td>
                    <td>25%</td>
                    <td style={{ color: 'var(--color-green-primary)', fontWeight: 700 }}>{scoreData?.skillsScore || 0} pts</td>
                    <td>{Math.round(((scoreData?.skillsScore || 0) / 25) * 100)}%</td>
                  </tr>
                  <tr>
                    <td><strong>Practical Projects</strong></td>
                    <td>Up to 4 complete projects with GitHub repositories</td>
                    <td>20%</td>
                    <td style={{ color: 'var(--color-green-primary)', fontWeight: 700 }}>{scoreData?.projectsScore || 0} pts</td>
                    <td>{Math.round(((scoreData?.projectsScore || 0) / 20) * 100)}%</td>
                  </tr>
                  <tr>
                    <td><strong>Industry Internships</strong></td>
                    <td>Up to 2 completed internships (10 pts each)</td>
                    <td>20%</td>
                    <td style={{ color: 'var(--color-green-primary)', fontWeight: 700 }}>{scoreData?.internshipsScore || 0} pts</td>
                    <td>{Math.round(((scoreData?.internshipsScore || 0) / 20) * 100)}%</td>
                  </tr>
                  <tr>
                    <td><strong>Professional Certifications</strong></td>
                    <td>Up to 3 vendor certifications (5 pts each)</td>
                    <td>15%</td>
                    <td style={{ color: 'var(--color-green-primary)', fontWeight: 700 }}>{scoreData?.certificationsScore || 0} pts</td>
                    <td>{Math.round(((scoreData?.certificationsScore || 0) / 15) * 100)}%</td>
                  </tr>
                  <tr>
                    <td><strong>Hackathons & Contests</strong></td>
                    <td>Up to 2 competitive coding / hackathon events</td>
                    <td>10%</td>
                    <td style={{ color: 'var(--color-green-primary)', fontWeight: 700 }}>{scoreData?.hackathonsScore || 0} pts</td>
                    <td>{Math.round(((scoreData?.hackathonsScore || 0) / 10) * 100)}%</td>
                  </tr>
                  <tr>
                    <td><strong>Academic CGPA</strong></td>
                    <td>CGPA scaled to 10 points minus backlog deductions</td>
                    <td>10%</td>
                    <td style={{ color: 'var(--color-green-primary)', fontWeight: 700 }}>{scoreData?.academicsScore || 0} pts</td>
                    <td>{Math.round(((scoreData?.academicsScore || 0) / 10) * 100)}%</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--bg-secondary)' }}>
                    <td colSpan="2" style={{ fontWeight: 800, fontSize: '15px' }}>TOTAL AUTHORITATIVE SCORE</td>
                    <td style={{ fontWeight: 800 }}>100%</td>
                    <td style={{ color: 'var(--color-green-light)', fontWeight: 800, fontSize: '18px' }}>
                      {currentScore} / 100
                    </td>
                    <td style={{ fontWeight: 800 }}>{currentScore}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Tab 10: Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="tab-content card">
            <h2>Personalized Readiness Recommendations</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Generated dynamically by the Java rule-based engine analyzing your actual metrics.
            </p>

            {recommendations.length === 0 ? (
              <div className="empty-state">
                <p>No active recommendations! You have fulfilled major criteria for placement readiness.</p>
              </div>
            ) : (
              <div className="recs-grid">
                {recommendations.map((r, idx) => (
                  <div key={idx} className="rec-card card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="badge badge-ready">{r.category}</span>
                      <span className={`priority-tag ${r.priority?.toLowerCase()}`}>{r.priority} PRIORITY</span>
                    </div>
                    <h3 style={{ fontSize: '17px', marginBottom: '8px' }}>{r.title}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
                      {r.message}
                    </p>
                    <button onClick={() => setActiveTab(r.actionTab || 'dashboard')} className="btn-primary" style={{ width: '100%' }}>
                      Resolve Recommendation →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 11: Score History */}
        {activeTab === 'history' && (
          <div className="tab-content card">
            <h2>Employability Score Progression</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Historical audit records saved on every recalculation.
            </p>

            {scoreHistory.length === 0 ? (
              <div className="empty-state">
                <p>No previous score changes recorded yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Previous Score</th>
                      <th>Updated Score</th>
                      <th>Net Change</th>
                      <th>Readiness Tier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreHistory.map((h) => {
                      const diff = h.currentScore - (h.previousScore || 0);
                      return (
                        <tr key={h.id}>
                          <td>{new Date(h.createdAt).toLocaleString()}</td>
                          <td>{h.previousScore || 0}</td>
                          <td style={{ fontWeight: 700, color: 'var(--color-green-light)' }}>{h.currentScore}</td>
                          <td style={{ color: diff >= 0 ? 'var(--color-green-primary)' : 'var(--danger-color)' }}>
                            {diff >= 0 ? `+${diff}` : diff}
                          </td>
                          <td><span className={`badge ${getReadinessBadgeClass(h.readinessLevel)}`}>{h.readinessLevel}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 12: Settings */}
        {activeTab === 'settings' && (
          <div className="tab-content card" style={{ maxWidth: '600px' }}>
            <h2>Account Security & Settings</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Manage credentials and view system status.</p>

            <div style={{ marginBottom: '24px' }}>
              <h4>Password & Security</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 16px' }}>
                Need to update your password? You can change your permanent password anytime.
              </p>
              <button onClick={() => navigate('/change-password')} className="btn-secondary">
                Change Account Password
              </button>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              <h4>Session Management</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 16px' }}>
                Sign out of your session on this device.
              </p>
              <button onClick={handleLogout} className="btn-danger">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Reusable Modal Form */}
      {modalType && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>
              {editingItem ? 'Edit' : 'Add'} {modalType.toUpperCase()}
            </h3>

            <form onSubmit={handleModalSubmit} className="modal-form">
              {/* Skill Form */}
              {modalType === 'skill' && (
                <>
                  <div className="form-group">
                    <label>Skill Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Java, Docker, React"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category || 'Technical'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="Technical">Technical</option>
                      <option value="Framework">Framework</option>
                      <option value="Database">Database</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Soft Skill">Soft Skill</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Proficiency</label>
                    <select
                      value={formData.proficiency || 'Intermediate'}
                      onChange={(e) => setFormData({ ...formData, proficiency: e.target.value })}
                    >
                      <option value="Beginner">Beginner (3 pts)</option>
                      <option value="Intermediate">Intermediate (4 pts)</option>
                      <option value="Advanced">Advanced (5 pts)</option>
                      <option value="Expert">Expert (5 pts)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Project Form */}
              {modalType === 'project' && (
                <>
                  <div className="form-group">
                    <label>Project Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Distributed Task Scheduler"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      rows="3"
                      placeholder="Describe the architectural design and purpose..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Technologies Used</label>
                    <input
                      type="text"
                      placeholder="e.g. Java, Spring Boot, Redis, Docker"
                      value={formData.technologies || ''}
                      onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    />
                  </div>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label>Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Lead Backend Engineer"
                        value={formData.role || ''}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 3 months"
                        value={formData.duration || ''}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>GitHub Repository Link (Awards +1 bonus point)</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={formData.githubLink || ''}
                      onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Live Demo URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.projectLink || ''}
                      onChange={(e) => setFormData({ ...formData, projectLink: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Certification Form */}
              {modalType === 'cert' && (
                <>
                  <div className="form-group">
                    <label>Certification Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. AWS Certified Developer"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Issuing Organization *</label>
                    <input
                      type="text"
                      placeholder="e.g. Amazon Web Services, Oracle"
                      value={formData.issuer || ''}
                      onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label>Issue Date</label>
                      <input
                        type="date"
                        value={formData.issueDate || ''}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="date"
                        value={formData.expiryDate || ''}
                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Credential ID</label>
                    <input
                      type="text"
                      placeholder="e.g. AWS-123456"
                      value={formData.credentialId || ''}
                      onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Verification URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.credentialUrl || ''}
                      onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Internship Form */}
              {modalType === 'internship' && (
                <>
                  <div className="form-group">
                    <label>Organization / Company *</label>
                    <input
                      type="text"
                      placeholder="e.g. Microsoft, Infosys"
                      value={formData.organization || ''}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role / Position *</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineering Intern"
                      value={formData.role || ''}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={formData.startDate || ''}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        value={formData.endDate || ''}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description of Contributions</label>
                    <textarea
                      rows="3"
                      placeholder="Key engineering responsibilities and projects..."
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Technologies Used</label>
                    <input
                      type="text"
                      placeholder="e.g. Java, SQL, Spring Boot"
                      value={formData.technologies || ''}
                      onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Hackathon Form */}
              {modalType === 'hackathon' && (
                <>
                  <div className="form-group">
                    <label>Hackathon / Contest Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Smart India Hackathon"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Organizer</label>
                    <input
                      type="text"
                      placeholder="e.g. AICTE, Major League Hacking"
                      value={formData.organizer || ''}
                      onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    />
                  </div>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label>Achievement (Winner = 5 pts)</label>
                      <input
                        type="text"
                        placeholder="e.g. Winner, Finalist, Participant"
                        value={formData.achievement || ''}
                        onChange={(e) => setFormData({ ...formData, achievement: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Team Size</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.teamSize || 4}
                        onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Project Description</label>
                    <textarea
                      rows="2"
                      placeholder="What did you build in the hackathon?"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Submission / Project Link</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.link || ''}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    />
                  </div>
                </>
              )}

              {/* Profile & Academics Form */}
              {(modalType === 'profile' || modalType === 'academics') && (
                <>
                  <div className="form-row-2col">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        value={formData.firstName || ''}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName || ''}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label>CGPA (0.0 to 10.0)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.cgpa || ''}
                        onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Active Backlogs</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.backlogs || 0}
                        onChange={(e) => setFormData({ ...formData, backlogs: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="form-row-2col">
                    <div className="form-group">
                      <label>Degree</label>
                      <input
                        type="text"
                        value={formData.degree || ''}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Semester</label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={formData.semester || ''}
                        onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>GitHub Profile URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={formData.githubUrl || ''}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>LinkedIn Profile URL</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={formData.linkedinUrl || ''}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Portfolio URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={formData.portfolioUrl || ''}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
