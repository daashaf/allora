import React from "react";
import Navbar from "../components/Navbar";
import { ReactComponent as InfinityMark } from "../assets/infinity-logo.svg";
import "./AlloraLanding.css";

const categories = [
  { name: "Home & Cleaning", desc: "Book trusted cleaners for your home." },
  { name: "IT & Tech Support", desc: "Fix devices, networks, and software." },
  { name: "Beauty & Wellness", desc: "Hair, makeup, spa and more." },
  { name: "Education & Tutoring", desc: "Tutors for school, uni, and hobbies." },
  { name: "Repairs & Maintenance", desc: "Plumbers, electricians, handymen." },
  { name: "Events & Photography", desc: "Photographers, decorators, DJs." },
];

const steps = [
  {
    title: "Tell us what you need",
    desc: "Choose a category, location, and share a few details about your request.",
    badge: "Step 01",
  },
  {
    title: "Discover service providers",
    desc: "Compare verified providers, ratings, and pricing in one dashboard.",
    badge: "Step 02",
  },
  {
    title: "Book & stay updated",
    desc: "Track bookings, changes, and messages in your customer dashboard.",
    badge: "Step 03",
  },
  {
    title: "Get support anytime",
    desc: "Our customer support team helps when things don't go to plan.",
    badge: "Step 04",
  },
];

const values = [
  {
    title: "Trusted providers",
    desc: "Profiles, ratings, and booking history help you choose with confidence.",
  },
  {
    title: "One hub, many services",
    desc: "Instead of juggling separate apps, manage everything inside Allora.",
  },
  {
    title: "Human concierge",
    desc: "Customer support and admin dashboards keep the ecosystem aligned.",
  },
];

const stories = [
  {
    role: "Customer",
    name: "Sarah",
    text: "Booked a last-minute clean and handyman before a flat inspection. She confirmed the visit and tracked updates in one place.",
  },
  {
    role: "Service Provider",
    name: "Rahul",
    text: "Runs his IT tickets through Allora so new requests, messages, and bookings never get lost in scattered chats.",
  },
  {
    role: "Small Business",
    name: "Local Studio",
    text: "Manages event bookings, client communication, and payments with admin oversight for reporting.",
  },
];

const team = [
  {
    name: "Tariq Khan",
    role: "Client / Product Owner",
    text: "Defines requirements, reviews sprints, and validates the solution.",
  },
  {
    name: "Daasha",
    role: "Customer Dashboard Developer",
    text: "Owns the main landing dashboard and customer experience.",
  },
  {
    name: "Team Member 1",
    role: "Admin Dashboard",
    text: "Builds tools for managing providers, categories, and system data.",
  },
  {
    name: "Team Member 2",
    role: "Provider Dashboard",
    text: "Implements provider flows, bookings, and availability.",
  },
  {
    name: "Team Member 3",
    role: "Support Dashboard",
    text: "Handles tickets, escalations, and communication.",
  },
];

const providers = [
  {
    name: "SparkleClean Co.",
    category: "Home & Cleaning",
    rating: "4.9",
    price: "$60-$120 / job",
  },
  {
    name: "TechFix IT",
    category: "IT & Tech Support",
    rating: "4.8",
    price: "$80-$150 / visit",
  },
  {
    name: "Glow Studio",
    category: "Beauty & Wellness",
    rating: "4.7",
    price: "$40-$90 / session",
  },
];

const heroStats = [
  { label: "Active categories", value: "40+" },
  { label: "Cities enabled", value: "25" },
  { label: "Avg rating", value: "4.9 / 5" },
];

const serviceTypes = ["One-time", "Weekly", "Monthly", "Project"];

