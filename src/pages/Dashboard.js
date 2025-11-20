import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import { ReactComponent as InfinityMark } from "../assets/infinity-logo.svg";
import "../dashboard.css";

const FEATURES = [
  {
    title: "Vetted professionals",
    copy: "Insurance, background checks, and performance reviews on every profile.",
  },
  {
    title: "Transparent pricing",
    copy: "Instant quotes with no surprise add-ons or hidden marketplace fees.",
  },
  {
    title: "Concierge support",
    copy: "Schedule changes, access notes, and proof-of-work handled for you.",
  },
];

const SERVICES = [
  {
    title: "Home upkeep",
    copy: "Deep cleans, handyman visits, appliance repair, and garden care in one smooth plan.",
    tags: ["Cleaning", "Repairs", "Garden"],
  },
  {
    title: "Workspace support",
    copy: "IT setup, movers, floor care, and facility teams for remote or HQ offices.",
    tags: ["IT setup", "Office moves", "Facility"],
  },
  {
    title: "Lifestyle & wellness",
    copy: "Tutors, wellness coaches, chefs, chauffeurs, and concierge errands for families.",
    tags: ["Tutors", "Wellness", "Concierge"],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Allora keeps our property portfolio humming. We submit requests once and see photos and invoices automatically.",
    author: "Sonia Patel",
    role: "Community Manager, Horizon Living",
  },
  {
    quote:
      "We run our office ops through Allora—everything from IT setup to weekly cleaners is organized in one dashboard.",
    author: "Marcus Lee",
    role: "Operations Lead, Brightlabs",
  },
];

const LOGOS = ["Northwind", "Brightlabs", "Fika Roasters", "UrbanNest", "Bluefield Ops"];
const HERO_METRICS = [
  { label: "Verified partners", value: "1,200+" },
  { label: "Average rating", value: "4.9 / 5" },
  { label: "Avg match time", value: "45 min" },
];
const SERVICE_BADGES = ["Home", "Workspace", "Lifestyle", "Concierge"];
const VISIT_PROGRESS = 72;

