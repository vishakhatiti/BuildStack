import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import "../styles/dashboard.css";

const defaultStats = {
  totalProjects: 0,
  liveProjects: 0,
  failedProjects: 0,
  inProgressProjects: 0,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState(defaultStats);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const statCards = useMemo(
    () => [
      { label: "Total Projects", value: stats.totalProjects },
      { label: "Live Projects", value: stats.liveProjects, tone: "live" },
      { label: "Failed Projects", value: stats.failedProjects, tone: "failed" },
      { label: "In Progress", value: stats.inProgressProjects, tone: "in-progress" },
    ],
    [stats]
  );

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError("");
      const { data } = await API.get("/projects/dashboard");
      setStats(data?.stats || defaultStats);
      setProjects(data?.recentProjects || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <h1>{`Welcome ${user?.name || "Builder"}`}</h1>
          <p>{user?.email || "You are signed in with OTP authentication."}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout} type="button">
          Logout
        </button>
      </header>

      {isLoading ? <p>Loading dashboard...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <section className="stats-grid">
        {statCards.map((card) => (
          <article key={card.label} className={`stat-card ${card.tone || ""}`}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Recent Projects</h2>
            <button type="button" className="ghost-btn" onClick={loadDashboard}>
              Refresh
            </button>
          </div>

          <div className="project-list">
            {projects.length === 0 ? (
              <p className="empty-state">No projects yet. Stats structure is ready for live data.</p>
            ) : (
              projects.map((project) => (
                <div key={project._id} className="project-card">
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.techStack.join(" • ")}</p>
                  </div>
                  <span className={`badge ${project.status}`}>{project.status.replace("_", " ")}</span>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
