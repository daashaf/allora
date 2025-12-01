import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, onSnapshot, query, serverTimestamp } from "firebase/firestore";
import NavigationBar from "../../components/NavigationBar";
import { db, ensureFirebaseAuth } from "../../firebase";
import "./CustomerDashboard.css";

const NZ_CITIES = [
  "Auckland",
  "Wellington",
  "Christchurch",
  "Hamilton",
  "Tauranga",
  "Napier",
  "Hastings",
  "Dunedin",
  "Palmerston North",
  "Nelson",
  "Rotorua",
  "New Plymouth",
  "Whanganui",
  "Invercargill",
  "Whangārei",
  "Upper Hutt",
  "Lower Hutt",
  "Gisborne",
  "Blenheim",
  "Porirua",
  "Timaru",
  "Pukekohe",
  "Masterton",
  "Levin",
  "Taupō",
  "Hibiscus Coast",
];

export default function GetStarted() {
  const navigate = useNavigate();
  const location = useLocation();

  const prefillService = location?.state?.prefill || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    service: prefillService,
    providerEmail: "",
    details: "",
  });
  const [serviceOptions, setServiceOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (prefillService) {
      setFormData((prev) => ({ ...prev, service: prefillService }));
    }
  }, [prefillService]);

  useEffect(() => {
    let unsubscribe;
    const subscribe = async () => {
      try {
        await ensureFirebaseAuth();
      } catch (authErr) {
        console.warn("[GetStarted] auth not ready, continuing", authErr);
      }
      if (!db) return;
      const servicesQuery = query(collection(db, "Services"));
      unsubscribe = onSnapshot(servicesQuery, (snapshot) => {
        const names = snapshot.docs
          .map((docSnap) => docSnap.data()?.service || "")
          .filter(Boolean)
          .reduce((acc, name) => {
            const trimmed = name.trim();
            if (trimmed && !acc.includes(trimmed)) acc.push(trimmed);
            return acc;
          }, [])
          .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
        setServiceOptions(names);
      });
    };
    subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const isValid = useMemo(() => {
    return formData.name && formData.email && formData.service && formData.details;
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!isValid) {
      setError("Please fill in your name, email, service, and a short description.");
      return;
    }

    setSubmitting(true);
    try {
      await ensureFirebaseAuth();
      if (db) {
        await addDoc(collection(db, "ServiceRequests"), {
          ...formData,
          createdAt: serverTimestamp(),
          status: "New",
        });
      }

      await fetch("/requests/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      setMessage("Your request has been sent to the provider. We'll follow up shortly.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        service: prefillService,
        providerEmail: "",
        details: "",
      });
      setTimeout(() => navigate("/services"), 800);
    } catch (submitError) {
      console.error("[GetStarted] Submit failed", submitError);
      setError("We couldn't send your request right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page get-started-page">
      <div className="dashboard-circle circle-top" aria-hidden="true" />
      <div className="dashboard-circle circle-bottom" aria-hidden="true" />
      <NavigationBar />

      <main className="get-started-content">
        <section className="get-started-hero">
          <div>
            <p className="services-kicker">Start a request</p>
            <h1>Tell us what you need.</h1>
            <p className="services-subtitle">
              Share a few details and we’ll notify the right provider instantly.
            </p>
          </div>
        </section>

        <section className="get-started-form-card">
          <form className="get-started-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="name">Your name</label>
              <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="form-row two-col">
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="phone">Phone (optional)</label>
                <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row two-col">
              <div>
                <label htmlFor="city">City</label>
                <select id="city" name="city" value={formData.city} onChange={handleChange} required>
                  <option value="">Select a city</option>
                  {NZ_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="service">Service</label>
                <select id="service" name="service" value={formData.service} onChange={handleChange} required>
                  <option value="">Select a service</option>
                  {serviceOptions.map((serviceName) => (
                    <option key={serviceName} value={serviceName}>
                      {serviceName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <label htmlFor="providerEmail">Provider email (optional)</label>
              <input
                id="providerEmail"
                name="providerEmail"
                type="email"
                value={formData.providerEmail}
                onChange={handleChange}
                placeholder="If you have a preferred provider"
              />
            </div>

            <div className="form-row">
              <label htmlFor="details">Describe the job</label>
              <textarea
                id="details"
                name="details"
                rows={5}
                value={formData.details}
                onChange={handleChange}
                required
                placeholder="Share timing, budget, and any special instructions."
              />
            </div>

            {error && <div className="form-feedback error">{error}</div>}
            {message && <div className="form-feedback success">{message}</div>}

            <div className="form-actions">
              <button type="button" className="ghost" onClick={() => navigate("/services")}>
                Back to services
              </button>
              <button type="submit" className="nav-cta" disabled={!isValid || submitting}>
                {submitting ? "Sending…" : "Send to provider"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
