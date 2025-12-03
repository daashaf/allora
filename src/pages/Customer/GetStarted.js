import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addDoc, collection, onSnapshot, query, serverTimestamp } from "firebase/firestore";
import NavigationBar from "../../components/NavigationBar";
import { addBooking, calculateCommission, parsePrice, COMMISSION_RATE } from "../../commission";
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
  const prefillBasePrice = location?.state?.basePrice || "";
  const prefillTotalPrice = location?.state?.totalPrice || "";
  const prefillProviderId = location?.state?.providerId || "";
  const prefillProviderName = location?.state?.providerName || "";
  const prefillProviderEmail = location?.state?.providerEmail || "";

  const prefillTotals = prefillBasePrice
    ? calculateCommission(prefillBasePrice, COMMISSION_RATE)
    : prefillTotalPrice
    ? { totalPrice: parsePrice(prefillTotalPrice) }
    : null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    service: prefillService,
    providerEmail: prefillProviderEmail,
    providerId: prefillProviderId,
    providerName: prefillProviderName,
    details: "",
    quotedPrice: prefillTotals?.totalPrice
      ? String(prefillTotals.totalPrice)
      : prefillBasePrice
      ? String(prefillBasePrice)
      : "",
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

  const pricing = useMemo(() => {
    const customerPrice = parsePrice(
      formData.quotedPrice || prefillTotalPrice || prefillBasePrice || 0
    );
    const basePrice = customerPrice > 0 ? customerPrice / (1 + COMMISSION_RATE) : 0;
    return calculateCommission(basePrice, COMMISSION_RATE);
  }, [formData.quotedPrice, prefillBasePrice, prefillTotalPrice]);

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
      // Try auth but don't fail the request if auth isn't ready (use public rules/demo).
      try {
        await ensureFirebaseAuth();
      } catch (authErr) {
        console.warn("[GetStarted] auth not ready, continuing", authErr);
      }

      let savedToFirestore = false;

      if (db) {
        try {
          await addDoc(collection(db, "ServiceRequests"), {
            ...formData,
            createdAt: serverTimestamp(),
            status: "New",
            basePrice: pricing.basePrice,
            totalPrice: pricing.totalPrice,
            commissionAmount: pricing.commissionAmount,
            commissionRate: pricing.commissionRate,
          });

          const orderDoc = await addDoc(collection(db, "Order"), {
            email: formData.email,
            customerName: formData.name,
            customerEmail: formData.email,
            phone: formData.phone || "",
            city: formData.city || "",
            service: formData.service,
            description: formData.details,
            providerEmail: (formData.providerEmail || "").toLowerCase(),
            providerId: formData.providerId || prefillProviderId || "",
            providerName: formData.providerName || prefillProviderName || "",
            priceToPay: pricing.totalPrice,
            fullPrice: pricing.totalPrice,
            totalPrice: pricing.totalPrice,
            basePrice: pricing.basePrice,
            commissionAmount: pricing.commissionAmount,
            commissionRate: pricing.commissionRate,
            createdAt: serverTimestamp(),
            status: "Pending",
          });

          if (formData.providerEmail) {
            await addDoc(collection(db, "Notification"), {
              audience: "Service Providers",
              channel: "In-App",
              providerEmail: formData.providerEmail.toLowerCase(),
              providerId: formData.providerId || "",
              subject: "New booking request",
              message: `${formData.name} has requested ${formData.service}. Check your dashboard to accept or decline this booking.`,
              status: "Sent",
              sentAt: serverTimestamp(),
            });
          }
          savedToFirestore = true;
        } catch (firestoreErr) {
          console.warn("[GetStarted] Firestore save failed, will still continue", firestoreErr);
        }
      }

      // Send email notification best-effort; do not fail the booking on email issues.
      try {
        await fetch("/requests/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } catch (notifyErr) {
        console.warn("[GetStarted] Request email failed (ignored)", notifyErr);
      }

      // Only use addBooking as fallback if Firestore failed
      if (!savedToFirestore) {
        await addBooking({
          service: formData.service,
          providerEmail: formData.providerEmail || prefillProviderEmail,
          providerId: formData.providerId || prefillProviderId,
          providerName: formData.providerName || prefillProviderName,
          customerName: formData.name,
          customerEmail: formData.email,
          city: formData.city,
          basePrice: pricing.basePrice,
          totalPrice: pricing.totalPrice,
          commissionAmount: pricing.commissionAmount,
          commissionRate: pricing.commissionRate,
          status: "Booked",
          source: "GetStarted",
        });
      }

      if (!savedToFirestore && !db) {
        console.warn("[GetStarted] No Firestore available; booking stored locally only.");
      }

      setMessage("Your request has been sent to the provider. We'll follow up shortly.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        service: prefillService,
        providerEmail: "",
        providerId: "",
        providerName: "",
        details: "",
        quotedPrice: "",
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
                <input
                  id="service"
                  name="service"
                  list="service-options"
                  type="text"
                  value={formData.service}
                  onChange={handleChange}
                  required
                  placeholder="Select or type a service"
                />
                <datalist id="service-options">
                  {serviceOptions.map((serviceName) => (
                    <option key={serviceName} value={serviceName} />
                  ))}
                </datalist>
                {!serviceOptions.length && (
                  <small className="text-muted">Start typing the service you need.</small>
                )}
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

            <div className="form-row two-col">
              <div>
                <label htmlFor="quotedPrice">Price to pay</label>
                <input
                  id="quotedPrice"
                  name="quotedPrice"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={formData.quotedPrice}
                  onChange={handleChange}
                  placeholder="Total price for this booking"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <label style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Full price (shown to customer)</label>
                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: "10px 12px",
                    background: "#f8fafc",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  ${pricing.totalPrice.toFixed(2)}
                  <span style={{ display: "block", fontSize: 12, fontWeight: 400, color: "#475569" }}>
                    Standard fee is already included. We split payouts automatically.
                  </span>
                </div>
              </div>
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

