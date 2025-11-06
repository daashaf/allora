import React from "react";
import { ReactComponent as InfinityLogo } from "../assets/infinity-logo.svg";
import "../dashboard.css";

const recentServices = [
  {
    title: "House Cleaning",
    description: "Trusted cleaners rated by local customers.",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80",
    online: true,
    added: "5 mins ago",
  },
  {
    title: "Web Design Sprint",
    description: "Launch-ready web experiences crafted in a week.",
    image:
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=800&q=80",
    online: true,
    added: "12 mins ago",
  },
  {
    title: "Personal Trainers",
    description: "Find specialists to keep your goals on track.",
    image:
      "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=800&q=80",
    online: true,
    added: "18 mins ago",
  },
  {
    title: "Garden Care",
    description: "Skilled gardeners for tidy, healthy outdoor spaces.",
    image:
      "https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=800&q=80",
    online: false,
    added: "24 mins ago",
  },
  {
    title: "Event Photography",
    description: "Capture celebrations with cinematic storytelling.",
    image:
      "https://images.unsplash.com/photo-1518895949257-7621c3c786d4?auto=format&fit=crop&w=800&q=80",
    online: false,
    added: "32 mins ago",
  },
  {
    title: "Mobile Car Grooming",
    description: "Detailing pros that come direct to your driveway.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    online: true,
    added: "41 mins ago",
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-circle circle-top" aria-hidden="true" />
      <div className="dashboard-circle circle-bottom" aria-hidden="true" />

      <header className="dashboard-nav">
        <div className="nav-brand">
          <div className="nav-logo" aria-hidden="true">
            <InfinityLogo />
          </div>
          <div className="nav-brand-title">
            <span>ALLORA</span>
            <span>Service Hub</span>
          </div>
        </div>

        <nav className="nav-links" aria-label="Primary">
          <a href="#services" className="active">
            Discover
          </a>
          <a href="#categories">Categories</a>
          <a href="#insights">Insights</a>
        </nav>

        <div className="nav-actions">
          <button className="nav-login" type="button">
            Login
          </button>
          <button className="nav-cta" type="button">
            Join as Professional
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section" id="services">
          <div className="hero-copy">
            <h1 className="hero-title">
              Find the right professionals anywhere in New Zealand
            </h1>
            <form className="hero-search-card" aria-label="Service search">
              <div className="hero-search-field">
                <label htmlFor="service-search">Service</label>
                <input
                  id="service-search"
                  type="text"
                  placeholder="What service are you looking for?"
                  aria-label="Service search"
                />
              </div>
              <span className="hero-search-divider" aria-hidden="true" />
              <div className="hero-search-field">
                <label htmlFor="service-location">Location</label>
                <input
                  id="service-location"
                  type="text"
                  placeholder="Enter suburb or postcode"
                  aria-label="Location search"
                />
              </div>
              <button className="hero-search-submit" type="submit">
                Search
              </button>
            </form>

          </div>
        </section>

        <section className="showcase-grid" id="categories" aria-labelledby="showcase-title">
          <div className="showcase-header">
            <div>
              <p className="showcase-eyebrow">Fresh on Allora</p>
              <h2 className="showcase-title" id="showcase-title">
                Newly added services trending right now
              </h2>
            </div>
            <button className="nav-cta" type="button">
              View all categories
            </button>
          </div>

          <div className="showcase-track" role="list">
            {recentServices.map((service) => (
              <article className="showcase-card" key={service.title} role="listitem">
                <img src={service.image} alt={service.title} loading="lazy" />
                {service.online && <span className="tag-online">Available online</span>}
                <span className="tag-time">{service.added}</span>
                <div className="showcase-info">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="showcase-indicator" aria-hidden="true">
            Live feed updates every hour
          </div>
        </section>
      </main>
    </div>
  );
}
