import React, { useState } from "react";
import "./login.css";

/* ✅ Added import for navigation */
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [show, setShow] = useState(false);

  /* ✅ Added useNavigate hook */
  const navigate = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    // TODO: wire up to your authentication later
    alert("Login clicked");

    /* ✅ Added redirect to admin dashboard */
    navigate("/admin/dashboard");
  }

  return (
    <div className="admin-login-page">
      {/* Decorative background */}
      <div className="bg-decor" aria-hidden="true" />

      {/* Header / Branding */}
      <header className="brand-wrap">
        <h1 className="brand">ALLORA SERVICE HUB</h1>
        <p className="role">AS AN ADMIN</p>
      </header>

      {/* Main login card */}
      <main className="card">
        <h2 className="card-title">Login</h2>

        <form className="form" onSubmit={onSubmit}>
          {/* Email */}
          <label className="label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email Address"
            className="input"
            required
          />

          {/* Password */}
          <label className="label space-top" htmlFor="password">
            Password
          </label>
          <div className="password-row">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              placeholder="Password"
              className="input"
              required
            />
            <button
              type="button"
              className="eye-btn"
              aria-label={show ? "Hide password" : "Show password"}
              onClick={() => setShow((s) => !s)}
            >
              {show ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Forgot password */}
          <div className="row-between">
            <a className="link" href="/forgot-password">
              Forgot Password?
            </a>
          </div>

          {/* Login button */}
          <button type="submit" className="btn">
            Login
          </button>

          {/* Signup link */}
          <p className="hint">
            Don’t have an account?{" "}
            <a className="link-strong" href="#signup">
              Sign up
            </a>
          </p>
        </form>
      </main>
    </div>
  );
}
