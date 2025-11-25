import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, ensureFirebaseAuth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const defaultSettings = {
  siteName: "Allora Service Hub",
  maintenance: false,
  defaultRole: "Customer",
  emailNotifications: true,
  itemsPerPage: 10,
};

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

  const formatSnapshotTimestamp = (value, fallback = "") => {
    if (!value) {
      return { display: fallback, order: 0 };
    }
    if (typeof value?.toMillis === "function") {
      const dateValue = value.toDate();
      return { display: dateValue.toLocaleString(), order: value.toMillis() };
    }
    const parsed = Date.parse(value);
    return {
      display: typeof value === "string" ? value : fallback,
      order: Number.isNaN(parsed) ? 0 : parsed,
    };
  };

const getBadgeLabel = (value, fallback = "Unknown") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const getBadgeClass = (value, fallback = "unknown") => {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.toLowerCase() : fallback;
};

const ensureAuth = async () => {
  const user = await ensureFirebaseAuth();
  if (!user) {
    alert(
      "Firebase authentication is not available. Enable anonymous auth or provide service credentials."
    );
    return false;
  }
  return true;
};

  // User Management data
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(collection(db, "users"), (snapshot) => {
      setCustomers(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const role = data.role || data.Role || data.userType || "Customer";
          const status = data.status || data.Status || data.accountStatus || "Active";
          const joinedRaw = data.joinedAt || data.Joined || data.joined || "";
          const { display } = formatSnapshotTimestamp(
            joinedRaw,
            joinedRaw || new Date().toISOString().slice(0, 10)
          );
          return {
            id: docSnap.id,
            name: data.name || data.Name || data.displayName || data.fullName || "Unnamed",
            email: data.email || data.Email || data.emailAddress || "",
            role,
            status,
            joinedAt: display,
          };
        })
      );
    });
  }, []);

  const normalizeRole = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

  const visibleRows = useMemo(() => {
    const target = normalizeRole(userMgmtTab);
    return customers.filter((u) => normalizeRole(u.role) === target);
  }, [customers, userMgmtTab]);

  // Service Management state + Firestore data
  const [services, setServices] = useState([]);
  const [listings, setListings] = useState([]);
  const [serviceView, setServiceView] = useState("Manage Services");

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(collection(db, "Services"), (snapshot) => {
      const docs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      setServices(docs);
      setListings(docs);
    });
  }, []);

  const updateServiceStatus = async (serviceId, status) => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    try {
      await updateDoc(doc(db, "Services", serviceId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("[Firebase] Failed to update service", serviceId, error);
      alert("Unable to update the service. Please try again.");
    }
  };

  const toggleServiceStatus = async (serviceId) => {
    const current = services.find((service) => service.id === serviceId);
    if (!current) return;
    const nextStatus = current.status === "Suspended" ? "Active" : "Suspended";
    await updateServiceStatus(serviceId, nextStatus);
  };

  const deleteService = async (serviceId) => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    if (!window.confirm("Delete this service permanently?")) return;
    try {
      await deleteDoc(doc(db, "Services", serviceId));
    } catch (error) {
      console.error("[Firebase] Failed to delete service", serviceId, error);
      alert("Unable to delete the service. Please try again.");
    }
  };

  const approveListing = async (serviceId) => {
    await updateServiceStatus(serviceId, "Approved");
  };

  const rejectListing = async (serviceId) => {
    await updateServiceStatus(serviceId, "Rejected");
  };

  // System Management: categories
  const [systemView, setSystemView] = useState("Manage Categories");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(collection(db, "Category"), (snapshot) => {
      setCategories(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || "Unnamed",
            servicesCount: data.servicesCount ?? 0,
            visible: data.visible ?? true,
          };
        })
      );
    });
  }, []);

  const addCategory = async () => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    const name = window.prompt("New category name?");
    if (!name) return;
    try {
      await addDoc(collection(db, "Category"), {
        name,
        servicesCount: 0,
        visible: true,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("[Firebase] Failed to add category", error);
      alert("Unable to add category. Please try again.");
    }
  };

  const toggleCategoryVisibility = async (id) => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    const target = categories.find((c) => c.id === id);
    if (!target) return;
    try {
      await updateDoc(doc(db, "Category", id), {
        visible: !target.visible,
      });
    } catch (error) {
      console.error("[Firebase] Failed to update category", id, error);
      alert("Unable to update category visibility. Please try again.");
    }
  };

  const deleteCategory = async (id) => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    try {
      await deleteDoc(doc(db, "Category", id));
    } catch (error) {
      console.error("[Firebase] Failed to delete category", id, error);
      alert("Unable to delete category. Please try again.");
    }
  };

  // Service Categories data
  const SERVICE_CATEGORY_COLLECTION = "ServiceCategories";
  const [categoryServices, setCategoryServices] = useState([]);

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(collection(db, SERVICE_CATEGORY_COLLECTION), (snapshot) => {
      setCategoryServices(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            service: data.service || "Untitled",
            category: data.category || "General",
            provider: data.provider || "Unknown",
            status: data.status || "Active",
          };
        })
      );
    });
  }, []);

  const addCategoryService = async () => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    const name = window.prompt("Service name?");
    if (!name) return;
    const category = window.prompt("Category?");
    const provider = window.prompt("Provider?");
    try {
      await addDoc(collection(db, SERVICE_CATEGORY_COLLECTION), {
        service: name,
        category: category || "General",
        provider: provider || "Unknown",
        status: "Active",
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("[Firebase] Failed to add service category", error);
      alert("Unable to add the service. Please try again.");
    }
  };

  const toggleCategoryService = async (id) => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    const serviceRecord = categoryServices.find((s) => s.id === id);
    if (!serviceRecord) return;
    const nextStatus = serviceRecord.status === "Suspended" ? "Active" : "Suspended";
    try {
      await updateDoc(doc(db, SERVICE_CATEGORY_COLLECTION, id), { status: nextStatus });
    } catch (error) {
      console.error("[Firebase] Failed to update service category", id, error);
      alert("Unable to update the service status. Please try again.");
    }
  };

  const deleteCategoryService = async (id) => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    try {
      await deleteDoc(doc(db, SERVICE_CATEGORY_COLLECTION, id));
    } catch (error) {
      console.error("[Firebase] Failed to delete service category", id, error);
      alert("Unable to delete the service. Please try again.");
    }
  };

  // Issue Resolution: queue + actions
  const [issueFilter, setIssueFilter] = useState("Open");
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    if (!db) return undefined;
    const ticketsQuery = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
    return onSnapshot(ticketsQuery, (snapshot) => {
      const docs = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          const { display, order } = formatSnapshotTimestamp(
            data.createdAt,
            data.createdAt || new Date().toISOString().slice(0, 10)
          );
          return {
            id: docSnap.id,
            subject: data.subject || "Untitled",
            customer: data.customer || "Unknown",
            priority: data.priority || "Low",
            status: data.status || "Open",
            createdAt: display,
            _order: order,
          };
        })
        .sort((a, b) => b._order - a._order)
        .map(({ _order, ...rest }) => rest);
      setIssues(docs);
    });
  }, []);

  const filteredIssues = useMemo(
    () => issues.filter((i) => (issueFilter === "All" ? true : i.status === issueFilter)),
    [issues, issueFilter]
  );

  const updateIssueStatus = async (id, status) => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    try {
      await updateDoc(doc(db, "tickets", id), { status });
    } catch (error) {
      console.error("[Firebase] Failed to update ticket", id, error);
      alert("Unable to update the ticket. Please try again.");
    }
  };

  const resolveIssue = (id) => updateIssueStatus(id, "Resolved");
  const closeIssue = (id) => updateIssueStatus(id, "Closed");
  const reopenIssue = (id) => updateIssueStatus(id, "Open");

  // Security management: roles and permissions
  const defaultPerms = [
    "view_users",
    "manage_services",
    "manage_categories",
    "send_notifications",
    "view_audit",
  ];
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(collection(db, "Roles"), (snapshot) => {
      setRoles(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || "Role",
            members: data.members ?? 0,
            perms: new Set(data.perms || []),
          };
        })
      );
    });
  }, []);

  const addRole = async () => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    const name = window.prompt("New role name?");
    if (!name) return;
    try {
      await addDoc(collection(db, "Roles"), {
        name,
        members: 0,
        perms: ["view_users"],
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("[Firebase] Failed to add role", error);
      alert("Unable to add role. Please try again.");
    }
  };

  const deleteRole = async (id) => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    try {
      await deleteDoc(doc(db, "Roles", id));
    } catch (error) {
      console.error("[Firebase] Failed to delete role", id, error);
      alert("Unable to delete role. Please try again.");
    }
  };

  const toggleRolePerm = async (id, key) => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    const role = roles.find((r) => r.id === id);
    if (!role) return;
    const next = new Set(role.perms);
    next.has(key) ? next.delete(key) : next.add(key);
    setRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, perms: new Set(next) } : r))
    );
    try {
      await updateDoc(doc(db, "Roles", id), { perms: Array.from(next) });
    } catch (error) {
      console.error("[Firebase] Failed to update role permissions", id, error);
      alert("Unable to update permissions. Please try again.");
    }
  };

  // Notification Center: compose + history
  const [notificationView, setNotificationView] = useState("Compose");
  const [compose, setCompose] = useState({
    audience: "All Customers",
    channel: "Email",
    subject: "",
    message: "",
  });
  const [notifications, setNotifications] = useState([]);

  const summaryCards = useMemo(() => {
    const serviceProviders = customers.filter((u) => u.role === "Service Provider").length;
    const supportAgents = customers.filter((u) => u.role === "Customer Support").length;
    const openIssues = issues.filter((issue) => issue.status === "Open").length;
    const pendingListings = listings.filter(
      (listing) => (listing.status || "").toLowerCase() === "pending"
    ).length;
    return [
      {
        key: "customers",
        label: "Customers",
        value: customers.length,
        detail: `${serviceProviders} service providers`,
      },
      {
        key: "support",
        label: "Support Team",
        value: supportAgents,
        detail: `${Math.max(customers.length - supportAgents, 0)} other members`,
      },
      {
        key: "services",
        label: "Services",
        value: services.length,
        detail: `${pendingListings} awaiting review`,
      },
      {
        key: "tickets",
        label: "Open Tickets",
        value: openIssues,
        detail: `${issues.length} total`,
      },
      {
        key: "notifications",
        label: "Notifications Sent",
        value: notifications.length,
        detail: `${roles.length} roles configured`,
      },
    ];
  }, [customers, services, listings, issues, notifications, roles]);

  const recentNotifications = useMemo(() => notifications.slice(0, 3), [notifications]);
  const recentIssues = useMemo(() => issues.slice(0, 3), [issues]);
  const recentServices = useMemo(() => services.slice(0, 3), [services]);

  useEffect(() => {
    if (!db) return undefined;
    return onSnapshot(collection(db, "Notification"), (snapshot) => {
      const docs = snapshot.docs
        .map((docSnap) => {
          const data = docSnap.data();
          const { display, order } = formatSnapshotTimestamp(data.sentAt, "");
          return {
            id: docSnap.id,
            subject: data.subject || "",
            audience: data.audience || "",
            channel: data.channel || "Email",
            status: data.status || "Sent",
            sentAt: display,
            _order: order,
          };
        })
        .sort((a, b) => b._order - a._order)
        .map(({ _order, ...rest }) => rest);
      setNotifications(docs);
    });
  }, []);

  const sendNotification = async () => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    const subject = compose.subject.trim();
    const message = compose.message.trim();
    if (!subject || !message) {
      alert("Please enter subject and message");
      return;
    }
    try {
      console.info("[Notification] sending", {
        audience: compose.audience,
        channel: compose.channel,
        subject,
        message,
      });
      await addDoc(collection(db, "Notification"), {
        audience: compose.audience,
        channel: compose.channel,
        subject,
        message,
        status: "Sent",
        sentAt: serverTimestamp(),
      });
      setCompose((prev) => ({ ...prev, subject: "", message: "" }));
      alert("Notification sent");
    } catch (error) {
      console.error("[Firebase] Failed to send notification", error);
      alert(
        `Unable to send notification. ${error?.code || "Unknown error"} ${
          error?.message ? "- " + error.message : ""
        }`
      );
    }
  };

  // System Management: site settings stored in Firestore
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    if (!db) return undefined;
    const settingsRef = doc(db, "Admin", "siteSettings");
    return onSnapshot(settingsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSettings({ ...defaultSettings, ...snapshot.data() });
      }
    });
  }, []);

  const saveSettings = async () => {
    if (!db) return;
    if (!(await ensureAuth())) return;
    try {
      await setDoc(doc(db, "Admin", "siteSettings"), settings, { merge: true });
      alert("Settings saved");
    } catch (error) {
      console.error("[Firebase] Failed to save settings", error);
      alert("Unable to save settings. Please try again.");
    }
  };

  const resetSettings = async () => {
    setSettings(defaultSettings);
    if (!db) return;
    if (!(await ensureAuth())) return;
    try {
      await setDoc(doc(db, "Admin", "siteSettings"), defaultSettings);
    } catch (error) {
      console.error("[Firebase] Failed to reset settings", error);
      alert("Unable to reset settings. Please try again.");
    }
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

            <div className="cards">
              {summaryCards.map((card) => (
                <div key={card.key} className="card commission">
                  <h4>{card.label}</h4>
                  <h2>{card.value}</h2>
                  {card.detail && <p>{card.detail}</p>}
                </div>
              ))}
            </div>

            <div className="cards">
              <div className="card latest">
                <h4>Recent Notifications</h4>
                <div className="activity">
                  {recentNotifications.length === 0 ? (
                    <p>No notifications sent.</p>
                  ) : (
                    recentNotifications.map((notification) => (
                      <p key={notification.id}>
                        <strong>{notification.subject || "Untitled notification"}</strong>
                        <br />
                        <span>
                          {notification.audience || "All"} • {notification.sentAt || "Queued"}
                        </span>
                      </p>
                    ))
                  )}
                </div>
              </div>

              <div className="card latest">
                <h4>Latest Tickets</h4>
                <div className="activity">
                  {recentIssues.length === 0 ? (
                    <p>No tickets available.</p>
                  ) : (
                    recentIssues.map((ticket) => (
                      <p key={ticket.id}>
                        <strong>{ticket.subject}</strong>
                        <br />
                        <span>
                          {ticket.customer} • {ticket.createdAt || "Pending"}
                        </span>
                      </p>
                    ))
                  )}
                </div>
              </div>

              <div className="card messages">
                <h4>Service Updates</h4>
                <div className="activity">
                  {recentServices.length === 0 ? (
                    <p>No services published yet.</p>
                  ) : (
                    recentServices.map((service) => (
                      <p key={service.id}>
                        {service.service || "Service"} • {service.status || "Pending"}
                      </p>
                    ))
                  )}
                </div>
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
                            <td>
                              <span className={`badge ${getBadgeClass(s.status)}`}>
                                {getBadgeLabel(s.status)}
                              </span>
                            </td>
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
                            <td>
                              <span className={`badge ${getBadgeClass(l.status)}`}>
                                {getBadgeLabel(l.status)}
                              </span>
                            </td>
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
                            <td>
                              <span className={`badge ${getBadgeClass(s.status)}`}>
                                {getBadgeLabel(s.status)}
                              </span>
                            </td>
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
                            <td>
                              <span className={`badge ${getBadgeClass(iss.priority, "low")}`}>
                                {getBadgeLabel(iss.priority)}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${getBadgeClass(iss.status)}`}>
                                {getBadgeLabel(iss.status)}
                              </span>
                            </td>
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
                      onClick={() => {
                        setActiveSection("Service Management");
                        setServiceView("Manage Services");
                      }}
                    >
                      Manage Services
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => {
                        setActiveSection("Service Management");
                        setServiceView("Review Listings");
                      }}
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
                          <td>
                            <span className={`badge ${getBadgeClass(u.status)}`}>
                              {getBadgeLabel(u.status)}
                            </span>
                          </td>
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
