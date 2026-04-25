import { useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { login, logout } = useContext(AuthContext);
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      logout();
      navigate("/auth", { replace: true });
      return;
    }

    localStorage.setItem("token", token);
    login({ token });
    navigate("/dashboard", { replace: true });
  }, [login, logout, navigate, params]);

  return (
    <div className="center-screen">
      <div className="spinner" />
      <p>Completing sign-in…</p>
    </div>
  );
};

export default AuthSuccess;
