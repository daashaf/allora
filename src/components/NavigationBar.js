import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { ReactComponent as InfinityLogo } from "../assets/infinity-logo.svg";
import { auth, db } from "../firebase";
import "../dashboard.css";

export default function NavigationBar({ activeSection, onSectionSelect }) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
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
    navigate("/login", { state: { role: "Service Provider" } });
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

  const renderLinks = () => {
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

    if (currentRole === "Administrator") {
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
            className={navLinkClass(null, "/admin/dashboard")}
            onClick={() => handleNavRouteClick("/admin/dashboard")}
            aria-current={location.pathname.startsWith("/admin/dashboard") ? "page" : undefined}
          >
            Admin Panel
          </button>
          <button
            type="button"
            className={navLinkClass(null, "/admin/users")}
            onClick={() => handleNavRouteClick("/admin/users")}
            aria-current={location.pathname.startsWith("/admin/users") ? "page" : undefined}
          >
            Manage Users
          </button>
          <button type="button" className="dashboard-nav-link" onClick={handleLogout}>
            Logout
          </button>
        </>
      );
    }

    if (currentRole === "Customer Support") {
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
            className={navLinkClass(null, "/support")}
            onClick={() => handleNavRouteClick("/support")}
            aria-current={location.pathname.startsWith("/support") ? "page" : undefined}
          >
            Support Dashboard
          </button>
          <button type="button" className="dashboard-nav-link" onClick={handleLogout}>
            Logout
          </button>
        </>
      );
    }

    // Customer or fallback
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
            <button
              type="button"
              className={navLinkClass(null, "/support")}
              onClick={() => handleNavRouteClick("/support")}
              aria-current={location.pathname.startsWith("/support") ? "page" : undefined}
            >
              Support
            </button>
            <button className="nav-cta text-uppercase" type="button" onClick={handleJoinAsProfessional}>
              Join as Professional
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