export default function Dashboard() {
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [city, setCity] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    navigate("/services", { state: { search: service || "all services", city: city || "nearby" } });
  };

  return (
    <div className="allora-website">
      <NavigationBar />
      <main className="website-shell">
        <section className="hero" aria-labelledby="dashboardHeroHeading">
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-logo-mark" aria-hidden="true">
            <InfinityMark />
          </div>
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="hero-pill">
                {SERVICE_BADGES.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
              <p className="eyebrow">Allora service hub</p>
              <h1 id="dashboardHeroHeading">Book trusted professionals for every home, workspace, or lifestyle need.</h1>
              <p className="hero-subcopy">
                Allora layers curated pros, concierge scheduling, and proof-of-work in one place. Submit a single brief
                and watch every service unfold live.
              </p>
              <form className="hero-form" onSubmit={handleSearch}>
                <label className="hero-form-field" htmlFor="heroServiceInput">
                  <span>What do you need?</span>
                  <input
                    id="heroServiceInput"
                    type="text"
                    placeholder="Deep clean, IT setup, chef..."
                    value={service}
                    onChange={(event) => setService(event.target.value)}
                  />
                </label>
                <label className="hero-form-field" htmlFor="heroCityInput">
                  <span>Where?</span>
                  <input
                    id="heroCityInput"
                    type="text"
                    placeholder="City or neighborhood"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                  />
                </label>
                <button type="submit" className="hero-submit">
                  Plan my service
                </button>
              </form>
              <div className="hero-meta">
                {HERO_METRICS.map((metric) => (
                  <article key={metric.label}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </article>
                ))}
                <div className="hero-avatars" aria-label="Concierge agents online">
                  <span aria-hidden="true">SP</span>
                  <span aria-hidden="true">ML</span>
                  <span aria-hidden="true">NA</span>
                  <p>Concierge desk live 24/7</p>
                </div>
              </div>
            </div>

            <div className="hero-panels">
              <div className="hero-journey-card glass-card">
                <div className="hero-journey-chip">Next visit</div>
                <div className="hero-journey-title">
                  <h3>Workspace reset</h3>
                  <span>Thu · 09:30 AM</span>
                </div>
                <div className="hero-journey-route">
                  <div>
                    <p>Location</p>
                    <strong>Soho Loft, NYC</strong>
                  </div>
                  <div className="hero-journey-divider" aria-hidden="true" />
                  <div>
                    <p>Specialist</p>
                    <strong>Nova Facilities</strong>
                  </div>
                </div>
                <p className="hero-journey-copy">
                  Equipment calibration, conference reset, and weekly clean—pre-approved with transparent pricing.
                </p>
                <div className="hero-journey-progress">
                  <div>
                    <span>Preparation</span>
                    <span>{VISIT_PROGRESS}%</span>
                  </div>
                  <div className="progress-track">
                    <span className="progress-fill" style={{ width: `${VISIT_PROGRESS}%` }} />
                  </div>
                </div>
                <div className="hero-journey-team">
                  <div className="hero-journey-avatars">
                    <span aria-hidden="true">JL</span>
                    <span aria-hidden="true">BT</span>
                    <span aria-hidden="true">NA</span>
                  </div>
                  <div>
                    <p>Concierge lead</p>
                    <strong>Nova Atkins</strong>
                  </div>
                </div>
                <button type="button" className="hero-card-btn" onClick={() => navigate("/dashboard")}>
                  View live timeline
                </button>
              </div>

              <div className="hero-mini-grid">
                <article className="glass-card">
                  <p>Auto-matched in</p>
                  <strong>45 min</strong>
                  <span>Avg this week</span>
                </article>
                <article className="glass-card">
                  <p>Open requests</p>
                  <strong>08</strong>
                  <span>All on track</span>
                </article>
                <article className="glass-card highlight">
                  <p>Concierge VIP</p>
                  <strong>Included</strong>
                  <span>Service guarantee</span>
                </article>
              </div>
              <div className="hero-floating-pill glass-card">
                <p>“Allora keeps every property humming.”</p>
                <span>Sonia · Horizon Living</span>
              </div>
            </div>
          </div>
        </section>

        <section className="brand-strip" aria-label="Companies using Allora">
          {LOGOS.map((logo) => (
            <span key={logo}>{logo}</span>
          ))}
        </section>

        <section className="feature-section">
          <header>
            <p className="eyebrow">Why choose Allora</p>
            <h2>Built for busy households and operations teams.</h2>
            <p>
              Transparent pricing, concierge scheduling, and proof-of-work are bundled together so customers, service
              providers, and support teams share the same view.
            </p>
          </header>
          <div className="feature-grid">
            {FEATURES.map((feature, index) => (
              <article key={feature.title} className="feature-card">
                <span className="feature-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="service-section">
          <header>
            <p className="eyebrow">What we cover</p>
            <h2>Curated specialists across every service category.</h2>
            <p>Pick a category to view vetted professionals in your city and lock in the visit in minutes.</p>
          </header>
          <div className="service-grid">
            {SERVICES.map((item) => (
              <article key={item.title} className="service-card glass-card">
                <div className="service-card-header">
                  <h3>{item.title}</h3>
                  <button
                    type="button"
                    onClick={() => navigate("/services", { state: { search: item.title } })}
                  >
                    View specialists
                  </button>
                </div>
                <p>{item.copy}</p>
                <div className="tag-row">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="testimonial-section">
          <header>
            <p className="eyebrow">Testimonials</p>
            <h2>Customers trust Allora for consistent, premium service.</h2>
          </header>
          <div className="testimonial-grid">
            {TESTIMONIALS.map((testimonial) => (
              <article key={testimonial.author} className="testimonial-card glass-card">
                <span className="quote-mark">“</span>
                <p>{testimonial.quote}</p>
                <strong>{testimonial.author}</strong>
                <span>{testimonial.role}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section glass-card">
          <div>
            <p className="eyebrow">Ready to go?</p>
            <h2>Share your next request and we&apos;ll line up the visit.</h2>
            <p>
              Tell us what you need, when, and where. The Allora concierge desk handles scheduling, updates, and
              proof-of-work.
            </p>
          </div>
          <div className="cta-actions">
            <button type="button" onClick={() => navigate("/services")}>
              Create a request
            </button>
            <button type="button" className="ghost" onClick={() => navigate("/get-started")}>
              Talk to concierge
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
