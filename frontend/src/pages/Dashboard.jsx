import { useContext, useEffect, useMemo, useState } from "react";
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
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState(defaultStats);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectForm, setProjectForm] = useState({ name: "", techStack: "", status: "in_progress" });
  const [isAddingProject, setIsAddingProject] = useState(false);

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
      const { data } = await API.get("/projects/dashboard");
      setStats(data.stats);
      setProjects(data.recentProjects);
    } catch (_error) {
      setError("Could not load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleAddProject = async (event) => {
    event.preventDefault();
    setIsAddingProject(true);
    setError("");

    try {
      await API.post("/projects", {
        ...projectForm,
        techStack: projectForm.techStack,
      });
      setProjectForm({ name: "", techStack: "", status: "in_progress" });
      await loadDashboard();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to add project");
    } finally {
      setIsAddingProject(false);
    }
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <h1>{`Welcome back, ${user?.name || "Builder"}`}</h1>
          <p>Track delivery health and keep your portfolio production-ready.</p>
        </div>
        <button className="logout-btn" onClick={logout} type="button">
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
              View Projects
            </button>
          </div>

          <div className="project-list">
            {projects.length === 0 ? (
              <p className="empty-state">No projects yet. Add your first project to start tracking.</p>
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

        <article className="panel">
          <div className="panel-header">
            <h2>Quick Actions</h2>
          </div>

          <form className="quick-form" onSubmit={handleAddProject}>
            <input
              type="text"
              placeholder="Project name"
              value={projectForm.name}
              onChange={(event) => setProjectForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Tech stack (comma separated)"
              value={projectForm.techStack}
              onChange={(event) => setProjectForm((prev) => ({ ...prev, techStack: event.target.value }))}
              required
            />
            <select
              value={projectForm.status}
              onChange={(event) => setProjectForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="in_progress">In Progress</option>
              <option value="live">Live</option>
              <option value="failed">Failed</option>
            </select>
            <button type="submit" disabled={isAddingProject}>
              {isAddingProject ? "Adding..." : "Add Project"}
            </button>
          </form>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
