import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/ui/Button";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useContext(AuthContext);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsProfileLoading(true);
        const { data } = await API.get("/auth/me");
        setUser(data.user);
      } catch {
        logout();
        navigate("/auth", { replace: true });
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfile();
  }, [logout, navigate, setUser]);

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  if (isProfileLoading) {
    return (
      <div className="page dashboard-page">
        <header className="dashboard-header">
          <div className="skeleton-line long" />
          <div className="skeleton-line short" />
        </header>
        <section className="dashboard-layout">
          <article className="panel skeleton-panel">
            <div className="skeleton-line medium" />
            <div className="skeleton-line long" />
            <div className="skeleton-line long" />
          </article>
        </section>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="badge">Protected Area</p>
          <h1>{`Welcome, ${user?.name || "Builder"}`}</h1>
          <p>{user?.email || "Authenticated with your BuildStack account."}</p>
        </div>
        <Button onClick={handleLogout} type="button" variant="ghost">
          Logout
        </Button>
      </header>

      <section className="dashboard-layout">
        <article className="panel">
          <h2>Workspace</h2>
          <p>This dashboard shell is ready for your upcoming BuildStack features and modules.</p>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
