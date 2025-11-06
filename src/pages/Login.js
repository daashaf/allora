import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../login.css";
import { ReactComponent as InfinityLogo } from "../assets/infinity-logo.svg";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:4000";

const ROLE_OPTIONS = [
  "Customer",
  "Administrator",
  "Customer Support",
  "Service Provider",
];

const formatRoleHeading = (role) => {
  if (!role) {
    return "";
  }

  const article = /^[aeiou]/i.test(role) ? "AN" : "A";
  return `LOGIN AS ${article} ${role.toUpperCase()}`;
};

export default function Login() {
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    region: "",
    email: "",
    password: "",
  });
  const [signupMessage, setSignupMessage] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0]);
  const navigate = useNavigate();
  const roleHeading = formatRoleHeading(selectedRole);

  useEffect(() => {
    const finishLoading = () => setIsLoading(false);
    if (document.readyState === "complete") {
      finishLoading();
    } else {
      window.addEventListener("load", finishLoading);
    }
    const timeoutId = window.setTimeout(finishLoading, 1200);

    return () => {
      window.removeEventListener("load", finishLoading);
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("body-lock");
    } else {
      document.body.classList.remove("body-lock");
    }

    return () => {
      document.body.classList.remove("body-lock");
    };
  }, [isLoading]);

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  const resetSignupState = () => {
    setSignupData({
      firstName: "",
      lastName: "",
      dob: "",
      region: "",
      email: "",
      password: "",
    });
    setSignupMessage("");
    setSignupError("");
    setSignupLoading(false);
  };

  const resetForgotState = () => {
    setResetStep(1);
    setResetEmail("");
    setInputCode("");
    setNewPassword("");
    setConfirmPassword("");
    setResetMessage("");
    setResetError("");
    setResetLoading(false);
  };

  const openForgot = () => {
    setForgotOpen(true);
    resetForgotState();
  };

  const openSignup = () => {
    setIsSignup(true);
    resetSignupState();
  };

  const closeSignup = () => {
    setIsSignup(false);
    resetSignupState();
  };

  const closeForgot = () => {
    setForgotOpen(false);
    resetForgotState();
  };

  const handleForgotSubmit = async (event) => {
    event.preventDefault();
    setResetError("");
    setResetMessage("");

    try {
      setResetLoading(true);

      if (resetStep === 1) {
        if (!resetEmail.trim() || !resetEmail.includes("@")) {
          setResetError("Please enter a valid email address.");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/reset/request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: resetEmail }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Could not send reset code.");
        }

        setResetStep(2);
        setInputCode("");
        setResetMessage(`We sent a 6-digit code to ${resetEmail}.`);
        return;
      }

      if (resetStep === 2) {
        if (!inputCode.trim()) {
          setResetError("Please enter the code you received.");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/reset/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: resetEmail,
            code: inputCode.trim(),
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Verification failed.");
        }

        setResetStep(3);
        setResetMessage("Code verified! Create a new password.");
        return;
      }

      if (resetStep === 3) {
        if (newPassword.length < 6) {
          setResetError("Password must be at least 6 characters.");
          return;
        }

        if (newPassword !== confirmPassword) {
          setResetError("Passwords do not match.");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/auth/reset/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: resetEmail,
            code: inputCode.trim(),
            password: newPassword,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Could not update password.");
        }

        setResetMessage("Password updated! You can now log in.");
        setTimeout(() => {
          closeForgot();
        }, 1800);
      }
    } catch (error) {
      setResetError(error.message || "Something went wrong. Try again.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    setSignupError("");
    setSignupMessage("");

    if (!signupData.firstName.trim() || !signupData.lastName.trim()) {
      setSignupError("Please provide your first and last name.");
      return;
    }

    if (!signupData.dob) {
      setSignupError("Please select your date of birth.");
      return;
    }

    if (!signupData.region) {
      setSignupError("Please choose your New Zealand region.");
      return;
    }

    if (!signupData.email.trim() || !signupData.email.includes("@")) {
      setSignupError("Please enter a valid email address.");
      return;
    }

    if (signupData.password.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSignupLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Unable to create account.");
      }

      setSignupMessage("Account created! Please check your email to verify.");
      setTimeout(() => {
        closeSignup();
      }, 2000);
    } catch (error) {
      setSignupError(error.message || "Something went wrong. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  const regions = [
    "Auckland",
    "Wellington",
    "Christchurch",
    "Hamilton",
    "Tauranga",
    "Dunedin",
    "Palmerston North",
    "Napier",
    "Rotorua",
    "New Plymouth",
    "Whangārei",
    "Nelson",
    "Invercargill",
    "Queenstown",
  ];

  const cardClassName = isSignup ? "card card--signup" : "card";

  return (
    <div className="admin-login-page">
      {isLoading && (
        <div className="page-loader" role="status" aria-live="polite">
          <InfinityLogo className="infinity-logo loader-logo" focusable="false" />
          <p className="loader-text">Loading Allora</p>
        </div>
      )}

      <div className="floating-circle circle-top" aria-hidden="true" />
      <div className="floating-circle circle-bottom" aria-hidden="true" />

      <header className="brand-wrap">
        <h1 className="brand">ALLORA SERVICE HUB</h1>
        <p className="role">{roleHeading}</p>
      </header>

      <section className={cardClassName}>
        {isSignup ? (
          <>
            <h2 className="card-title">Create Account</h2>
            <form className="login-form" onSubmit={handleSignupSubmit}>
              <div className="signup-row">
                <div className="field">
                  <label className="label" htmlFor="signup-first-name">
                    First Name
                  </label>
                  <input
                    id="signup-first-name"
                    name="firstName"
                    type="text"
                    className="input"
                    placeholder="First Name"
                    value={signupData.firstName}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
                <div className="field">
                  <label className="label" htmlFor="signup-last-name">
                    Last Name
                  </label>
                  <input
                    id="signup-last-name"
                    name="lastName"
                    type="text"
                    className="input"
                    placeholder="Last Name"
                    value={signupData.lastName}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label className="label" htmlFor="signup-dob">
                  Date of Birth
                </label>
                <input
                  id="signup-dob"
                  name="dob"
                  type="date"
                  className="input"
                  value={signupData.dob}
                  onChange={handleSignupChange}
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="signup-region">
                  Region (New Zealand)
                </label>
                <select
                  id="signup-region"
                  name="region"
                  className="input"
                  value={signupData.region}
                  onChange={handleSignupChange}
                  required
                >
                  <option value="">Select a city</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="signup-email">
                  Email Address
                </label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  className="input"
                  placeholder="Email Address"
                  value={signupData.email}
                  onChange={handleSignupChange}
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="signup-password">
                  Password
                </label>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  className="input"
                  placeholder="Create a password"
                  value={signupData.password}
                  onChange={handleSignupChange}
                  required
                />
              </div>

              {signupMessage && (
                <p className="reset-message success">{signupMessage}</p>
              )}
              {signupError && (
                <p className="reset-message error">{signupError}</p>
              )}

              <button type="submit" className="btn" disabled={signupLoading}>
                {signupLoading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <p className="hint">
              Already have an account?{" "}
              <button type="button" className="inline-link" onClick={closeSignup}>
                Log in
              </button>
            </p>

            <div className="card-logo" aria-hidden="true">
              <InfinityLogo className="infinity-logo" focusable="false" />
            </div>
          </>
        ) : (
          <>
            <h2 className="card-title">Login</h2>

            <form onSubmit={handleSubmit} className="login-form">
              <div className="field">
                <label className="label" htmlFor="login-role">
                  Login as
                </label>
                <select
                  id="login-role"
                  className="input"
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                >
                  {ROLE_OPTIONS.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleOption}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="label" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  className="input"
                  placeholder="Email Address"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="login-password">
                  Password
                </label>
                <div className="password-row">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="input"
                    placeholder="Password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    aria-label="Toggle password visibility"
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                      <path d="M12 5C7 5 2.73 8.11 1 12c1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="row-between">
                <button type="button" className="link" onClick={openForgot}>
                  Forgot Password
                </button>
              </div>

              <button type="submit" className="btn">
                Login
              </button>

              <p className="hint">
                Don't have an account?{" "}
                <button type="button" className="inline-link" onClick={openSignup}>
                  Sign up
                </button>
              </p>
            </form>

            <div className="card-logo" aria-hidden="true">
              <InfinityLogo className="infinity-logo" focusable="false" />
            </div>
          </>
        )}
      </section>

      {forgotOpen && (
        <div className="reset-overlay" role="dialog" aria-modal="true">
          <section className="reset-card">
            <header className="reset-header">
              <h3 className="reset-title">
                {resetStep === 1 && "Reset Password"}
                {resetStep === 2 && "Enter Verification Code"}
                {resetStep === 3 && "Create New Password"}
              </h3>
              <button
                type="button"
                className="reset-close"
                aria-label="Close reset password form"
                onClick={closeForgot}
              >
                {"\u00d7"}
              </button>
            </header>

            <form className="reset-form" onSubmit={handleForgotSubmit}>
              {resetStep === 1 && (
                <label className="reset-field">
                  <span>Email Address</span>
                  <input
                    type="email"
                    className="input"
                    value={resetEmail}
                    onChange={(event) => setResetEmail(event.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </label>
              )}

              {resetStep === 2 && (
                <label className="reset-field">
                  <span>Verification Code</span>
                  <input
                    type="text"
                    className="input"
                    value={inputCode}
                    onChange={(event) => setInputCode(event.target.value)}
                    placeholder="Enter 6-digit code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    required
                  />
                </label>
              )}

              {resetStep === 3 && (
                <>
                  <label className="reset-field">
                    <span>New Password</span>
                    <input
                      type="password"
                      className="input"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                  </label>
                  <label className="reset-field">
                    <span>Confirm Password</span>
                    <input
                      type="password"
                      className="input"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm new password"
                      required
                    />
                  </label>
                </>
              )}

              {resetMessage && (
                <p className="reset-message success">{resetMessage}</p>
              )}
              {resetError && <p className="reset-message error">{resetError}</p>}

              <button
                type="submit"
                className="btn reset-btn"
                disabled={resetLoading}
              >
                {resetLoading
                  ? resetStep === 1
                    ? "Sending..."
                    : resetStep === 2
                    ? "Verifying..."
                    : "Saving..."
                  : resetStep === 1
                  ? "Send Code"
                  : resetStep === 2
                  ? "Verify Code"
                  : "Save Password"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
