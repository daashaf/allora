import React from "react";
import NavigationBar from "../components/NavigationBar";
import "../dashboard.css";

export default function GetStarted() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-circle circle-top" aria-hidden="true" />
      <div className="dashboard-circle circle-bottom" aria-hidden="true" />
      <NavigationBar />
      <section className="placeholder-page">
        <h1>Get Started</h1>
        <p>Tell us about your project. A guided intake flow will live here shortly.</p>
      </section>
    </div>
  );
}
