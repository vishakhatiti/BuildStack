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
      <div className="auth-ambient" aria-hidden="true" />
      <section className="auth-layout">
        <div className="auth-intro">
          <p className="intro-pill">Step 1 → Email · Step 2 → OTP</p>
          <h1>Secure access with zero friction.</h1>
          <p>Authenticate your BuildStack workspace with a fast 2-step OTP flow.</p>

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
        </div>

        <AuthForm
          mode={activeTab}
          onSuccess={(data) => {
            login(data);
            navigate("/dashboard", { replace: true });
          }}
        />
      </section>
    </main>
  );
};

export default Auth;
