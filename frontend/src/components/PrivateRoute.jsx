import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  if (isAuthLoading) {
    return <div className="auth-shell">Loading your workspace...</div>;
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
