import { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API, { API_BASE_URL } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthToken = params.get("token");
    if (!oauthToken) return;

    const completeOauthLogin = async () => {
      try {
        localStorage.setItem("token", oauthToken);
        const { data } = await API.get("/auth/me");
        login({ token: oauthToken, user: data.user });
        navigate("/dashboard", { replace: true });
      } catch (_error) {
        setError("OAuth login failed. Please try again.");
      }
    };

    completeOauthLogin();
  }, [location.search, login, navigate]);

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const { data } = await API.post("/auth/login/request-otp", form);
      navigate("/verify-otp", {
        state: {
          otpSessionId: data.otpSessionId,
          email: data.email,
          purpose: "login",
        },
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to start login.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card fade-in-up">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in with email OTP or continue with your provider.</p>

        <div className="oauth-stack">
          <a className="oauth-btn" href={`${API_BASE_URL}/auth/oauth/google`}>
            Continue with Google
          </a>
          <a className="oauth-btn github" href={`${API_BASE_URL}/auth/oauth/github`}>
            Continue with GitHub
          </a>
        </div>

        <div className="auth-divider">or use email</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="email" type="email" placeholder="Work email" value={form.email} onChange={handleChange} required />
          <input
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending OTP..." : "Continue"}
          </button>
        </form>

        <p className="auth-footnote">
          New to BuildStack? <Link to="/register">Create account</Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
