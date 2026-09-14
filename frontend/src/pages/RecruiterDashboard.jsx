import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './FacultyDashboard.css';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [minScore, setMinScore] = useState('70');
  const [readiness, setReadiness] = useState('All');
  const [hasInternship, setHasInternship] = useState('');
  const [hasCertification, setHasCertification] = useState('');
  const [department, setDepartment] = useState('All');

  // Candidate Inspection Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async (customParams = null) => {
    setLoading(true);
    setError('');
    try {
      const params = customParams || {
        minScore: minScore ? parseInt(minScore) : undefined,
      };
      const res = await apiClient.get('/api/recruiter/students', { params });
      setCandidates(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/recruiter/login');
      } else {
        setError('Unable to load talent pool. Please verify backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (skill.trim()) params.skill = skill.trim();
    if (minScore) params.minScore = parseInt(minScore);
    if (readiness !== 'All') params.readiness = readiness;
    if (department !== 'All') params.department = department;
    if (hasInternship === 'true') params.hasInternship = true;
    if (hasCertification === 'true') params.hasCertification = true;
    fetchCandidates(params);
  };

  const handleResetFilter = () => {
    setSearch('');
    setSkill('');
    setMinScore('');
    setReadiness('All');
    setDepartment('All');
    setHasInternship('');
    setHasCertification('');
    fetchCandidates({});
  };

  const openCandidateModal = async (id) => {
    setSelectedCandidate(id);
    setModalLoading(true);
    try {
      const res = await apiClient.get(`/api/recruiter/students/${id}`);
      setCandidateDetails(res.data);
    } catch (err) {
      alert('Failed to load candidate profile.');
    } finally {
      setModalLoading(false);
    }
  };

  const closeCandidateModal = () => {
    setSelectedCandidate(null);
    setCandidateDetails(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('careernav_token');
    localStorage.removeItem('careernav_user');
    localStorage.removeItem('careernav_role');
    navigate('/recruiter/login');
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
            <div className="portal-sub">Corporate Recruiter & Talent Discovery Portal</div>
          </div>
        </div>
        <div className="nav-links">
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Available Talent: <strong>{candidates.length} candidates</strong>
          </span>
          <button onClick={handleLogout} className="btn-outline btn-sm">
            Sign Out
          </button>
        </div>
      </header>

      {error && <div className="alert-error" style={{ margin: '20px 36px' }}>{error}</div>}

      <main className="faculty-content">
        {/* Recruiter Talent Search & Filtering */}
        <form onSubmit={handleApplyFilter} className="filter-panel card" style={{ marginBottom: '28px' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Targeted Candidate Search & Filters</h3>
          <div className="filter-grid">
            <div className="form-group">
              <label>Candidate Name / Keyword</label>
              <input
                type="text"
                placeholder="Search candidate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Required Skill (e.g. Java, React)</label>
              <input
                type="text"
                placeholder="e.g. Java, Spring Boot"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Minimum Score Cutoff</label>
              <input
                type="number"
                placeholder="e.g. 75"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Readiness Tier</label>
              <select value={readiness} onChange={(e) => setReadiness(e.target.value)}>
                <option value="All">All Ready Tiers</option>
                <option value="Highly Ready">Highly Ready (90+)</option>
                <option value="Placement Ready">Placement Ready (75-89)</option>
                <option value="Nearly Ready">Nearly Ready (60-74)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Internship Experience</label>
              <select value={hasInternship} onChange={(e) => setHasInternship(e.target.value)}>
                <option value="">Any</option>
                <option value="true">Completed Internship</option>
              </select>
            </div>
            <div className="form-group">
              <label>Certifications</label>
              <select value={hasCertification} onChange={(e) => setHasCertification(e.target.value)}>
                <option value="">Any</option>
                <option value="true">Certified</option>
              </select>
            </div>
          </div>
          <div className="filter-actions">
            <button type="button" onClick={handleResetFilter} className="btn-secondary">Reset</button>
            <button type="submit" className="btn-primary">Find Matching Talent</button>
          </div>
        </form>

        {/* Candidate Cards Grid */}
        {loading ? (
          <div className="dashboard-loading"><div className="spinner"></div><p>Searching talent pool...</p></div>
        ) : candidates.length === 0 ? (
          <div className="card empty-state">
            <h3>No candidates match your current filter threshold.</h3>
            <p style={{ marginTop: '8px' }}>Try lowering the minimum score or expanding the required skills.</p>
            <button onClick={handleResetFilter} className="btn-primary" style={{ marginTop: '16px' }}>Reset Filters</button>
          </div>
        ) : (
          <div className="recruiter-candidates-grid">
            {candidates.map((c) => (
              <div key={c.studentId} className="card item-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{c.firstName} {c.lastName}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{c.department || 'Engineering'}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-green-primary)', lineHeight: 1 }}>
                      {c.employabilityScore}
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Score / 100</span>
                  </div>
                </div>

                <div style={{ margin: '14px 0' }}>
                  <span className={`badge ${getReadinessBadgeClass(c.readinessLevel)}`}>
                    {c.readinessLevel}
                  </span>
                </div>

                {/* Candidate Skill Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {c.skills?.slice(0, 4).map((sk) => (
                    <span key={sk.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '2px 6px', fontSize: '11px', color: 'var(--text-main)' }}>
                      {sk.name}
                    </span>
                  ))}
                  {c.skills?.length > 4 && (
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)', alignSelf: 'center' }}>+{c.skills.length - 4} more</span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: 'auto' }}>
                  <span>Projects: <strong>{c.projectsCount}</strong></span>
                  <span>Internships: <strong>{c.internshipsCount}</strong></span>
                  <span>CGPA: <strong>{c.cgpa || 'N/A'}</strong></span>
                </div>

                <button
                  onClick={() => openCandidateModal(c.studentId)}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '16px' }}
                >
                  Inspect Candidate Profile →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Candidate Inspection Modal */}
      {selectedCandidate && (
        <div className="modal-overlay" onClick={closeCandidateModal}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            {modalLoading ? (
              <div className="dashboard-loading"><div className="spinner"></div></div>
            ) : candidateDetails && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '22px' }}>{candidateDetails.firstName} {candidateDetails.lastName}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                      {candidateDetails.degree} in {candidateDetails.department} • Batch {candidateDetails.batch || '2025'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="score-num" style={{ fontSize: '28px' }}>{candidateDetails.employabilityScore}</span>
                    <span className="score-denom">/100</span>
                    <div><span className={`badge ${getReadinessBadgeClass(candidateDetails.readinessLevel)}`}>{candidateDetails.readinessLevel}</span></div>
                  </div>
                </div>

                {/* Candidate Links */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '13px' }}>
                  {candidateDetails.githubUrl && <a href={candidateDetails.githubUrl} target="_blank" rel="noreferrer">GitHub Profile ↗</a>}
                  {candidateDetails.linkedinUrl && <a href={candidateDetails.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn Profile ↗</a>}
                  {candidateDetails.portfolioUrl && <a href={candidateDetails.portfolioUrl} target="_blank" rel="noreferrer">Live Portfolio ↗</a>}
                </div>

                {/* Verified Skills */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '8px' }}>Verified Skills ({candidateDetails.skills?.length || 0})</h4>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {candidateDetails.skills?.map((sk) => (
                      <span key={sk.id} className="badge badge-ready">{sk.name} • {sk.proficiency}</span>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '8px' }}>Featured Projects ({candidateDetails.projects?.length || 0})</h4>
                  {candidateDetails.projects?.map((pr) => (
                    <div key={pr.id} style={{ marginBottom: '10px' }}>
                      <div style={{ fontWeight: 600 }}>{pr.title} ({pr.role || 'Developer'})</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0' }}>{pr.description}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-green-light)' }}>Stack: {pr.technologies}</div>
                    </div>
                  ))}
                </div>

                {/* Internships */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '16px' }}>
                  <h4 style={{ marginBottom: '8px' }}>Internship History ({candidateDetails.internships?.length || 0})</h4>
                  {candidateDetails.internships?.map((i) => (
                    <div key={i.id} style={{ marginBottom: '8px' }}>
                      <strong>{i.role}</strong> at <strong>{i.organization}</strong> ({i.startDate} - {i.endDate || 'Present'})
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{i.description}</div>
                    </div>
                  ))}
                </div>

                <div className="modal-actions" style={{ marginTop: '20px' }}>
                  <button onClick={closeCandidateModal} className="btn-secondary">Close Candidate View</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
