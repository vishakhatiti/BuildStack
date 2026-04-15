import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { useContext } from "react";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OTPVerification from "./pages/OTPVerification";
import { AuthContext } from "./context/AuthContext";
import "./styles/landing.css";
import "./styles/auth.css";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return <div className="auth-shell">Loading your workspace...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<OTPVerification />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default App;
