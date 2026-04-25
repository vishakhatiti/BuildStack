import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <main className="dashboard-wrap page-fade-in">
      <Card className="dashboard-card">
        <p className="hero-kicker">Authenticated session</p>
        <h1>Welcome to BuildStack</h1>
        <p className="dashboard-subtext">
          {user?.email
            ? `Signed in as ${user.email}.`
            : "You are successfully logged in with OAuth."}
        </p>

        <Button type="button" variant="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Card>
    </main>
  );
};

export default Dashboard;
