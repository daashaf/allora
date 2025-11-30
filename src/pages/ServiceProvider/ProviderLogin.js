import React from "react";
import { ReactComponent as InfinityLogo } from "../../assets/infinity-logo.svg";
import "../Customer/Login.css";

export default function ProviderLogin() {
  return (
    <div className="admin-login-page">
      <div className="floating-circle circle-top" aria-hidden="true" />
      <div className="floating-circle circle-bottom" aria-hidden="true" />

      <div className="login-shell">
        <div className="login-panel">
          <div className="brand-wrap">
            <h1 className="brand">ALLORA SERVICE HUB</h1>
            <p className="role">Service Provider</p>
          </div>

          <section className="card" style={{ maxWidth: 460 }}>
            <h2 className="card-title">Provider Login</h2>

            <form className="login-form">
              <div className="field">
                <label className="label">Email Address</label>
                <input className="input" type="email" placeholder="Email Address" disabled />
              </div>

              <div className="field">
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="Password" disabled />
              </div>

              <button type="button" className="btn" disabled>
                Coming Soon
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
            <h2>Calm workspace for bookings and support.</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
