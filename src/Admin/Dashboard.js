import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [userMgmtTab, setUserMgmtTab] = useState("Customer");
  const [sidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const responsibilities = {
    "User Management": [
      "View, edit, suspend, or delete users.",
      "Approve/reject new event managers.",
    ],
    "Service Management": [
      "Manage all services and listings.",
      "Approve or remove service providers.",
    ],
    "Service Categories": [
      "Create, edit, and organize service categories.",
      "Assign categories to services and control visibility.",
    ],
    "System Management": [
      "Manage categories, the services we provide to the customers.",
      "Configure site settings.",
      "Display the categories, overall categories.",
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

  const data = [
    { name: "Jan", BestImpression: 10, Stability: 20 },
    { name: "Feb", BestImpression: 25, Stability: 22 },
    { name: "Mar", BestImpression: 30, Stability: 28 },
    { name: "Apr", BestImpression: 45, Stability: 40 },
    { name: "May", BestImpression: 50, Stability: 55 },
  ];

  // Inline mock data for User Management tables
  const allUsers = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Customer", status: "Active", joinedAt: "2024-01-05" },
    { id: 2, name: "Bob Smith", email: "bob.smith@example.com", role: "Customer Support", status: "Active", joinedAt: "2024-02-17" },
    { id: 3, name: "Carlos Diaz", email: "carlos@example.com", role: "Service Provider", status: "Pending", joinedAt: "2024-03-02" },
    { id: 4, name: "Diana Lee", email: "diana@example.com", role: "Customer", status: "Suspended", joinedAt: "2023-12-22" },
    { id: 5, name: "Emily Chen", email: "emily@example.com", role: "Service Provider", status: "Active", joinedAt: "2024-04-11" },
  ];

  const visibleRows = useMemo(() => allUsers.filter((u) => u.role === userMgmtTab), [allUsers, userMgmtTab]);

  // Service Management state + mock data
  const initialServices = [
    { id: 201, service: "Wedding Photography", provider: "Emily Chen", category: "Photography", status: "Active", submittedAt: "2024-11-02" },
    { id: 202, service: "Catering Deluxe", provider: "Carlos Diaz", category: "Catering", status: "Active", submittedAt: "2024-12-10" },
    { id: 203, service: "Venue Decor", provider: "Diana Lee", category: "Decoration", status: "Suspended", submittedAt: "2024-10-22" },
  ];
  const initialListings = [
    { id: 301, service: "DJ Night", provider: "Bob Smith", category: "Entertainment", submittedAt: "2025-01-06", status: "Pending" },
    { id: 302, service: "Live Flowers", provider: "Alice Johnson", category: "Decoration", submittedAt: "2025-01-05", status: "Pending" },
  ];
  const [serviceView, setServiceView] = useState("Manage Services");
  const [services, setServices] = useState(initialServices);
  const [listings, setListings] = useState(initialListings);

  const toggleServiceStatus = (id) =>
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, status: s.status === "Suspended" ? "Active" : "Suspended" } : s)));
  const deleteService = (id) => setServices((prev) => prev.filter((s) => s.id !== id));
  const approveListing = (id) => setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Approved" } : l)));
  const rejectListing = (id) => setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Rejected" } : l)));

  // System Management: categories
  const initialCategories = [
    { id: 401, name: "Photography", servicesCount: 12, visible: true },
    { id: 402, name: "Catering", servicesCount: 8, visible: true },
    { id: 403, name: "Decoration", servicesCount: 5, visible: false },
  ];
  const [systemView, setSystemView] = useState("Manage Categories");
  const [categories, setCategories] = useState(initialCategories);
  const addCategory = () => {
    const name = window.prompt("New category name?");
    if (!name) return;
    setCategories((prev) => [
      ...prev,
      { id: Date.now(), name, servicesCount: 0, visible: true },
    ]);
  };
  const toggleCategoryVisibility = (id) =>
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c)));
  const deleteCategory = (id) => setCategories((prev) => prev.filter((c) => c.id !== id));

  // Service Categories: sample services view
  const initialCategoryServices = [
    { id: 501, service: "Bridal Makeup", category: "Beauty", provider: "Glam Studio", status: "Active" },
    { id: 502, service: "Event Catering", category: "Catering", provider: "Taste Buds", status: "Active" },
    { id: 503, service: "Live Band", category: "Entertainment", provider: "SoundWave", status: "Pending" },
    { id: 504, service: "Hall Decoration", category: "Decoration", provider: "DecoCraft", status: "Suspended" },
    { id: 505, service: "Portrait Photography", category: "Photography", provider: "LensWorks", status: "Active" },
  ];
  const [categoryServices, setCategoryServices] = useState(initialCategoryServices);
  const addCategoryService = () => {
    const name = window.prompt("Service name?");
    if (!name) return;
    const category = window.prompt("Category?");
    const provider = window.prompt("Provider?");
    setCategoryServices((prev) => [
      ...prev,
      { id: Date.now(), service: name, category: category || "General", provider: provider || "Unknown", status: "Active" },
    ]);
  };
  const toggleCategoryService = (id) =>
    setCategoryServices((prev) => prev.map((s) => (s.id === id ? { ...s, status: s.status === "Suspended" ? "Active" : "Suspended" } : s)));
  const deleteCategoryService = (id) => setCategoryServices((prev) => prev.filter((s) => s.id !== id));

  // Issue Resolution: queue + actions
  const initialIssues = [
    { id: 701, subject: "Payment not processed", customer: "Alice Johnson", priority: "High", status: "Open", createdAt: "2025-01-05" },
    { id: 702, subject: "App login issue", customer: "Bob Smith", priority: "Medium", status: "Open", createdAt: "2025-01-04" },
    { id: 703, subject: "Service listing correction", customer: "Carlos Diaz", priority: "Low", status: "Resolved", createdAt: "2024-12-29" },
  ];
  const [issueFilter, setIssueFilter] = useState("Open");
  const [issues, setIssues] = useState(initialIssues);
  const filteredIssues = useMemo(
    () => issues.filter((i) => (issueFilter === "All" ? true : i.status === issueFilter)),
    [issues, issueFilter]
  );
  const resolveIssue = (id) => setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Resolved" } : i)));
  const closeIssue = (id) => setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Closed" } : i)));
  const reopenIssue = (id) => setIssues((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Open" } : i)));

  // Security management: roles and permissions
  const defaultPerms = [
    "view_users",
    "manage_services",
    "manage_categories",
    "send_notifications",
    "view_audit",
  ];
  const [roles, setRoles] = useState([
    { id: 8001, name: "Owner", members: 1, perms: new Set(defaultPerms) },
    { id: 8002, name: "Administrator", members: 2, perms: new Set(["view_users","manage_services","manage_categories","send_notifications"]) },
    { id: 8003, name: "Support", members: 3, perms: new Set(["view_users","send_notifications"]) },
  ]);
  const addRole = () => {
    const name = window.prompt("New role name?");
    if (!name) return;
    setRoles((prev) => [...prev, { id: Date.now(), name, members: 0, perms: new Set(["view_users"]) }]);
  };
  const deleteRole = (id) => setRoles((prev) => prev.filter((r) => r.id !== id));
  const toggleRolePerm = (id, key) =>
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const next = new Set(r.perms);
        next.has(key) ? next.delete(key) : next.add(key);
        return { ...r, perms: next };
      })
    );

  // Notification Center: compose + history
  const [notificationView, setNotificationView] = useState("Compose");
  const [compose, setCompose] = useState({
    audience: "All Customers",
    channel: "Email",
    subject: "",
    message: "",
  });
  const [notifications, setNotifications] = useState([
    { id: 9001, subject: "Welcome to Allora", audience: "All Users", channel: "In-App", sentAt: "2024-12-20 10:00", status: "Sent" },
  ]);
  const sendNotification = () => {
    if (!compose.subject.trim() || !compose.message.trim()) {
      alert("Please enter subject and message");
      return;
    }
    const sentAt = new Date().toISOString().slice(0, 16).replace("T", " ");
    setNotifications((prev) => [
      { id: Date.now(), subject: compose.subject, audience: compose.audience, channel: compose.channel, sentAt, status: "Sent" },
      ...prev,
    ]);
    setCompose({ ...compose, subject: "", message: "" });
    alert("Notification sent");
  };

  // System Management: site settings (simple local persistence)
  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem("siteSettings");
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        siteName: parsed.siteName || "Allora Service Hub",
        maintenance: parsed.maintenance || false,
        defaultRole: parsed.defaultRole || "Customer",
        emailNotifications: parsed.emailNotifications ?? true,
        itemsPerPage: parsed.itemsPerPage || 10,
      };
    } catch (_) {
      return {
        siteName: "Allora Service Hub",
        maintenance: false,
        defaultRole: "Customer",
        emailNotifications: true,
        itemsPerPage: 10,
      };
    }
  });

  const saveSettings = () => {
    localStorage.setItem("siteSettings", JSON.stringify(settings));
    alert("Settings saved");
  };

  const resetSettings = () => {
    setSettings({
      siteName: "Allora Service Hub",
      maintenance: false,
      defaultRole: "Customer",
      emailNotifications: true,
      itemsPerPage: 10,
    });
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <h2 className="logo">
          Allora
          <br />
          Service Hub
        </h2>

        <nav className="nav">
          {Object.keys(responsibilities).map((key) => (
            <button
              key={key}
              className={`nav-btn ${activeSection === key ? "active" : ""}`}
              onClick={() => setActiveSection(key)}
            >
              {key}
            </button>
          ))}

          {/* Sidebar logout moved to the top navbar */}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Navbar */}
        <header className="topbar">
          <h3 className="navbar-title">Admin Dashboard</h3>
          <div className="topbar-actions">
            <div className="menu-wrapper" ref={menuRef}>
              <button
                className="icon-btn menu-toggle"
                aria-label="Open menu"
                title="Open menu"
                onClick={() => setMenuOpen((v) => !v)}
              >
                <span className="hamburger" />
              </button>
              {menuOpen && (
                <div className="top-menu">
                  <div className="menu-title">Menu</div>
                  {Object.keys(responsibilities).map((key) => (
                    <button
                      key={key}
                      className={`menu-item ${activeSection === key ? "active" : ""}`}
                      onClick={() => {
                        setActiveSection(key);
                        setMenuOpen(false);
                      }}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="logout-top"
              onClick={() => {
                if (window.confirm("You will remain on the dashboard. Continue?")) {
                  window.location.href = "/admin/dashboard";
                }
              }}
            >
              Logout
            </button>
          </div>
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
                  <Line type="monotone" dataKey="BestImpression" stroke="#0d6efd" strokeWidth={2} />
                  <Line type="monotone" dataKey="Stability" stroke="#06b6d4" strokeWidth={2} />
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
                  <p>Conversation response - 2 hrs ago</p>
                  <p>Dashboard setup - 5 hrs ago</p>
                  <p>Review update - 8 hrs ago</p>
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

            {activeSection === "System Management" && (
              <div className="actions-bar top-right">
                <button
                  className={`action-btn ${systemView === "Manage Categories" ? "primary" : ""}`}
                  onClick={() => setSystemView("Manage Categories")}
                >
                  Manage Categories
                </button>
                <button
                  className={`action-btn ${systemView === "Site Settings" ? "primary" : ""}`}
                  onClick={() => setSystemView("Site Settings")}
                >
                  Site Settings
                </button>
                <button
                  className={`action-btn ${systemView === "View Categories" ? "primary" : ""}`}
                  onClick={() => setSystemView("View Categories")}
                >
                  View Categories
                </button>
              </div>
            )}

            {activeSection === "Service Management" && (
              <div className="actions-bar top-right">
                <button
                  className="action-btn primary"
                  onClick={() => setServiceView("Manage Services")}
                >
                  Manage Services
                </button>
                <button
                  className="action-btn"
                  onClick={() => setServiceView("Review Listings")}
                >
                  Review Listings
                </button>
              </div>
            )}

            {/* Service Management info panel removed per request */}

            {activeSection === "Service Management" && (
              <div className="table-wrapper" style={{ marginTop: 12 }}>
                {serviceView === "Manage Services" ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Provider</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", padding: 16 }}>No services.</td>
                        </tr>
                      ) : (
                        services.map((s) => (
                          <tr key={s.id}>
                            <td>{s.service}</td>
                            <td>{s.provider}</td>
                            <td>{s.category}</td>
                            <td><span className={`badge ${s.status.toLowerCase()}`}>{s.status}</span></td>
                            <td>{s.submittedAt}</td>
                            <td className="table-actions">
                              <button className="action-btn" onClick={() => toggleServiceStatus(s.id)}>
                                {s.status === "Suspended" ? "Activate" : "Suspend"}
                              </button>
                              <button className="action-btn danger" onClick={() => deleteService(s.id)}>Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Provider</th>
                        <th>Category</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listings.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", padding: 16 }}>No listings to review.</td>
                        </tr>
                      ) : (
                        listings.map((l) => (
                          <tr key={l.id}>
                            <td>{l.service}</td>
                            <td>{l.provider}</td>
                            <td>{l.category}</td>
                            <td>{l.submittedAt}</td>
                            <td><span className={`badge ${l.status.toLowerCase()}`}>{l.status}</span></td>
                            <td className="table-actions">
                              {l.status === "Pending" ? (
                                <>
                                  <button className="action-btn primary" onClick={() => approveListing(l.id)}>Approve</button>
                                  <button className="action-btn danger" onClick={() => rejectListing(l.id)}>Reject</button>
                                </>
                              ) : (
                                <span style={{ color: "#555" }}>No actions</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeSection === "Service Categories" && (
              <>
                <div className="actions-bar top-right">
                  <button className="action-btn primary" onClick={addCategoryService}>Add Service</button>
                </div>
                <div className="table-wrapper" style={{ marginTop: 12 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Category</th>
                        <th>Provider</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryServices.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", padding: 16 }}>No services in categories.</td>
                        </tr>
                      ) : (
                        categoryServices.map((s) => (
                          <tr key={s.id}>
                            <td>{s.service}</td>
                            <td>{s.category}</td>
                            <td>{s.provider}</td>
                            <td><span className={`badge ${s.status.toLowerCase()}`}>{s.status}</span></td>
                            <td className="table-actions">
                              <button className="action-btn" onClick={() => toggleCategoryService(s.id)}>
                                {s.status === "Suspended" ? "Activate" : "Suspend"}
                              </button>
                              <button className="action-btn danger" onClick={() => deleteCategoryService(s.id)}>Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeSection === "Security management" && (
              <>
                <div className="actions-bar top-right">
                  <button className="action-btn primary" onClick={addRole}>Add Role</button>
                </div>
                <div className="table-wrapper" style={{ marginTop: 12 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Members</th>
                        <th>Permissions</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center", padding: 16 }}>No roles.</td>
                        </tr>
                      ) : (
                        roles.map((r) => (
                          <tr key={r.id}>
                            <td>{r.name}</td>
                            <td>{r.members}</td>
                            <td>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {defaultPerms.map((p) => (
                                  <button
                                    key={p}
                                    className={`perm-chip ${r.perms.has(p) ? "active" : ""}`}
                                    title={p.replace(/_/g, " ")}
                                    onClick={() => toggleRolePerm(r.id, p)}
                                  >
                                    {p.replace(/_/g, " ")}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="table-actions">
                              <button className="action-btn danger" onClick={() => deleteRole(r.id)}>Delete</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeSection === "Notification Center" && (
              <>
                <div className="actions-bar top-right">
                  <button
                    className={`action-btn ${notificationView === "Compose" ? "primary" : ""}`}
                    onClick={() => setNotificationView("Compose")}
                  >
                    Compose
                  </button>
                  <button
                    className={`action-btn ${notificationView === "History" ? "primary" : ""}`}
                    onClick={() => setNotificationView("History")}
                  >
                    History
                  </button>
                </div>

                {notificationView === "Compose" ? (
                  <div className="table-wrapper" style={{ marginTop: 12, padding: 16 }}>
                    <div className="settings-grid">
                      <div className="form-group">
                        <label>Audience</label>
                        <select
                          className="select"
                          value={compose.audience}
                          onChange={(e) => setCompose((c) => ({ ...c, audience: e.target.value }))}
                        >
                          <option>All Customers</option>
                          <option>Service Providers</option>
                          <option>All Users</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Channel</label>
                        <select
                          className="select"
                          value={compose.channel}
                          onChange={(e) => setCompose((c) => ({ ...c, channel: e.target.value }))}
                        >
                          <option>Email</option>
                          <option>In-App</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ gridColumn: "1/-1" }}>
                        <label>Subject</label>
                        <input
                          className="search"
                          type="text"
                          placeholder="Announcement subject"
                          value={compose.subject}
                          onChange={(e) => setCompose((c) => ({ ...c, subject: e.target.value }))}
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: "1/-1" }}>
                        <label>Message</label>
                        <textarea
                          className="search"
                          style={{ minHeight: 120, resize: "vertical" }}
                          placeholder="Write your message..."
                          value={compose.message}
                          onChange={(e) => setCompose((c) => ({ ...c, message: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="header-actions" style={{ marginTop: 12 }}>
                      <button className="action-btn" onClick={() => setCompose({ ...compose, subject: "", message: "" })}>Clear</button>
                      <button className="action-btn primary" onClick={sendNotification}>Send</button>
                    </div>
                  </div>
                ) : (
                  <div className="table-wrapper" style={{ marginTop: 12 }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Audience</th>
                          <th>Channel</th>
                          <th>Sent</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {notifications.length === 0 ? (
                          <tr>
                            <td colSpan="5" style={{ textAlign: "center", padding: 16 }}>No notifications sent.</td>
                          </tr>
                        ) : (
                          notifications.map((n) => (
                            <tr key={n.id}>
                              <td>{n.subject}</td>
                              <td>{n.audience}</td>
                              <td><span className={`badge ${n.channel === "Email" ? "email" : "inapp"}`}>{n.channel}</span></td>
                              <td>{n.sentAt}</td>
                              <td><span className="badge resolved">{n.status}</span></td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeSection === "Issue Resolution" && (
              <>
                <div className="actions-bar top-right">
                  <button
                    className={`action-btn ${issueFilter === "Open" ? "primary" : ""}`}
                    onClick={() => setIssueFilter("Open")}
                  >
                    Open
                  </button>
                  <button
                    className={`action-btn ${issueFilter === "Resolved" ? "primary" : ""}`}
                    onClick={() => setIssueFilter("Resolved")}
                  >
                    Resolved
                  </button>
                  <button
                    className={`action-btn ${issueFilter === "All" ? "primary" : ""}`}
                    onClick={() => setIssueFilter("All")}
                  >
                    All
                  </button>
                </div>
                <div className="table-wrapper" style={{ marginTop: 12 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Customer</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssues.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: "center", padding: 16 }}>No issues.</td>
                        </tr>
                      ) : (
                        filteredIssues.map((iss) => (
                          <tr key={iss.id}>
                            <td>{iss.subject}</td>
                            <td>{iss.customer}</td>
                            <td><span className={`badge ${iss.priority.toLowerCase()}`}>{iss.priority}</span></td>
                            <td><span className={`badge ${iss.status.toLowerCase()}`}>{iss.status}</span></td>
                            <td>{iss.createdAt}</td>
                            <td className="table-actions">
                              {iss.status === "Open" && (
                                <>
                                  <button className="action-btn primary" onClick={() => resolveIssue(iss.id)}>Resolve</button>
                                  <button className="action-btn danger" onClick={() => closeIssue(iss.id)}>Close</button>
                                </>
                              )}
                              {iss.status === "Resolved" && (
                                <>
                                  <button className="action-btn" onClick={() => reopenIssue(iss.id)}>Reopen</button>
                                  <button className="action-btn danger" onClick={() => closeIssue(iss.id)}>Close</button>
                                </>
                              )}
                              {iss.status === "Closed" && (
                                <button className="action-btn" onClick={() => reopenIssue(iss.id)}>Reopen</button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeSection === "System Management" && (
              <>
                {systemView !== "Site Settings" ? (
                  <div className="table-wrapper" style={{ marginTop: 12 }}>
                    <div className="page-header" style={{ padding: "10px 12px" }}>
                      <div></div>
                      <div className="header-actions">
                        <button className="action-btn primary" onClick={addCategory}>Add Category</button>
                      </div>
                    </div>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Services</th>
                          <th>Visibility</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: "center", padding: 16 }}>No categories.</td>
                          </tr>
                        ) : (
                          categories.map((c) => (
                            <tr key={c.id}>
                              <td>{c.name}</td>
                              <td>{c.servicesCount}</td>
                              <td>
                                <span className={`badge ${c.visible ? "visible" : "hidden"}`}>{c.visible ? "Visible" : "Hidden"}</span>
                              </td>
                              <td className="table-actions">
                                <button className="action-btn" onClick={() => toggleCategoryVisibility(c.id)}>
                                  {c.visible ? "Hide" : "Show"}
                                </button>
                                <button className="action-btn danger" onClick={() => deleteCategory(c.id)}>Delete</button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="table-wrapper" style={{ marginTop: 12, padding: 16 }}>
                    <div className="settings-grid">
                      <div className="form-group">
                        <label>Site Name</label>
                        <input
                          className="search"
                          type="text"
                          value={settings.siteName}
                          onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Default User Role</label>
                        <select
                          className="select"
                          value={settings.defaultRole}
                          onChange={(e) => setSettings((s) => ({ ...s, defaultRole: e.target.value }))}
                        >
                          <option>Customer</option>
                          <option>Customer Support</option>
                          <option>Service Provider</option>
                          <option>Administrator</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Items Per Page</label>
                        <input
                          className="search"
                          type="number"
                          min="5"
                          max="100"
                          value={settings.itemsPerPage}
                          onChange={(e) => setSettings((s) => ({ ...s, itemsPerPage: Number(e.target.value) }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Maintenance Mode</label>
                        <div className="switch">
                          <input
                            id="maintenanceSwitch"
                            type="checkbox"
                            checked={settings.maintenance}
                            onChange={(e) => setSettings((s) => ({ ...s, maintenance: e.target.checked }))}
                          />
                          <label htmlFor="maintenanceSwitch">{settings.maintenance ? "Enabled" : "Disabled"}</label>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Email Notifications</label>
                        <div className="switch">
                          <input
                            id="emailNotifSwitch"
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => setSettings((s) => ({ ...s, emailNotifications: e.target.checked }))}
                          />
                          <label htmlFor="emailNotifSwitch">{settings.emailNotifications ? "On" : "Off"}</label>
                        </div>
                      </div>
                    </div>

                    <div className="header-actions" style={{ marginTop: 12 }}>
                      <button className="action-btn" onClick={resetSettings}>Reset</button>
                      <button className="action-btn primary" onClick={saveSettings}>Save Settings</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeSection === "User Management" && (
              <div className="actions-bar top-right">
                {userMgmtTab === "Service Provider" ? (
                  <>
                    <button
                      className="action-btn primary"
                      onClick={() => alert("Open Service Manager")}
                    >
                      Manage Services
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => alert("Open Listing Approvals")}
                    >
                      Review Listings
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="action-btn primary"
                      onClick={() => navigate("/admin/users")}
                    >
                      Manage Users
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => navigate("/admin/manager-approvals")}
                    >
                      Review New Managers
                    </button>
                  </>
                )}
              </div>
            )}

            {activeSection === "User Management" && (
              <div className="sub-nav inline">
                <button
                  className={`sub-nav-btn ${userMgmtTab === "Customer" ? "active" : ""}`}
                  onClick={() => setUserMgmtTab("Customer")}
                >
                  Customer
                </button>
                <button
                  className={`sub-nav-btn ${userMgmtTab === "Customer Support" ? "active" : ""}`}
                  onClick={() => setUserMgmtTab("Customer Support")}
                >
                  Customer Support
                </button>
                <button
                  className={`sub-nav-btn ${userMgmtTab === "Service Provider" ? "active" : ""}`}
                  onClick={() => setUserMgmtTab("Service Provider")}
                >
                  Service Provider
                </button>
              </div>
            )}

            {/* Short notes removed as requested */}

            {activeSection === "User Management" && (
              <div className="table-wrapper" style={{ marginTop: 12 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRows.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: 16 }}>No records.</td>
                      </tr>
                    ) : (
                      visibleRows.map((u) => (
                        <tr key={u.id}>
                          <td>{u.name}</td>
                          <td>{u.email}</td>
                          <td>{u.role}</td>
                          <td><span className={`badge ${u.status.toLowerCase()}`}>{u.status}</span></td>
                          <td>{u.joinedAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
