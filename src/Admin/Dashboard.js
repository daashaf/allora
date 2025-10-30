import React, { useState } from "react";
import "./dashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  // ✅ Sidebar logic
  const [activeSection, setActiveSection] = useState("Dashboard");

  const responsibilities = {
    "User Management": [
      "View, edit, suspend, or delete users.",
      "Approve/reject new event managers.",
    ],
    "Service Management": [
      "Manage all services and listings.",
      "Approve or remove service providers.",
    ],
    "System Management": [
      "Manage categories and app configurations.",
      "Monitor system performance.",
    ],
    "Issue Resolution": [
      "Review and resolve customer issues.",
      "Take final decision on unresolved cases.",
    ],
    "Notification Center": [
      "Send emails and in-app announcements.",
      "Publish admin alerts to staff and users.",
    ],
    "Security management": [
      "Manage admin roles and access permissions.",
      "Review audit logs for suspicious activity.",
    ],
  };

  // ✅ Chart data
  const data = [
    { name: "Jan", BestImpression: 10, Stability: 20 },
    { name: "Feb", BestImpression: 25, Stability: 22 },
    { name: "Mar", BestImpression: 30, Stability: 28 },
    { name: "Apr", BestImpression: 45, Stability: 40 },
    { name: "May", BestImpression: 50, Stability: 55 },
  ];

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">
          Allora
          <br />
          Service Hub
        </h2>

        <nav className="nav">
          {Object.keys(responsibilities).map((key) => (
            <button
              key={key}
              className={`nav-btn ${
                activeSection === key ? "active" : ""
              }`}
              onClick={() => setActiveSection(key)}
            >
              {key}
            </button>
          ))}

          {/* ✅ Logout Button added */}
          <button
            className="logout-btn"
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                window.location.href = "/";
              }
            }}
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="profile">
            <h3 className="admin-name">Kiran – Administrator</h3>
          </div>
          <input
            type="text"
            className="search"
            placeholder="Search here..."
          />
        </header>

        {/* Dashboard view */}
        {activeSection === "Dashboard" ? (
          <section className="dashboard">
            <h1 className="title">Dashboard</h1>

            {/* Chart */}
            <div className="chart-box">
              <h3>Overview users</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="BestImpression"
                    stroke="#9b59b6"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="Stability"
                    stroke="#f39c12"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Cards Section */}
            <div className="cards">
              <div className="card commission">
                <h4>Commission</h4>
                <h2>27,500</h2>
                <p>Up to 10% from last week</p>
              </div>

              <div className="card latest">
                <h4>Latest Activity</h4>
                <div className="activity">
                  <p>Conversation response – 2 hrs ago</p>
                  <p>Dashboard setup – 5 hrs ago</p>
                  <p>Review update – 8 hrs ago</p>
                </div>
              </div>

              <div className="card messages">
                <h4>Messages</h4>
                <p>Francisco Avalos replied to your request.</p>
                <button>Reply Messages</button>
              </div>
            </div>
          </section>
        ) : (
          /* Responsibilities Section */
          <section className="responsibility-section">
            <h2>{activeSection}</h2>
            <ul>
              {responsibilities[activeSection].map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
