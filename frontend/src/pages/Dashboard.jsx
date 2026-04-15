import "../styles/dashboard.css";
const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">BuildStack</h2>
        <nav>
          <ul>
            <li className="active">Dashboard</li>
            <li>Projects</li>
            <li>Profile</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main">
        <h1>Dashboard</h1>

        {/* Stats */}
        <div className="stats">
          <div className="card">
            <h3>Total Projects</h3>
            <p>12</p>
          </div>

          <div className="card">
            <h3>Live</h3>
            <p className="live">8</p>
          </div>

          <div className="card">
            <h3>Failed</h3>
            <p className="failed">2</p>
          </div>

          <div className="card">
            <h3>In Progress</h3>
            <p className="progress">2</p>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="projects">
          <h2>Recent Projects</h2>

          <div className="project-card">
            <h3>BuildStack</h3>
            <p>MERN Stack</p>
            <span className="badge live">Live</span>
          </div>

          <div className="project-card">
            <h3>Resume AI</h3>
            <p>React + ML</p>
            <span className="badge failed">Failed</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;