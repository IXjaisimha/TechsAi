import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import CompanyDashboard from './pages/Admin/CompanyDashboard';
import PostJob from './pages/Admin/PostJob';
import EditJob from './pages/Admin/EditJob';
import UserDashboard from './pages/User/UserDashboard';
import JobDetails from './pages/User/JobDetails';
import ApplyJob from './pages/User/ApplyJob';
import JobApplicants from './pages/Admin/JobApplicants';
import ApplicantDetail from './pages/Admin/ApplicantDetail';
import Applications from './pages/User/Applications';
import Profile from './pages/User/Profile';



// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (role && user.role && user.role.toLowerCase() !== role.toLowerCase()) {
    // Prevent infinite loop by not redirecting to home if home auto-redirects
    return <div className="p-8 text-center text-red-500">Unauthorized Access. Expected role: {role}, Got: {user.role}</div>;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* User Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          } />

          <Route path="/jobs/:id" element={
            <ProtectedRoute role="user">
              <JobDetails />
            </ProtectedRoute>
          } />

          <Route path="/jobs/:id/apply" element={
            <ProtectedRoute role="user">
              <ApplyJob />
            </ProtectedRoute>
          } />

          <Route path="/applications" element={
            <ProtectedRoute role="user">
              <Applications />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute role="user">
              <Profile />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/company/dashboard" element={
            <ProtectedRoute role="admin">
              <CompanyDashboard />
            </ProtectedRoute>
          } />

          <Route path="/company/jobs/new" element={
            <ProtectedRoute role="admin">
              <PostJob />
            </ProtectedRoute>
          } />

          <Route path="/company/jobs/:id/edit" element={
            <ProtectedRoute role="admin">
              <EditJob />
            </ProtectedRoute>
          } />

          <Route path="/company/jobs/:id" element={
            <ProtectedRoute role="admin">
              <JobApplicants />
            </ProtectedRoute>
          } />

          <Route path="/company/applicants/:appId" element={
            <ProtectedRoute role="admin">
              <ApplicantDetail />
            </ProtectedRoute>
          } />

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
