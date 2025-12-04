import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query } from "firebase/firestore";
import NavigationBar from "../../components/NavigationBar";
import { calculateCommission, parsePrice } from "../../commission";

import { auth, db, ensureFirebaseAuth, isBackgroundUserSession } from "../../firebase";

import "./CustomerDashboard.css";

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe;
    let mounted = true;

    const subscribeToServices = async () => {
      try {
        await ensureFirebaseAuth();
      } catch (authError) {
        console.warn("[Services] Auth not ready, continuing with public access.", authError);
      }

      if (!db) {
        if (mounted) {
          setError("Services are unavailable right now. Please try again soon.");
          setLoading(false);
        }
        return;
      }

      const servicesQuery = query(collection(db, "Services"));

      unsubscribe = onSnapshot(
        servicesQuery,
        (snapshot) => {
          if (!mounted) return;
          const allowedStatuses = ["approved", "active", "published", "live"];
          const blockedStatuses = ["suspended", "rejected"];

          const docs = snapshot.docs
            .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
            .filter((service) => {
              const status = (service.status || "").toLowerCase();
              if (blockedStatuses.includes(status)) return false;
              const visible = service.visible !== false;
              const isAllowedStatus =
                allowedStatuses.includes(status) || status === "" || status === "pending";
              return visible && isAllowedStatus;
            })
            .sort((a, b) => (a.service || "").localeCompare(b.service || "", undefined, { sensitivity: "base" }));

          setServices(docs);
          setLoading(false);
        },
        (snapshotError) => {
          console.warn("[Services] Failed to load services", snapshotError);
          if (mounted) {
            setError("We couldn't load services right now. Please refresh and try again.");
            setLoading(false);
          }
        }
      );
    };

    subscribeToServices();

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const requireCustomerLogin = (redirectPath = "/get-started", redirectState = null) => {
    const user = auth?.currentUser;
    if (!user || isBackgroundUserSession(user)) {
      navigate("/login", { state: { from: { pathname: redirectPath, state: redirectState } } });
      return false;
    }
    return true;
  };

  const liveCount = useMemo(() => services.length, [services]);

  const handleHire = (service) => {
    const basePrice = parsePrice(service?.price || service?.rate || 0);
    const { totalPrice } = calculateCommission(basePrice);
    const redirectState = {
      prefill: service?.service || service?.serviceName || service || "",
      providerEmail: service?.email || service?.providerEmail || service?.provider_email || "",
      providerName: service?.provider || service?.company || service?.providerName || "",
      providerId: service?.providerId || service?.providerID || service?.id || "",
      basePrice,
      totalPrice,
    };

    if (!requireCustomerLogin("/get-started", redirectState)) return;
    navigate("/get-started", { state: redirectState });

  };

  return (
    <div className="dashboard-page services-page">
      <div className="dashboard-circle circle-top" aria-hidden="true" />
      <div className="dashboard-circle circle-bottom" aria-hidden="true" />
      <NavigationBar activeSection="services" />

      <main className="services-content">
        <section className="services-hero">
          <div>
            <p className="services-kicker">Live services</p>
            <h1>Service Directory</h1>
            <p className="services-subtitle">
              Browse curated categories and providers. Hire directly without back-and-forth.
            </p>
          </div>
          <div className="services-actions">
            <button
              type="button"
              className="nav-cta"
              onClick={() => {
                if (!requireCustomerLogin()) return;
                navigate("/get-started");
              }}
            >
              Start a request
            </button>
          </div>
        </section>

        <section className="services-list">
          <div className="services-list-heading">
            <div>
              <p className="services-kicker subtle">Available now</p>
              <h2>Hire providers in minutes</h2>
            </div>
            <span className="services-count">
              {loading ? "Loading…" : `${liveCount} service${liveCount === 1 ? "" : "s"}`}
            </span>
          </div>

          {error && <div className="services-error">{error}</div>}

          <div className="services-grid" role="list">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <article key={index} className="service-card skeleton" aria-busy="true">
                    <div className="service-card-top">
                      <div className="skeleton-line short" />
                      <div className="skeleton-line" />
                      <div className="skeleton-line xshort" />
                    </div>
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                  </article>
                ))
              : services.map((service) => {
                  const status = (service.status || "Active").toLowerCase();
                  const statusClass =
                    status === "pending" ? "pending" : status === "approved" || status === "active" ? "good" : "neutral";
                  const basePrice = parsePrice(service.price || service.rate || 0);
                  const { totalPrice } = calculateCommission(basePrice);
                  const priceLabel = basePrice
                    ? `$${totalPrice.toFixed(2)}`
                    : "Price on request";

                  return (
                    <article key={service.id} className="service-card" role="listitem">
                      <div className="service-card-top">
                        <div>
                          <p className="service-pill">{service.category || "General"}</p>
                          <h3>{service.service || "Service"}</h3>
                          <p className="service-provider">
                            {service.provider || service.company || "Verified provider"}
                          </p>
                        </div>
                        <span className={`service-status ${statusClass}`}>
                          {service.status || "Active"}
                        </span>
                      </div>

                      <p className="service-description">
                        {service.description ||
                          service.details ||
                          "This provider is available for new requests. Share your job to get matched."}
                      </p>

                      <div className="service-meta">
                        {service.city || service.location ? (
                          <span>{service.city || service.location}</span>
                        ) : null}
                        {service.experience ? <span>{service.experience} experience</span> : null}
                        <span className="provider-email">{service.providerEmail || service.provider_email || service.email || "Contact via platform"}</span>
                        <span>{priceLabel}</span>
                      </div>

                      <div className="service-actions">
                        <button type="button" onClick={() => handleHire(service)} className="ghost">
                          Hire this provider
                        </button>
                      </div>
                    </article>
                  );
                })}
          </div>

          {!loading && !error && services.length === 0 && (
            <div className="services-empty">
              <p>No services are published yet. Check back soon.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
