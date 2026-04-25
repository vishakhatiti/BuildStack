import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Card from "../components/ui/Card";
import OAuthButton from "../components/ui/OAuthButton";

const GOOGLE_OAUTH_URL = "https://buildstack-kmdz.onrender.com/api/auth/google";
const GITHUB_OAUTH_URL = "https://buildstack-kmdz.onrender.com/api/auth/github";

const Auth = () => {
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [activeTab, setActiveTab] = useState(query.get("tab") === "signup" ? "signup" : "signin");

  useEffect(() => {
    setActiveTab(query.get("tab") === "signup" ? "signup" : "signin");
  }, [query]);

  return (
    <main className="auth-shell page-fade-in">
      <Card className="auth-card clean-auth-card">
        <Link to="/" className="auth-backlink">
          ← Back to home
        </Link>
        <h1>{activeTab === "signin" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-subtext">
          {activeTab === "signin"
            ? "Sign in instantly with your trusted OAuth provider."
            : "Start using BuildStack with secure OAuth onboarding."}
        </p>

        <div className="tabs" role="tablist" aria-label="Authentication tabs">
          <button
            type="button"
            className={activeTab === "signin" ? "tab active" : "tab"}
            onClick={() => setActiveTab("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            className={activeTab === "signup" ? "tab active" : "tab"}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>

        <div className="oauth-grid auth-oauth-grid">
          <OAuthButton provider="google" onClick={() => (window.location.href = GOOGLE_OAUTH_URL)}>
            Continue with Google
          </OAuthButton>
          <OAuthButton provider="github" onClick={() => (window.location.href = GITHUB_OAUTH_URL)}>
            Continue with GitHub
          </OAuthButton>
        </div>
      </Card>
    </main>
  );
};

export default Auth;
