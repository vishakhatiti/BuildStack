import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
        <p>Loading your workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default PrivateRoute;
