import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ReactComponent as InfinityLogo } from "../../assets/infinity-logo.svg";
import "../Customer/Login.css";

export default function AgentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    try {
      setSubmitting(true);
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/support", { replace: true });
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="floating-circle circle-top" aria-hidden="true" />
      <div className="floating-circle circle-bottom" aria-hidden="true" />

      <div className="login-shell">
        <div className="login-panel">
          <div className="brand-wrap">
            <h1 className="brand">ALLORA SERVICE HUB</h1>
            <p className="role">Customer Support</p>
          </div>

          <section className="card" style={{ maxWidth: 460 }}>
            <h2 className="card-title">Agent Login</h2>
            <p className="card-subtitle">Access the agent workspace to handle customer tickets.</p>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="field">
                <label className="label" htmlFor="agent-email">
                  Email Address
                </label>
                <input
                  id="agent-email"
                  type="email"
                  className="input"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="agent-password">
                  Password
                </label>
                <div className="password-row">
                  <input
                    id="agent-password"
                    type={showPassword ? "text" : "password"}
                    className="input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                      <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                    </svg>
                  </button>
                </div>
              </div>

              {error && (
                <p className="reset-message error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? "Signing in..." : "Login"}
              </button>
            </form>
          </section>
        </div>

        <div className="login-visual" aria-hidden="true">
          <div className="login-visual-inner">
            <div className="visual-logo">
              <InfinityLogo className="infinity-logo" focusable="false" />
            </div>
            <p className="visual-eyebrow">ALLORA</p>
            <h2>Calm workspace for support and tickets.</h2>
            <p>Track every request with friendly status cards and on-call support.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
