import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { refreshUser, logout } = useContext(AuthContext);
  const [params] = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const token = params.get("token");

      if (!token) {
        logout();
        navigate("/auth", { replace: true });
        return;
      }

      localStorage.setItem("token", token);

      try {
        await refreshUser();
        navigate("/dashboard", { replace: true });
      } catch {
        logout();
        navigate("/auth", { replace: true });
      }
    };

    run();
  }, [navigate, params, refreshUser, logout]);

  return (
    <div className="center-screen">
      <div className="spinner" />
      <p>Finalizing authentication...</p>
    </div>
  );
};

export default AuthSuccess;
