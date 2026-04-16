import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { AuthContext } from "../context/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useContext(AuthContext);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialTab = params.get("tab") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const oauthToken = params.get("token");
    const oauthStatus = params.get("oauth");

    if (oauthStatus === "success" && oauthToken) {
      login({
        token: oauthToken,
        user: {
          name: "OAuth User",
          email: "",
        },
      });
      navigate("/dashboard", { replace: true });
    }
  }, [login, navigate, params]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="page auth-page">
      <div className="auth-shell">
        <h1>Authentication</h1>
        <p>Choose login or signup and continue with secure OTP flow.</p>

        <div className="tabs">
          <button
            type="button"
            className={activeTab === "login" ? "tab active" : "tab"}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={activeTab === "signup" ? "tab active" : "tab"}
            onClick={() => setActiveTab("signup")}
          >
            Signup
          </button>
        </div>

        <AuthForm
          mode={activeTab}
          onSuccess={(data) => {
            login(data);
            navigate("/dashboard", { replace: true });
          }}
        />
      </div>
    </div>
  );
};

export default Auth;
