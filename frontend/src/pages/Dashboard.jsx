import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="badge">Protected Area</p>
          <h1>{`Welcome, ${user?.name || "Builder"}`}</h1>
          <p>{user?.email || "Authenticated with your BuildStack account."}</p>
        </div>
        <button onClick={handleLogout} type="button" className="btn btn-ghost">
          Logout
        </button>
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
