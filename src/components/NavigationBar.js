import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ReactComponent as InfinityLogo } from "../assets/infinity-logo.svg";
import { auth, db } from "../firebase";
import "./NavigationBar.css";

export default function NavigationBar({ activeSection, onSectionSelect }) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
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
    navigate("/provider/login", { state: { role: "Service Provider" } });
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

  const toggleLoginMenu = () => setShowLoginMenu((prev) => !prev);

  const closeLoginMenu = () => setShowLoginMenu(false);

  const toggleNavCollapse = () => {
    setIsNavCollapsed((previous) => !previous);
  };

  useEffect(() => {
    setIsNavCollapsed(true);
  }, [location.pathname]);

  useEffect(() => {
    if (!auth || !db) return undefined;

    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setCurrentRole(null);
        return;
      }
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
  }, []);

  const pathname = location.pathname;
  const isAgentView = pathname.startsWith("/agent-dashboard") || currentRole === "Customer Support";
  const isAdminView = pathname.startsWith("/admin") || currentRole === "Administrator";
  const isProviderView = pathname.startsWith("/provider") || currentRole === "Service Provider";
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
          <button
            type="button"
            className={navLinkClass(null, "/login")}
            onClick={() => handleNavRouteClick("/login")}
            aria-current={location.pathname.startsWith("/login") ? "page" : undefined}
          >
            Login
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
        <button type="button" className="dashboard-nav-link" onClick={handleLogout}>
          Logout
        </button>
      </>
    );
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
                <button type="button" className="dashboard-nav-link nav-support-logout" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <div className="nav-login-menu">
                  <button type="button" className="dashboard-nav-link nav-login-trigger" onClick={toggleLoginMenu}>
                    Login ▼
                  </button>
                  {showLoginMenu && (
                    <div className="nav-login-dropdown" onMouseLeave={closeLoginMenu}>
                      <button onClick={() => handleNavRouteClick("/login")}>Customer Login</button>
                      <button onClick={() => handleNavRouteClick("/staff/login")}>Staff Login</button>
                    </div>
                  )}
                </div>
                <button className="nav-cta text-uppercase" type="button" onClick={handleJoinAsProfessional}>
                  Join as Professional
                </button>
                <button
                  type="button"
                  className={`${navLinkClass(null, "/support")} nav-support-link`}
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
