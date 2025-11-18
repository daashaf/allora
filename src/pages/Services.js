import React from "react";
import NavigationBar from "../components/NavigationBar";
import "../dashboard.css";

export default function Services() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-circle circle-top" aria-hidden="true" />
      <div className="dashboard-circle circle-bottom" aria-hidden="true" />
      <NavigationBar />
      <section className="placeholder-page">
        <h1>Service Directory</h1>
        <p>Browse curated categories, providers, and reviews coming soon.</p>
      </section>
    </div>
  );
}
