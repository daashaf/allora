import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as InfinityLogo } from "../../assets/infinity-logo.svg";
import { addServiceProvider } from "../../serviceProviderCRUD";
import "../Customer/Login.css";

export default function ProviderRegistration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    address: "",
    category: "Home Services",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    if (!formData.businessName || !formData.ownerName || !formData.email) {
      setMessage("Please complete the required fields.");
      return;
    }

    try {
      setSubmitting(true);
      await addServiceProvider({
        ...formData,
        status: "Pending",
        providerId: `SP-${Date.now()}`,
      });
      setMessage("Thanks! Your provider registration was submitted and is pending review.");
      setFormData({
        businessName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        category: "Home Services",
      });
    } catch (error) {
      console.error("Failed to register provider", error);
      setMessage("Unable to submit registration. Please try again.");
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
            <p className="role">Service Provider</p>
          </div>

          <section className="card" style={{ maxWidth: 520 }}>
            <h2 className="card-title">Provider Registration</h2>
            <p className="card-subtitle">Tell us about your business to join the platform.</p>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="label" htmlFor="businessName">Business Name</label>
                <input
                  id="businessName"
                  name="businessName"
                  className="input"
                  type="text"
                  placeholder="e.g. Acme Home Services"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="ownerName">Owner / Contact Name</label>
                <input
                  id="ownerName"
                  name="ownerName"
                  className="input"
                  type="text"
                  placeholder="Full name"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  className="input"
                  type="tel"
                  placeholder="+64 21 000 0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  className="input"
                  type="text"
                  placeholder="Street, City"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  className="input"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option>Home Services</option>
                  <option>Technology</option>
                  <option>Health & Wellness</option>
                  <option>Events</option>
                  <option>Consulting</option>
                  <option>Other</option>
                </select>
              </div>

              {message && (
                <p className="reset-message" role="alert" style={{ marginTop: 4 }}>
                  {message}
                </p>
              )}

              <div className="row-between">
                <button type="button" className="link" onClick={() => navigate(-1)}>
                  Back
                </button>
                <button type="submit" className="btn" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="login-visual" aria-hidden="true">
          <div className="login-visual-inner">
            <div className="visual-logo">
              <InfinityLogo className="infinity-logo" focusable="false" />
            </div>
            <p className="visual-eyebrow">ALLORA</p>
            <h2>Grow your services with Allora.</h2>
            <p>Register your business and we’ll review your profile to get you live.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
