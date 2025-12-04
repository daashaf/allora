import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ReactComponent as InfinityLogo } from "../assets/infinity-logo.svg";
import { auth, db, isBackgroundUserSession } from "../firebase";
import "./NavigationBar.css";

export default function NavigationBar({
  activeSection,
  onSectionSelect,
  notificationCount = 0,
  notifications = [],
  onNotificationsViewed,
}) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinkClass = (section, path) => {
    const matchesSection = activeSection && section && activeSection === section;
    const matchesPath = path && location.pathname.startsWith(path);
    return `dashboard-nav-link${matchesSection || matchesPath ? " active" : ""}`;
  };

  const handleDiscoverClick = () => {
    setIsNavCollapsed(true);
    if (typeof onSectionSelect === "function") {
      onSectionSelect("discover");
      return;
    }
    if (location.pathname !== "/discover") {
      navigate("/discover", { replace: false });
    }
  };

  const handleNavRouteClick = (path) => {
    setIsNavCollapsed(true);
    navigate(path);
  };

  const handleJoinAsProfessional = () => {
    setIsNavCollapsed(true);
    navigate("/provider/register", { state: { role: "Service Provider" } });
  };

  const handleLoginSelect = (value) => {
    setIsNavCollapsed(true);
    setShowLoginMenu(false);
    if (value === "provider") {
      navigate("/provider/login");
    } else {
      navigate("/login");
    }
  };

  const handleLogout = async () => {
    setIsNavCollapsed(true);
    try {
      await signOut(auth);
    } finally {
      localStorage.removeItem("allora-demo-role");
      setCurrentUser(null);
      setCurrentRole(null);
      navigate("/login");
    }
  };

  const toggleNavCollapse = () => {
    setIsNavCollapsed((previous) => !previous);
  };

  const handleNotificationsClick = () => {
    setIsNavCollapsed(true);
    if (!isAdminView && !isAgentView) {
      setShowNotificationList((open) => !open);
    }
    if (typeof onNotificationsViewed === "function") {
      onNotificationsViewed();
    }
    if (isAdminView || isAgentView) {
      const targetSearch = "?target=notifications";
      const onAdminDashboard = isAdminView && location.pathname.startsWith("/admin/dashboard");
      if (onAdminDashboard) {
        const panel = document.getElementById("admin-notifications-panel");
        if (panel) {
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        if (location.search !== targetSearch) {
          navigate(`/admin/dashboard${targetSearch}`);
        }
      } else {
        navigate(`/admin/dashboard${targetSearch}`);
      }
    }
  };

  useEffect(() => {
    setIsNavCollapsed(true);
    setShowLoginMenu(false);
    setShowNotificationList(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!auth || !db) return undefined;

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user || isBackgroundUserSession(user)) {
        setCurrentUser(null);
        setCurrentRole(null);
        return;
      }
      setCurrentUser(user);
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.exists() ? snap.data()?.role : null;
        setCurrentRole(role || null);
      } catch (error) {
        console.warn("[Nav] Failed to load user role", error);
        setCurrentRole(null);
      }
    });

    return () => unsub();
  }, [location.pathname]);

  const pathname = location.pathname;

  const isAgentView = pathname.startsWith("/agent-dashboard") || currentRole === "Customer Support";
  const isAdminView = pathname.startsWith("/admin") || currentRole === "Administrator";
  // Only show the provider workspace nav when actually on provider routes, not on customer pages.

  const isAgentView = pathname.startsWith("/agent-dashboard");
  const isAdminView = pathname.startsWith("/admin");

  const isProviderView = pathname.startsWith("/provider");
  const isMinimalNav = isAgentView || isAdminView || isProviderView;

  const minimalHeading = () => {
    if (isAgentView) return { kicker: "Agent workspace", title: "Customer Support Dashboard" };
    if (isAdminView) return { kicker: "Admin workspace", title: "Admin Dashboard" };
    if (isProviderView) return { kicker: "Provider workspace", title: "Service Provider Dashboard" };
    return null;
  };

  const renderLinks = () => {
    if (isMinimalNav) return null;

    if (!currentUser) {
      return (
        <>
          <button
            type="button"
            className={navLinkClass("discover", "/discover")}
            onClick={handleDiscoverClick}
            aria-current={location.pathname.startsWith("/discover") ? "page" : undefined}
          >
            Discover
          </button>
          <button
            type="button"
            className={navLinkClass(null, "/about")}
            onClick={() => handleNavRouteClick("/about")}
            aria-current={location.pathname.startsWith("/about") ? "page" : undefined}
          >
            About Us
          </button>
          <button
            type="button"
            className={navLinkClass(null, "/services")}
            onClick={() => handleNavRouteClick("/services")}
            aria-current={location.pathname.startsWith("/services") ? "page" : undefined}
          >
            Services
          </button>
        </>
      );
    }

    return (
      <>
        <button
          type="button"
          className={navLinkClass("discover", "/discover")}
          onClick={handleDiscoverClick}
          aria-current={location.pathname.startsWith("/discover") ? "page" : undefined}
        >
          Discover
        </button>
        <button
          type="button"
          className={navLinkClass("board", "/my-board")}
          onClick={() => handleNavRouteClick("/my-board")}
          aria-current={location.pathname.startsWith("/my-board") ? "page" : undefined}
        >
          My Board
        </button>
        <button
          type="button"
          className={navLinkClass(null, "/about")}
          onClick={() => handleNavRouteClick("/about")}
          aria-current={location.pathname.startsWith("/about") ? "page" : undefined}
        >
          About Us
        </button>
        <button
          type="button"
          className={navLinkClass(null, "/services")}
          onClick={() => handleNavRouteClick("/services")}
          aria-current={location.pathname.startsWith("/services") ? "page" : undefined}
        >
          Services
        </button>
      </>
    );
  };

  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  const notificationPopoverStyle = {
    position: "fixed",
    right: "16px",
    bottom: "16px",
    top: "auto",
    width: "280px",
    maxHeight: "260px",
    overflowY: "auto",
    zIndex: 2000,
  };

  return (
    <header className="dashboard-nav navbar navbar-expand-lg navbar-light sticky-top">
      <div className="container-fluid">
        <div className="nav-brand navbar-brand d-flex align-items-center gap-3">
          <div className="nav-logo" aria-hidden="true">
            <InfinityLogo />
          </div>
          <div className="nav-brand-title">
            <span>ALLORA</span>
            <span>SERVICE HUB</span>
          </div>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="dashboardNav"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
          onClick={toggleNavCollapse}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={`collapse navbar-collapse${isNavCollapsed ? "" : " show"}`}
          id="dashboardNav"
        >
          <div className="navbar-nav mx-auto align-items-lg-center gap-lg-4 text-center text-lg-start">
            {renderLinks()}
          </div>

          <div className="nav-actions d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {isMinimalNav ? (
              <div className="nav-support-wrapper">
                {minimalHeading() && (
                  <div className="nav-support-heading text-start">
                    <p className="nav-support-kicker">{minimalHeading().kicker}</p>
                    <h2 className="nav-support-title">{minimalHeading().title}</h2>
                  </div>
                )}
                <div className="nav-support-actions">
                  {/* Bell/notifications hidden for provider view */}
                  {!isProviderView && (
                    <div className="nav-notification-wrapper">
                      <button
                        type="button"
                        className="nav-icon-btn"
                        aria-label="Notifications"
                        title="Notifications"
                        onClick={handleNotificationsClick}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 4a6 6 0 00-6 6v3.382l-.723 1.447A1 1 0 006.173 17h11.654a1 1 0 00.896-1.471L18 13.382V10a6 6 0 00-6-6z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 19a2 2 0 004 0"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {notificationCount > 0 && (
                          <span className="nav-icon-badge" aria-label={`${notificationCount} notifications`}>
                            {notificationCount}
                          </span>
                        )}
                      </button>
                    {showNotificationList && recentNotifications.length > 0 && (
                      <div className="nav-notification-popover" style={notificationPopoverStyle}>
                        {recentNotifications.map((n) => (
                            <div key={n.id} className="nav-notification-item">
                              <p className="nav-notification-subject">{n.subject || "Notification"}</p>
                              <p className="nav-notification-message">
                                {n.message || n.audience || "New update available."}
                              </p>
                              <span className="nav-notification-meta">{n.sentAt || "Just now"}</span>
                            </div>
                          ))}
                              <button
                            type="button"
                            className="nav-notification-viewall"
                            onClick={() => {
                              setShowNotificationList(false);
                              if (typeof onNotificationsViewed === "function") {
                                onNotificationsViewed();
                              }
                              if (isAdminView || isAgentView) {
                                const targetSearch = "?target=notifications";
                                const onAdminDashboard =
                                  isAdminView && location.pathname.startsWith("/admin/dashboard");
                                if (onAdminDashboard) {
                                  const panel = document.getElementById("admin-notifications-panel");
                                  if (panel) {
                                    panel.scrollIntoView({ behavior: "smooth", block: "start" });
                                  }
                                  if (location.search !== targetSearch) {
                                    navigate(`/admin/dashboard${targetSearch}`);
                                  }
                                } else {
                                  navigate(`/admin/dashboard${targetSearch}`);
                                }
                              }
                            }}
                          >
                            View all
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Menu icon removed per request */}
                  <button type="button" className="dashboard-nav-link nav-support-logout" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>
                ) : (
                  <>
                {currentUser ? (
                  <button type="button" className="dashboard-nav-link" onClick={handleLogout}>
                    Logout
                  </button>
                ) : (
                  <div className="nav-login-buttons d-flex flex-wrap align-items-center gap-2">
                    <div className="nav-login-menu">
                      <button
                        type="button"
                        className="nav-login-trigger"
                        aria-haspopup="menu"
                        aria-expanded={showLoginMenu}
                        onClick={() => setShowLoginMenu((open) => !open)}
                      >
                        <span className="nav-login-label">Login</span>
                        <span className="nav-login-chevron" aria-hidden="true">
                          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M5 7l5 6 5-6"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </button>
                      {showLoginMenu && (
                        <div className="nav-login-dropdown" role="menu">
                          <button type="button" onClick={() => handleLoginSelect("customer")} role="menuitem">
                            Customer Login
                          </button>
                          <button type="button" onClick={() => handleLoginSelect("provider")} role="menuitem">
                            Service Provider Login
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <button className="nav-cta text-uppercase" type="button" onClick={handleJoinAsProfessional}>
                  Join as Professional
                </button>
                <button
                  type="button"
                  className={navLinkClass(null, "/support")}
                  onClick={() => handleNavRouteClick("/support")}
                  aria-current={location.pathname.startsWith("/support") ? "page" : undefined}
                >
                  Support
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
