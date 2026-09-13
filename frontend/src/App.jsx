import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import PortalLogin from './pages/PortalLogin';
import StudentSignup from './pages/StudentSignup';
import ChangePassword from './pages/ChangePassword';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* 4 Dedicated Login Portals */}
        <Route
          path="/student/login"
          element={
            <PortalLogin
              portalType="student"
              title="Student Portal"
              subtitle="Student Login & Portfolio Access"
              apiEndpoint="/api/auth/student/login"
              allowSignup={true}
              dashboardRoute="/student/dashboard"
            />
          }
        />
        <Route
          path="/faculty/login"
          element={
            <PortalLogin
              portalType="faculty"
              title="Faculty Portal"
              subtitle="Department Cohort & Mentorship Access"
              apiEndpoint="/api/auth/faculty/login"
              allowSignup={false}
              dashboardRoute="/faculty/dashboard"
            />
          }
        />
        <Route
          path="/recruiter/login"
          element={
            <PortalLogin
              portalType="recruiter"
              title="Recruiter Portal"
              subtitle="Talent Discovery & Candidate Search"
              apiEndpoint="/api/auth/recruiter/login"
              allowSignup={false}
              dashboardRoute="/recruiter/dashboard"
            />
          }
        />
        <Route
          path="/admin/login"
          element={
            <PortalLogin
              portalType="admin"
              title="Administration Portal"
              subtitle="System Configuration & Account Governance"
              apiEndpoint="/api/auth/admin/login"
              allowSignup={false}
              dashboardRoute="/admin/dashboard"
            />
          }
        />

        {/* Student Signup */}
        <Route path="/student/signup" element={<StudentSignup />} />

        {/* Forced Password Reset */}
        <Route path="/change-password" element={<ChangePassword />} />

        {/* Role Dashboards */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Legacy redirects & Catch-all */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/student/signup" replace />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
