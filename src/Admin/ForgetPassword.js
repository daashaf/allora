import React, { useState } from "react";
import "./login.css"; // reuse same design

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage("??? Please enter your email address.");
      return;
    }
    setMessage(`??? Password reset link sent to ${email}`);
    setEmail("");
  };

  return (
    <div className="admin-login-page">
      <header className="brand-wrap">
        <h1 className="brand">ALLORA SERVICE HUB</h1>
        <p className="role">AS AN ADMIN</p>
      </header>

      <main className="card">
        <h2 className="card-title">Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn" style={{ marginTop: "18px" }}>
            Send Reset Link
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "12px",
              fontSize: "13px",
              fontWeight: 600,
              color: message.startsWith("???") ? "#2ecc71" : "#e74c3c",
              textAlign: "center",
            }}
          >
            {message}
          </p>
        )}

        <p className="hint">
          <a className="link-strong" href="/">Back to Login</a>
        </p>
      </main>
    </div>
  );
}
