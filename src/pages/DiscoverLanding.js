import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import "../dashboard.css";

const demoServices = [
  {
    title: "House Cleaning",
    description: "Trusted cleaners rated by local customers.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    category: "Home Services",
  },
  {
    title: "Web Design Sprint",
    description: "Launch-ready web experiences crafted in a week.",
    image:
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=800&q=80",
    category: "Digital Services",
  },
  {
    title: "Personal Trainers",
    description: "Find specialists to keep your goals on track.",
    image:
      "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=800&q=80",
    category: "Health & Wellness",
  },
  {
    title: "Garden Care",
    description: "Skilled gardeners for tidy, healthy outdoor spaces.",
    image:
      "https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=800&q=80",
    category: "Outdoor Services",
  },
  {
    title: "Event Photography",
    description: "Capture celebrations with cinematic storytelling.",
    image:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d4?auto=format&fit=crop&w=800&q=80",
    category: "Events & Entertainment",
  },
  {
    title: "Mobile Car Grooming",
    description: "Detailing pros that come direct to your driveway.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    category: "Automotive",
  },
];

const popularSearches = ["House Cleaning", "Web Design", "Personal Trainers"];

const SERVICE_TYPES = [
  "Plumbers",
  "Renovations",
  "Electricians",
  "Builders",
  "Website",
  "Mobile App",
  "Painters",
  "Pest Control",
  "Concreting",
  "Glazing",
  "Appliance Repair",
  "Dog Walker",
];

const featureCards = [
  {
    title: "City curators",
    copy: "Local Allora hosts meet every professional and capture their latest work.",
  },
  {
    title: "Calm tracking",
    copy: "Status cards, nudges, and receipts live in one shared timeline that feels human.",
  },
  {
    title: "Support that stays",
    copy: "Concierge teams monitor each booking and jump in before issues become escalations.",
  },
];

const journeySteps = [
  {
    title: "Tell us the task",
    copy: "Share a few details or upload a quick photo. We keep intake light but useful.",
  },
  {
    title: "Review curated matches",
    copy: "Within an hour you'll receive tailored pros with transparent pricing and availability.",
  },
  {
    title: "Book and relax",
    copy: "Track milestones, message securely, and rely on Allora support if anything drifts.",
  },
];

export default function DiscoverLanding() {
  const [activeSection, setActiveSection] = useState("discover");
  const [selectedService, setSelectedService] = useState(SERVICE_TYPES[0]);
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Small debug helper: log elements that create vertical scrollbars
    const t = setTimeout(() => {
      try {
        [...document.querySelectorAll("*")].forEach((el) => {
          const s = getComputedStyle(el);
          if ((s.overflowY === "auto" || s.overflowY === "scroll") && el.scrollHeight > el.clientHeight) {
            console.log("SCROLLABLE:", el, el.className || el.id || el.tagName);
          }
        });
      } catch (e) {
        console.warn("scroll debug failed", e);
      }
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    const target = document.getElementById(section);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleServiceTypeSelect = (serviceType) => {
    navigate("/services", { state: { prefill: serviceType } });
  };

  const handleHeroSubmit = (event) => {
    event.preventDefault();
    handleServiceTypeSelect(selectedService);
  };

  return (
    <div className="customer-page">
      <div className="dashboard-page clean-dashboard">
        <div className="dashboard-circle circle-top" aria-hidden="true" />
        <div className="dashboard-circle circle-bottom" aria-hidden="true" />

        <NavigationBar activeSection={activeSection} onSectionSelect={handleSectionChange} />

        <main className="clean-main">
          <section className="clean-hero" id="discover">
            <div className="clean-hero-left">
              <p className="clean-label">Curated & local</p>
              <h1>Find trusted professionals without scrolling through noise.</h1>
              <p>
                Allora pairs neighbourhood expertise with modern tooling so you can browse, book, and track services from
                one calm dashboard.
              </p>
              <div className="clean-popular">
                <span>Popular now</span>
                <div className="clean-popular-tags">
                  {popularSearches.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
            <form className="clean-hero-form" onSubmit={handleHeroSubmit}>
              <div className="clean-form-field">
                <label htmlFor="hero-service">Service</label>
                <select
                  id="hero-service"
                  value={selectedService}
                  onChange={(event) => setSelectedService(event.target.value)}
                >
                  {SERVICE_TYPES.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
              <div className="clean-form-field">
                <label htmlFor="hero-city">City</label>
                <input
                  id="hero-city"
                  type="text"
                  placeholder="e.g., Bengaluru"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                />
              </div>
              <div className="clean-form-field">
                <label htmlFor="hero-notes">Notes (optional)</label>
                <textarea id="hero-notes" placeholder="Share timing, style, or budget cues." rows={3} />
              </div>
              <button type="submit" className="nav-cta">See curated providers</button>
            </form>
          </section>

          <section className="clean-highlights">
            <div className="clean-section-heading">
              <h2>The Allora promise</h2>
              <p>We keep the experience warm, transparent, and reliably on time.</p>
            </div>
            <div className="clean-highlights-grid">
              {featureCards.map((card) => (
                <article key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="clean-services" aria-label="Featured services">
            <div className="clean-section-heading">
              <h2>Fresh from the concierge desk</h2>
              <p>Scene-setting packages curated with photos, pricing, and availability.</p>
            </div>
            <div className="clean-services-grid">
              {demoServices.map((service) => (
                <article key={service.title} className="clean-service-card">
                  <img src={service.image} alt={service.title} loading="lazy" />
                  <div className="clean-service-body">
                    <span>{service.category}</span>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <button type="button" onClick={() => handleServiceTypeSelect(service.title)}>
                      Book now
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="clean-steps">
            <div className="clean-section-heading">
              <h2>How it works</h2>
              <p>Three friendly steps from idea to completed service.</p>
            </div>
            <div className="clean-steps-grid">
              {journeySteps.map((step, index) => (
                <article key={step.title}>
                  <span>{`0${index + 1}`}</span>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="clean-cta" aria-label="Get started">
            <div className="clean-cta-card">
              <div>
                <p className="clean-label">Ready in minutes</p>
                <h2>Create your request and let Allora handle the follow-up.</h2>
                <p>
                  From quotes to check-ins, everything lives inside one workspace. Customers stay informed and providers
                  stay focused on the craft.
                </p>
              </div>
              <div className="clean-actions">
                <button type="button" className="nav-cta" onClick={() => navigate("/get-started")}>
                  Start a request
                </button>
                <button type="button" className="ghost" onClick={() => navigate("/support")}>
                  Talk to support
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
