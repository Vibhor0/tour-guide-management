
import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import "./UserNavbar.css";

export default function UserNavbar() {
  const navigate = useNavigate();

  // -------- Desktop & Mobile "Places" toggles --------
  const [placesOpen, setPlacesOpen] = useState(false);          // desktop dropdown
  const [mobilePlacesOpen, setMobilePlacesOpen] = useState(false); // mobile disclosure

  // -------- User info --------
  const userName = localStorage.getItem("userName") || "DemoUser";
  const role = localStorage.getItem("role") || "User";

  // -------- Theme (respects OS, persists override) --------
  const getPreferredTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };
  const [theme, setTheme] = useState(getPreferredTheme());
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // -------- Mobile menu (hamburger) --------
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleMobile = () => setMobileOpen((o) => !o);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setPlacesOpen(false);
        setMobilePlacesOpen(false);
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  // -------- Logout modal --------
  const [showLogout, setShowLogout] = useState(false);
  const confirmLogout = () => {
    ["token", "role", "userName", "userId"].forEach((k) => localStorage.removeItem(k));
    setShowLogout(false);
    navigate("/login");
  };

  return (
    <>
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="un-skiplink">Skip to main content</a>

      <header className="un-navbar">
        {/* Left: Brand */}
        <div className="un-brand">
          <Link to="/home" className="un-brand-link">Travel Tales</Link>
        </div>

        {/* Center: Primary nav (DESKTOP) */}
        <nav className="un-links" aria-label="Primary">
          <NavLink
            to="/home"
            end
            className={({ isActive }) => "un-link" + (isActive ? " active" : "")}
          >
            Home
          </NavLink>

          {/* Places dropdown (desktop) */}
          <div
            className="un-nav-dropdown"
            onMouseEnter={() => setPlacesOpen(true)}
            onMouseLeave={() => setPlacesOpen(false)}
          >
            <button
              type="button"
              className="un-link un-link--btn"
              aria-haspopup="menu"
              aria-expanded={placesOpen ? "true" : "false"}
              aria-controls="un-places-menu"
              onClick={() => setPlacesOpen((o) => !o)} // also toggles by click/touch
            >
              Places
            </button>

            {placesOpen && (
              <div id="un-places-menu" className="un-dropdown-menu" role="menu">
                <NavLink
                  to="/viewplace"
                  className={({ isActive }) => "un-dropdown-item" + (isActive ? " active" : "")}
                  role="menuitem"
                  onClick={() => setPlacesOpen(false)}
                >
                  View Places
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* Right controls */}
        <div className="un-right">
          <button
            className="un-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          >
            {theme === "light" ? "☀️" : "🌙"}
          </button>

          <div className="un-user-badge" role="presentation">
            {userName} / {role}
          </div>

          <button className="un-logout-btn" onClick={() => setShowLogout(true)}>
            Logout
          </button>

          {/* Mobile hamburger */}
          <button
            className="un-hamburger"
            aria-label="Toggle menu"
            aria-controls="un-mobile-menu"
            aria-expanded={mobileOpen ? "true" : "false"}
            onClick={toggleMobile}
          >
            ☰
          </button>
        </div>
      </header>

      {/* Mobile menu (collapsible, no complex ARIA menu roles) */}
      <div
        id="un-mobile-menu"
        className={"un-mobile " + (mobileOpen ? "open" : "")}
        hidden={!mobileOpen}
      >
        <nav className="un-mobile-links" aria-label="Mobile">
          <NavLink
            to="/home"
            end
            className={({ isActive }) => "un-link" + (isActive ? " active" : "")}
            onClick={() => setMobileOpen(false)}
          >
            Home
          </NavLink>

          {/* Mobile “Places” collapsible group */}
          <div className="un-mobile-group">
            <button
              className="un-mobile-trigger"
              aria-expanded={mobilePlacesOpen ? "true" : "false"}
              aria-controls="un-mobile-places"
              onClick={() => setMobilePlacesOpen((o) => !o)}
            >
              Places <span className="un-caret">{mobilePlacesOpen ? "▾" : "▸"}</span>
            </button>

            <div
              id="un-mobile-places"
              className={"un-mobile-collapsible " + (mobilePlacesOpen ? "open" : "")}
              hidden={!mobilePlacesOpen}
            >
              <NavLink
                to="/viewplace"
                className={({ isActive }) => "un-link" + (isActive ? " active" : "")}
                onClick={() => {
                  setMobilePlacesOpen(false);
                  setMobileOpen(false);
                }}
              >
                View Places
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

      {/* Logout Modal */}
      {showLogout && (
        <div className="un-modal-overlay" role="dialog" aria-modal="true">
          <div className="un-modal">
            <h3 className="un-modal__title">Are you sure you want to logout?</h3>
            <div className="un-modal__actions">
              <button className="un-btn un-btn--danger" onClick={confirmLogout}>
                Yes, Logout
              </button>
              <button className="un-btn un-btn--ghost" onClick={() => setShowLogout(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
