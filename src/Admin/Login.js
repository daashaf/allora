import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./login.css";
import { auth, db } from "../firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth || !db) return undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists()
          ? snap.data()?.role || snap.data()?.Role || snap.data()?.userType
          : null;
        if (role === "Administrator") {
          navigate("/admin/dashboard", { replace: true });
        }
      } catch (error) {
        console.warn("[Auth] Failed to pre-check admin role", error);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const getUserRole = async (uid) => {
    if (!db) return null;
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return data.role || data.Role || data.userType || null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!auth) {
      setError("Firebase is not configured. Add your keys to .env to enable admin login.");
      return;
    }

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setSubmitting(true);
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const role = await getUserRole(credential.user.uid);

      if (role === "Administrator") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("This account is not authorized for administrator access.");
        await signOut(auth);
      }
    } catch (signInError) {
      if (signInError?.code === "auth/invalid-credential") {
        setError("Invalid administrator credentials.");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="bg-decor" aria-hidden="true" />

      <header className="brand-wrap">
        <h1 className="brand">ALLORA SERVICE HUB</h1>
        <p className="role">AS AN ADMIN</p>
      </header>

      <main className="card">
        <h2 className="card-title">Login</h2>

        <form className="form" onSubmit={handleSubmit}>
          <label className="label" htmlFor="admin-email">
            Email Address
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            placeholder="Email Address"
            className="input"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label className="label space-top" htmlFor="admin-password">
            Password
          </label>
          <div className="password-row">
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="input"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              className="eye-btn"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="row-between">
            <button
              type="button"
              className="link"
              onClick={() => navigate("/admin/forgot-password")}
            >
              Forgot Password?
            </button>
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

        <p className="hint">
          Need another role?{" "}
          <button className="link-strong" type="button" onClick={() => navigate("/login")}>
            Go back
          </button>
        </p>
      </main>
    </div>
  );
}
