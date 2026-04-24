import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = ({ target: { name, value } }) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const { data } = await API.post("/auth/register", form);
      navigate("/verify-otp", {
        state: {
          otpSessionId: data.otpSessionId,
          email: data.email,
          purpose: "signup",
        },
      });
    } catch (requestError) {
      console.log(requestError.response?.data);
      setError(requestError.response?.data?.message || "Unable to start signup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-card fade-in-up">
        <h1>Create your BuildStack account</h1>
        <p className="auth-subtitle">Ship faster with secure access and project visibility.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Full name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Work email" value={form.email} onChange={handleChange} required />
          <input
            name="password"
            type="password"
            placeholder="Create password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending OTP..." : "Create account"}
          </button>
        </form>

        <p className="auth-footnote">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
