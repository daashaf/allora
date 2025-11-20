import React from "react";
import { ReactComponent as InfinityMark } from "../assets/infinity-logo.svg";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="allora-navbar">
      <div className="allora-nav-left">
        <a href="/" className="allora-logo-wrap" aria-label="Allora Service Hub">
          <span className="allora-logo">
            <InfinityMark />
          </span>
          <span className="allora-wordmark">Allora Service Hub</span>
        </a>
      </div>

      <div className="allora-nav-center">
        <div className="allora-search">
          <span className="allora-search-icon" aria-hidden="true">
            ⌕
          </span>
          <input type="text" placeholder="Search services, providers, or categories..." />
        </div>
      </div>

      <div className="allora-nav-right">
        <button
          className="allora-link-btn"
          type="button"
          onClick={() => document.getElementById("about-user-stories")?.scrollIntoView({ behavior: "smooth" })}
        >
          About Us + User Stories
        </button>
        <button
          className="allora-link-btn"
          type="button"
          onClick={() => document.getElementById("our-team")?.scrollIntoView({ behavior: "smooth" })}
        >
          Our Team
        </button>
        <button
          className="allora-outline-btn"
          type="button"
          onClick={() => document.getElementById("customer-support-section")?.scrollIntoView({ behavior: "smooth" })}
        >
          Customer Support
        </button>
        <button className="allora-primary-btn" type="button" onClick={() => (window.location.href = "/login")}>
          Login
        </button>
      </div>
    </header>
  );
}
