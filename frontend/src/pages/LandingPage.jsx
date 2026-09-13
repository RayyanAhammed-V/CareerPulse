import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="landing-brand">
          <div className="brand-icon">CN</div>
          <span className="brand-text">CAREER NAVIGATOR</span>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/student/login')} className="btn-outline">
            Student Login
          </button>
          <button onClick={() => navigate('/student/signup')} className="btn-primary">
            Create Student Account
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">Academic Employability & Readiness Platform</div>
        <h1 className="hero-title">
          Know where you stand.<br />
          <span className="text-highlight">Know what to improve.</span>
        </h1>
        <p className="hero-subtitle">
          Measure your skills, experience and academic readiness for your career journey with an objective, authoritative calculation engine.
        </p>
        <div className="hero-cta-group">
          <button onClick={() => navigate('/student/signup')} className="btn-primary hero-btn">
            Get Started — Sign Up Free
          </button>
          <button onClick={() => navigate('/student/login')} className="btn-secondary hero-btn">
            Sign In to Student Portal
          </button>
        </div>
      </section>

      {/* Four Dedicated Portals Section */}
      <section className="portals-section">
        <div className="section-header">
          <h2 className="section-title">Dedicated Access Portals</h2>
          <p className="section-subtitle">Choose your designated portal to access role-tailored dashboards and tools.</p>
        </div>

        <div className="portals-grid">
          {/* Student Portal Card */}
          <div className="portal-card" onClick={() => navigate('/student/login')}>
            <div className="portal-badge student-badge">Students</div>
            <h3 className="portal-title">Student Portal</h3>
            <p className="portal-desc">
              Maintain your verified skills, projects, certifications, internships, and hackathons. Track your live employability score and personalized improvement recommendations.
            </p>
            <div className="portal-footer">
              <span className="portal-link">Enter Student Portal →</span>
            </div>
          </div>

          {/* Faculty Portal Card */}
          <div className="portal-card" onClick={() => navigate('/faculty/login')}>
            <div className="portal-badge faculty-badge">Faculty & Mentors</div>
            <h3 className="portal-title">Faculty Portal</h3>
            <p className="portal-desc">
              Monitor student cohort readiness, department distribution metrics, skill trends, and identify students needing early interventions before campus placement drives.
            </p>
            <div className="portal-footer">
              <span className="portal-link">Enter Faculty Portal →</span>
            </div>
          </div>

          {/* Recruiter Portal Card */}
          <div className="portal-card" onClick={() => navigate('/recruiter/login')}>
            <div className="portal-badge recruiter-badge">Talent Acquisition</div>
            <h3 className="portal-title">Recruiter Portal</h3>
            <p className="portal-desc">
              Search and filter high-readiness candidates based on verified skills, minimum score thresholds, internship experience, and technical achievements.
            </p>
            <div className="portal-footer">
              <span className="portal-link">Enter Recruiter Portal →</span>
            </div>
          </div>

          {/* Administration Portal Card */}
          <div className="portal-card" onClick={() => navigate('/admin/login')}>
            <div className="portal-badge admin-badge">Administration</div>
            <h3 className="portal-title">Administration Portal</h3>
            <p className="portal-desc">
              Manage system users, authorize faculty and recruiter accounts, perform secure account recoveries with temporary credentials, and audit administrative events.
            </p>
            <div className="portal-footer">
              <span className="portal-link">Enter Admin Portal →</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Methodology Highlights */}
      <section className="features-section">
        <div className="feature-card">
          <div className="feature-score">25%</div>
          <div className="feature-info">
            <h4>Verified Technical Skills</h4>
            <p>Industry-aligned proficiencies assessed from beginner to expert levels.</p>
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-score">20%</div>
          <div className="feature-info">
            <h4>Hands-on Projects</h4>
            <p>Practical real-world projects with source repository code verification.</p>
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-score">20%</div>
          <div className="feature-info">
            <h4>Internship Experience</h4>
            <p>Direct exposure to enterprise production workflows and engineering teams.</p>
          </div>
        </div>
        <div className="feature-card">
          <div className="feature-score">15%</div>
          <div className="feature-info">
            <h4>Professional Certifications</h4>
            <p>Accredited vendor and cloud certifications demonstrating specialized competence.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-left">
          <span className="footer-brand">CAREER NAVIGATOR</span>
          <p className="footer-copy">Student Employability and Skill Readiness Assessment System.</p>
        </div>
        <div className="footer-links">
          <span onClick={() => navigate('/student/login')}>Student</span>
          <span onClick={() => navigate('/faculty/login')}>Faculty</span>
          <span onClick={() => navigate('/recruiter/login')}>Recruiter</span>
          <span onClick={() => navigate('/admin/login')}>Admin</span>
        </div>
      </footer>
    </div>
  );
}