export default function AlloraLanding() {
  return (
    <div className="landing-page">
      <Navbar />
      <main className="landing-shell">
        <section className="landing-hero" aria-labelledby="landingHeroHeading">
          <div className="landing-hero-bg" aria-hidden="true" />
          <div className="landing-hero-mark" aria-hidden="true">
            <InfinityMark />
          </div>

          <div className="landing-hero-grid">
            <div className="landing-hero-copy">
              <p className="hero-eyebrow">Service marketplace · Multi-role web app</p>
              <h1 id="landingHeroHeading">One hub. Infinite services.</h1>
              <p>
                Allora Service Hub connects customers, service providers, admin, and customer support in one place.
                Discover trusted services, compare options, and book with confidence.
              </p>
              <div className="hero-actions">
                <button type="button" className="primary" onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}>
                  Explore services
                </button>
                <button
                  type="button"
                  className="ghost"
                  onClick={() =>
                    document.getElementById("about-user-stories")?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  See customer stories
                </button>
              </div>
              <div className="hero-stats">
                {heroStats.map((stat) => (
                  <article key={stat.label}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </article>
                ))}
              </div>
            </div>

            <div className="landing-hero-panel glass-panel">
              <div className="panel-header">
                <div className="panel-pill">Sample booking preview</div>
                <span className="panel-status">Upcoming</span>
              </div>
              <h3>Home & Cleaning · 2 Bedroom Flat</h3>
              <p className="panel-time">Thursday · 10:00 AM — 1:00 PM · Auckland CBD</p>
              <div className="panel-meta">
                <div>
                  <p>Provider</p>
                  <strong>SparkleClean Co.</strong>
                </div>
                <div>
                  <p>Rating</p>
                  <strong>4.9</strong>
                </div>
                <div>
                  <p>Price</p>
                  <strong>$95 estimated</strong>
                </div>
              </div>
              <p className="panel-desc">
                This is a mock example showing how bookings appear in the customer dashboard once services are confirmed.
              </p>
              <button type="button" className="panel-btn">
                View booking details
              </button>
            </div>
          </div>
        </section>

        <section className="landing-section landing-search glass-panel" aria-label="Find the right service">
          <div className="section-copy">
            <h2>Find the right service in seconds</h2>
            <p>Choose a category, location, and service type to see available providers. Refine details inside the dashboard.</p>
          </div>
          <form className="search-form" onSubmit={(event) => event.preventDefault()}>
            <label>
              <span>Service category</span>
              <select defaultValue={categories[0].name}>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Location</span>
              <input type="text" placeholder="e.g. Auckland CBD" />
            </label>
            <label>
              <span>Service type</span>
              <select defaultValue={serviceTypes[0]}>
                {serviceTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="primary">
              Search providers
            </button>
          </form>
        </section>

        <section id="categories-section" className="landing-section landing-categories">
          <div className="section-copy">
            <h2>Explore services by category</h2>
            <p>Allora feels like an infinite loop of services. Start with a category and refine requests inside the dashboard.</p>
          </div>
          <div className="categories-grid">
            {categories.map((category) => (
              <article key={category.name} className="glass-panel category-card">
                <h3>{category.name}</h3>
                <p>{category.desc}</p>
                <button type="button" onClick={() => window.location.assign("/services")}>
                  View example providers →
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="about-user-stories" className="landing-section landing-storyline">
          <div className="storyline-grid">
            <div className="timeline">
              <p className="section-eyebrow">How Allora works</p>
              <h2>Request, review, and book inside a guided customer dashboard.</h2>
              <div className="timeline-steps">
                {steps.map((step) => (
                  <article key={step.title}>
                    <span>{step.badge}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="customer-stories">
              <p className="section-eyebrow">Customer stories</p>
              <h2>Real people using Allora every week.</h2>
              <div className="story-cards">
                {stories.map((story) => (
                  <article key={story.name} className="glass-panel">
                    <div className="story-role">{story.role}</div>
                    <strong>{story.name}</strong>
                    <p>{story.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-values">
          <div className="section-copy">
            <h2>Why teams trust Allora</h2>
            <p>Transparent workflows and concierge support keep customers, admin, and providers aligned.</p>
          </div>
          <div className="values-grid">
            {values.map((value) => (
              <article key={value.title} className="glass-panel">
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="our-team" className="landing-section landing-team">
          <div className="section-copy">
            <h2>The team behind this studio build</h2>
            <p>Each role manages a different dashboard so the Allora ecosystem feels cohesive.</p>
          </div>
          <div className="team-grid">
            {team.map((member) => (
              <article key={member.name} className="glass-panel">
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p>{member.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-providers">
          <div className="section-copy">
            <h2>Featured service providers (sample data)</h2>
            <p>These cards illustrate how provider information can appear once real data is connected.</p>
          </div>
          <div className="providers-grid">
            {providers.map((provider) => (
              <article key={provider.name} className="glass-panel">
                <h3>{provider.name}</h3>
                <p className="provider-category">{provider.category}</p>
                <p className="provider-meta">
                  Rating {provider.rating} · {provider.price}
                </p>
                <button type="button" className="ghost" onClick={() => window.location.assign("/services")}>
                  View provider profile
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="customer-support-section" className="landing-section landing-support glass-panel">
          <div>
            <p className="section-eyebrow">Need help?</p>
            <h2>Customer support is always one tap away.</h2>
            <p>Our support desk handles questions, issues, and escalations between customers, providers, and admin.</p>
          </div>
          <button type="button" className="primary" onClick={() => window.location.assign("/insights#contact")}>
            Contact customer support
          </button>
        </section>

        <section className="landing-section landing-final glass-panel">
          <div>
            <p className="section-eyebrow">Ready to hire?</p>
            <h2>Login to manage requests, or keep exploring categories.</h2>
            <p>Explore the platform as a guest, then login when you're ready to book services, manage requests, and track every visit.</p>
          </div>
          <div className="final-actions">
            <button type="button" className="primary" onClick={() => window.location.assign("/login")}>
              Login
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => document.getElementById("categories-section")?.scrollIntoView({ behavior: "smooth" })}
            >
              Keep exploring
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="footer-logo">
            <InfinityMark aria-hidden="true" />
            <span>Allora Service Hub</span>
          </div>
          <div className="footer-links">
            <button type="button" onClick={() => document.getElementById("about-user-stories")?.scrollIntoView({ behavior: "smooth" })}>
              About Us
            </button>
            <button type="button" onClick={() => document.getElementById("our-team")?.scrollIntoView({ behavior: "smooth" })}>
              Our Team
            </button>
            <button type="button" onClick={() => document.getElementById("customer-support-section")?.scrollIntoView({ behavior: "smooth" })}>
              Support
            </button>
          </div>
          <div className="footer-copy">© {new Date().getFullYear()} Allora Studio Project</div>
        </div>
      </footer>
    </div>
  );
}
