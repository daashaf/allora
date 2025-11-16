import React from "react";
import NavigationBar from "../components/NavigationBar";
import "../about.css";

const stats = [
  { value: "50K+", label: "Bookings guided" },
  { value: "120+", label: "Service categories" },
  { value: "92%", label: "Repeat customers" },
];

const highlights = [
  {
    title: "Local expertise",
    copy: "City-based curators vet every provider and keep photo-led portfolios up to date.",
  },
  {
    title: "Quiet technology",
    copy: "Automation handles the checklists so conversations stay human and intentional.",
  },
  {
    title: "Concierge support",
    copy: "Specialists are on-call to smooth escalations, align schedules, and celebrate wins.",
  },
];

const timeline = [
  { year: "2019", text: "Allora begins as a simple request board built for friends and neighbours." },
  {
    year: "2021",
    text: "We launch the shared workspace and onboard the first cohort of service partners.",
  },
  {
    year: "2023",
    text: "Customer success and pro tooling merge into one canvas—Allora Service Hub as you see it today.",
  },
  { year: "2025", text: "More than 120 categories live on the platform with 24/7 concierge coverage." },
];

const storyImage =
  "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80";

const heroImage =
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80";

const deskImage =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=870&q=80";

export default function About() {
  return (
    <div className="about-page">
      <div className="about-gradient about-gradient-one" aria-hidden="true" />
      <div className="about-gradient about-gradient-two" aria-hidden="true" />
      <NavigationBar />

      <main className="about-main">
        <section className="about-hero">
          <div className="about-hero-left">
            <p className="about-pill">About Allora</p>
            <h1>We keep everyday services as thoughtful as favourite boutiques.</h1>
            <p className="about-copy">
              Inspired by the neighbourhood merchants we grew up with, Allora curates trusted professionals and wraps
              them in a calm digital experience. Customers browse, book, and follow progress without friction.
            </p>
            <div className="about-stats">
              {stats.map((item) => (
                <article key={item.label}>
                  <span>{item.value}</span>
                  <p>{item.label}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="about-hero-media">
            <img src={heroImage} alt="Allora studio session" loading="lazy" />
            <div className="about-hero-note">
              <p>Morning sync · Studio Bengaluru</p>
              <span>Planning concierge handoffs and local partner launches.</span>
            </div>
          </div>
        </section>

        <section className="about-highlights">
          <div className="about-highlights-header">
            <h2>The Allora pulse</h2>
            <p>
              Three principles shape every screen, phone call, and doorstep interaction. They are simple by design so
              the experience never feels automated or cold.
            </p>
          </div>
          <div className="about-highlights-grid">
            {highlights.map((item) => (
              <article key={item.title} className="about-highlight-card">
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-story">
          <div className="about-story-media">
            <img src={storyImage} alt="Allora concierge team" loading="lazy" />
          </div>
          <div className="about-story-copy">
            <p className="about-pill subtle">Our story</p>
            <h2>A marketplace with a concierge soul.</h2>
            <p>
              We started in apartment lobbies, matching neighbours with reliable service pros. Word spread, our tools
              matured, and the concierge mindset never left. Today Allora supports cities across India, yet every
              booking still feels personal.
            </p>
            <ul>
              <li>Requests stay visual—photos, voice notes, and schedules live together.</li>
              <li>Providers receive playbooks that help them deliver standout experiences.</li>
              <li>Customers always know who to call because our support line is staffed around the clock.</li>
            </ul>
          </div>
        </section>

        <section className="about-timeline">
          <div className="about-timeline-header">
            <p className="about-pill subtle">Milestones</p>
            <h2>From hallway experiments to a national platform.</h2>
          </div>
          <div className="about-timeline-grid">
            {timeline.map((item) => (
              <article key={item.year}>
                <span>{item.year}</span>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-team">
          <div className="about-team-card">
            <div>
              <p className="about-pill subtle">Team snapshot</p>
              <h2>Designers, city leads, concierge hosts, and engineers building for the same north star.</h2>
              <p>
                The Allora Service Hub is crafted in Bengaluru and Auckland with satellite partners in Delhi, Pune, and
                Wellington. We design weekly walk-throughs inside real homes and offices so the product reflects how
                people actually live.
              </p>
            </div>
            <img src={deskImage} alt="Product team desk" loading="lazy" />
          </div>
        </section>

        <section className="about-cta">
          <div className="about-cta-card">
            <div>
              <p className="about-pill subtle">Next step</p>
              <h2>Bring your next project to Allora.</h2>
              <p>Tell us what you need and our concierge will share curated providers in less than an hour.</p>
            </div>
            <div className="about-actions">
              <a className="about-btn primary" href="/get-started">
                Start a Request
              </a>
              <a className="about-btn ghost" href="/insights#contact">
                Talk to Support
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
