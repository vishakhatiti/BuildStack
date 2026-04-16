import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { AuthContext } from "../context/AuthContext";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isAuthLoading } = useContext(AuthContext);

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
    if (!isAuthLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  return (
    <main className="auth-shell page-fade-in">
      <section className="auth-intro">
        <p className="intro-pill">Landing → Auth → OTP → Dashboard</p>
        <h1>Authentication</h1>
        <p>Secure OTP sign in designed for daily developer workflows.</p>

        <div className="tabs" role="tablist" aria-label="auth mode tabs">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "login"}
            className={activeTab === "login" ? "tab active" : "tab"}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "signup"}
            className={activeTab === "signup" ? "tab active" : "tab"}
            onClick={() => setActiveTab("signup")}
          >
            Signup
          </button>
        </div>
      </section>

      <AuthForm
        mode={activeTab}
        onSuccess={(data) => {
          login(data);
          navigate("/dashboard", { replace: true });
        }}
      />
    </main>
  );
};

export default Auth;
