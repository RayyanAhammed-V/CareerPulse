import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'recovery' | 'audit'
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & Role filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', role: 'ROLE_FACULTY', fullName: '', department: 'Computer Science & Engineering' });
  const [createdCredential, setCreatedCredential] = useState(null); // Displays temporary password once!

  const [tempPassModal, setTempPassModal] = useState(null); // Contains user email & temp password to show once!

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [oRes, uRes, aRes] = await Promise.all([
        apiClient.get('/api/admin/overview'),
        apiClient.get('/api/admin/users'),
        apiClient.get('/api/admin/audit-logs')
      ]);
      setOverview(oRes.data);
      setUsers(uRes.data);
      setAuditLogs(aRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/admin/login');
      } else {
        setError('Failed to load administrative console data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUsers = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await apiClient.get('/api/admin/users', {
        params: {
          search: search.trim() || undefined,
          role: roleFilter !== 'All' ? roleFilter : undefined
        }
      });
      setUsers(res.data);
    } catch (err) {
      setError('Search failed.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await apiClient.patch(`/api/admin/users/${id}/status`);
      setSuccess('Account status toggled successfully.');
      loadAdminData();
    } catch (err) {
      setError('Failed to update account status.');
    }
  };

  const handleGenerateTempPassword = async (id, email) => {
    try {
      const res = await apiClient.post(`/api/admin/users/${id}/generate-temp-password`);
      setTempPassModal({
        email: res.data.email || email,
        temporaryPassword: res.data.temporaryPassword
      });
      loadAdminData();
    } catch (err) {
      setError('Failed to generate temporary password.');
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Are you sure you want to permanently delete user: ${email}? This action cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/admin/users/${id}`);
      setSuccess(`User ${email} deleted.`);
      loadAdminData();
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await apiClient.post('/api/admin/users', createForm);
      setCreatedCredential({
        email: createForm.email,
        role: createForm.role,
        temporaryPassword: res.data.temporaryPassword
      });
      setShowCreateModal(false);
      setCreateForm({ email: '', role: 'ROLE_FACULTY', fullName: '', department: 'Computer Science & Engineering' });
      loadAdminData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create user account.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('careernav_token');
    localStorage.removeItem('careernav_user');
    localStorage.removeItem('careernav_role');
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      {/* Admin Navbar */}
      <header className="admin-nav">
        <div className="nav-left">
          <div className="brand-icon">CN</div>
          <div>
            <div className="brand-text">CAREER NAVIGATOR</div>
            <div className="portal-sub" style={{ color: '#E4E4E7' }}>System Administration Console</div>
          </div>
        </div>
        <div className="nav-links">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            System Overview
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            User Management ({users.length})
          </button>
          <button className={activeTab === 'recovery' ? 'active' : ''} onClick={() => setActiveTab('recovery')}>
            Account Recovery
          </button>
          <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}>
            Audit Logs
          </button>
          <button onClick={handleLogout} className="btn-outline btn-sm">
            Sign Out
          </button>
        </div>
      </header>

      {error && <div className="alert-error" style={{ margin: '20px 36px' }}>{error}</div>}
      {success && <div className="alert-success" style={{ margin: '20px 36px' }}>{success}</div>}

      <main className="admin-content">
        {loading ? (
          <div className="dashboard-loading"><div className="spinner"></div><p>Loading administration data...</p></div>
        ) : (
          <>
            {/* TAB 1: SYSTEM OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <div className="admin-stats-grid">
                  <div className="metric-card card">
                    <div className="metric-label">Total Registered Users</div>
                    <div className="metric-value">{overview?.totalUsers || 0}</div>
                  </div>
                  <div className="metric-card card">
                    <div className="metric-label">Students Enrolled</div>
                    <div className="metric-value" style={{ color: 'var(--color-green-primary)' }}>
                      {overview?.totalStudents || 0}
                    </div>
                  </div>
                  <div className="metric-card card">
                    <div className="metric-label">Faculty Accounts</div>
                    <div className="metric-value">{overview?.totalFaculty || 0}</div>
                  </div>
                  <div className="metric-card card">
                    <div className="metric-label">Recruiter Accounts</div>
                    <div className="metric-value">{overview?.totalRecruiters || 0}</div>
                  </div>
                  <div className="metric-card card">
                    <div className="metric-label">Active vs Disabled</div>
                    <div className="metric-value" style={{ fontSize: '24px' }}>
                      <span style={{ color: 'var(--color-green-light)' }}>{overview?.activeAccounts || 0} Active</span>
                      <span style={{ color: 'var(--text-dim)', margin: '0 8px' }}>/</span>
                      <span style={{ color: 'var(--danger-color)' }}>{overview?.disabledAccounts || 0} Disabled</span>
                    </div>
                  </div>
                  <div className="metric-card card">
                    <div className="metric-label">Account Recovery Events</div>
                    <div className="metric-value" style={{ color: '#FACC15' }}>
                      {overview?.recoveryCount || 0}
                    </div>
                  </div>
                </div>

                {/* Recent System Activity */}
                <div className="card" style={{ marginTop: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3>Recent System Audit Events</h3>
                    <button onClick={() => setActiveTab('audit')} className="btn-outline btn-sm">Full Audit Trail →</button>
                  </div>
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Actor</th>
                          <th>Action</th>
                          <th>Target Account</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview?.recentLogs?.slice(0, 6).map((log) => (
                          <tr key={log.id}>
                            <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                            <td><strong>{log.actor}</strong></td>
                            <td><span className="badge" style={{ background: 'var(--bg-secondary)', color: 'var(--color-green-light)' }}>{log.action}</span></td>
                            <td>{log.target}</td>
                            <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{log.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: USER MANAGEMENT */}
            {activeTab === 'users' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                  <form onSubmit={handleSearchUsers} style={{ display: 'flex', gap: '12px', flexGrow: 1, maxWidth: '600px' }}>
                    <input
                      type="text"
                      placeholder="Search by name, email, or user ID..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ flexGrow: 1 }}
                    />
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                      <option value="All">All Roles</option>
                      <option value="STUDENT">Students</option>
                      <option value="FACULTY">Faculty</option>
                      <option value="RECRUITER">Recruiters</option>
                      <option value="ADMIN">Administrators</option>
                    </select>
                    <button type="submit" className="btn-secondary">Search</button>
                  </form>

                  <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                    + Create Privileged User
                  </button>
                </div>

                <div className="card table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>User Email / Name</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Temporary Credential</th>
                        <th>Created At</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>No users found.</td></tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id}>
                            <td>#{u.id}</td>
                            <td>
                              <strong>{u.email}</strong>
                              {u.fullName && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.fullName} ({u.department || 'Student'})</div>}
                            </td>
                            <td><span className="badge badge-ready">{u.role?.replace('ROLE_', '')}</span></td>
                            <td>
                              <span className={`badge ${u.isActive ? 'badge-ready' : 'badge-needs-dev'}`}>
                                {u.isActive ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td>
                              {u.passwordResetRequired ? (
                                <span style={{ color: '#FACC15', fontSize: '12px', fontWeight: 600 }}>Reset Required</span>
                              ) : (
                                <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>Normal</span>
                              )}
                            </td>
                            <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleToggleStatus(u.id)}
                                  className="btn-secondary btn-sm"
                                  title={u.isActive ? 'Disable account' : 'Enable account'}
                                >
                                  {u.isActive ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                  onClick={() => handleGenerateTempPassword(u.id, u.email)}
                                  className="btn-outline btn-sm"
                                  title="Generate Temporary Password"
                                >
                                  Reset Pwd
                                </button>
                                {u.role !== 'ROLE_ADMIN' && (
                                  <button
                                    onClick={() => handleDeleteUser(u.id, u.email)}
                                    className="btn-danger btn-sm"
                                    title="Delete user"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ACCOUNT RECOVERY WORKFLOW */}
            {activeTab === 'recovery' && (
              <div className="card">
                <h2>Admin-Assisted Account Recovery</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
                  When a student, faculty, or recruiter contacts you after forgetting their credentials, search for their account below and generate a secure temporary password. The temporary credential will be displayed to you <strong>once</strong>. When they log in with it, the system will automatically require them to choose a permanent password.
                </p>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', maxWidth: '600px' }}>
                  <input
                    type="text"
                    placeholder="Search account by email, name, or user ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flexGrow: 1 }}
                  />
                  <button onClick={handleSearchUsers} className="btn-primary">
                    Search Account
                  </button>
                </div>

                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>User Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Recovery Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 10).map((u) => (
                        <tr key={u.id}>
                          <td><strong>{u.email}</strong> {u.fullName ? `(${u.fullName})` : ''}</td>
                          <td><span className="badge badge-ready">{u.role?.replace('ROLE_', '')}</span></td>
                          <td>
                            <span className={`badge ${u.isActive ? 'badge-ready' : 'badge-needs-dev'}`}>
                              {u.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleGenerateTempPassword(u.id, u.email)}
                              className="btn-primary btn-sm"
                            >
                              Generate Temporary Password
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: AUDIT LOGS */}
            {activeTab === 'audit' && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2>System Audit Trail</h2>
                  <button onClick={loadAdminData} className="btn-secondary btn-sm">Refresh Logs</button>
                </div>
                <div className="table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Actor</th>
                        <th>Action</th>
                        <th>Target Account</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 ? (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>No audit logs recorded yet.</td></tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id}>
                            <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                            <td><strong>{log.actor}</strong></td>
                            <td><span className="badge badge-ready">{log.action}</span></td>
                            <td>{log.target}</td>
                            <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{log.details}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Privileged Account Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px' }}>Provision Privileged User Account</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Faculty, Recruiter, and Student accounts created here receive a secure temporary password and will be forced to set their permanent password upon first login.
            </p>

            <form onSubmit={handleCreateUserSubmit} className="modal-form">
              <div className="form-group">
                <label>Account Role *</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  required
                >
                  <option value="ROLE_FACULTY">Faculty / Academic Mentor</option>
                  <option value="ROLE_RECRUITER">Corporate Recruiter</option>
                  <option value="ROLE_STUDENT">Student</option>
                </select>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="user@careernavigator.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Smith"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                />
              </div>

              {createForm.role === 'ROLE_FACULTY' || createForm.role === 'ROLE_STUDENT' ? (
                <div className="form-group">
                  <label>Department</label>
                  <select
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                  </select>
                </div>
              ) : null}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create User & Issue Temp Credential</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Display Created User Credentials Modal */}
      {createdCredential && (
        <div className="modal-overlay" onClick={() => setCreatedCredential(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '12px', color: 'var(--color-green-primary)' }}>Account Provisioned Successfully</h3>
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>
              The account for <strong>{createdCredential.email}</strong> has been created. Provide this temporary credential to the user:
            </p>

            <div className="credential-box">
              <div className="cred-row"><span>Email:</span> <strong>{createdCredential.email}</strong></div>
              <div className="cred-row"><span>Role:</span> <strong>{createdCredential.role}</strong></div>
              <div className="cred-row">
                <span>Temporary Password:</span>
                <code className="temp-password-code">{createdCredential.temporaryPassword}</code>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '16px 0' }}>
              ⚠️ The user will be required to set their permanent password immediately upon login.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setCreatedCredential(null)} className="btn-primary">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Password Modal from Recovery */}
      {tempPassModal && (
        <div className="modal-overlay" onClick={() => setTempPassModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '12px', color: 'var(--color-green-primary)' }}>Temporary Password Generated</h3>
            <p style={{ fontSize: '14px', marginBottom: '16px' }}>
              Share this credential with <strong>{tempPassModal.email}</strong>. This password will expire after use and force a permanent password update.
            </p>

            <div className="credential-box">
              <div className="cred-row">
                <span>Temporary Password:</span>
                <code className="temp-password-code">{tempPassModal.temporaryPassword}</code>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setTempPassModal(null)} className="btn-primary">I Have Copied The Credential</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
