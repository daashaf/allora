import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as InfinityLogo } from "../assets/infinity-logo.svg";
import { ROLE_OPTIONS } from "../constants/roles";
import "../dashboard.css";

export default function NavigationBar({ activeSection, onSectionSelect }) {
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const roleMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinkClass = (section) =>
    `dashboard-nav-link${activeSection === section ? " active" : ""}`;

  const handleDiscoverClick = () => {
    setIsNavCollapsed(true);
    if (typeof onSectionSelect === "function") {
      onSectionSelect("discover");
    } else if (location.pathname !== "/") {
      navigate("/", { replace: false });
    }
  };

  const handleNavRouteClick = (path) => {
    setIsNavCollapsed(true);
    navigate(path);
  };

  const handleOpenAbout = () => {
    setIsNavCollapsed(true);
    navigate("/about");
  };

  const handleJoinAsProfessional = () => {
    setIsNavCollapsed(true);
    navigate("/login", { state: { role: "Service Provider" } });
  };

  const handleRoleSelect = (role) => {
    setIsRoleMenuOpen(false);
    setIsNavCollapsed(true);
    navigate("/login", { state: { role } });
  };

  const toggleRoleMenu = () => {
    setIsRoleMenuOpen((previous) => !previous);
  };

  const toggleNavCollapse = () => {
    setIsNavCollapsed((previous) => !previous);
  };

  useEffect(() => {
    if (!isRoleMenuOpen) {
      return undefined;
    }

    const handleClickOutside = (event) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target)) {
        setIsRoleMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsRoleMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isRoleMenuOpen]);

  useEffect(() => {
    setIsNavCollapsed(true);
  }, [location.pathname]);

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
            <button type="button" className={navLinkClass("discover")} onClick={handleDiscoverClick}>
              Discover
            </button>
            <button
              type="button"
              className="dashboard-nav-link"
              onClick={() => handleNavRouteClick("/insights")}
            >
              FAQs & Customer Stories
            </button>
            <button type="button" className="dashboard-nav-link" onClick={handleOpenAbout}>
              About Us
            </button>
            <button
              type="button"
              className="dashboard-nav-link"
              onClick={() => handleNavRouteClick("/services")}
            >
              Services
            </button>
          </div>

          <div className="nav-actions d-flex align-items-center gap-3 mt-3 mt-lg-0">
            <div
              className={`dropdown nav-login-wrapper ${isRoleMenuOpen ? "show" : ""}`}
              ref={roleMenuRef}
            >
              <button
                className="nav-login dropdown-toggle"
                type="button"
                onClick={toggleRoleMenu}
                aria-haspopup="true"
                aria-expanded={isRoleMenuOpen}
                aria-controls="role-select-menu"
              >
                Login
              </button>
              <div
                className={`dropdown-menu dropdown-menu-end${isRoleMenuOpen ? " show" : ""}`}
                id="role-select-menu"
                role="menu"
                aria-label="Choose a role to continue to login"
              >
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    className="dropdown-item role-select-option"
                    onClick={() => handleRoleSelect(role)}
                    role="menuitem"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="nav-support"
              type="button"
              onClick={() => handleNavRouteClick("/insights#contact")}
            >
              Customer Support
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
