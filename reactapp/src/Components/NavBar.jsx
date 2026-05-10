import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HomePage.css";
import "./Navbar.css";
import { ThemeContext } from "../ThemeContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Identity from localStorage
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [displayName, setDisplayName] = useState(
    localStorage.getItem("displayName") || localStorage.getItem("username") || "Guest"
  );
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("avatarUrl") || "");

  // --- NEW: confirmation modal state ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const cancelBtnRef = useRef(null);

  // Keep identity in sync if localStorage changes (e.g., other tab)
  useEffect(() => {
    const syncFromStorage = () => {
      setRole(localStorage.getItem("role") || "");
      setDisplayName(
        localStorage.getItem("displayName") ||
          localStorage.getItem("username") ||
          "Guest"
      );
      setAvatarUrl(localStorage.getItem("avatarUrl") || "");
    };
    window.addEventListener("storage", syncFromStorage);
    syncFromStorage();
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  // --- NEW: Keyboard UX for modal (ESC to close) and initial focus on Cancel ---
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && showLogoutModal) setShowLogoutModal(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showLogoutModal]);

  useEffect(() => {
    if (showLogoutModal && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
  }, [showLogoutModal]);

  // --- CHANGED: Instead of immediate logout, open confirm modal ---
  const openLogoutConfirm = () => setShowLogoutModal(true);

  // --- NEW: Confirm/Cancel handlers ---
  const handleConfirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setRole("");
    setDisplayName("Guest");
    setAvatarUrl("");
    setShowLogoutModal(false);
    navigate("/");
  };

  const handleCancelLogout = () => setShowLogoutModal(false);

  // Menus per role
  const menus = {
    none: [
      { to: "/", label: "Home", type: "route" },
      { href: "#about", label: "About", type: "anchor" },
      { href: "#projects", label: "Get Involved", type: "anchor" },
      { onClick: () => navigate("/login"), label: "Sign In", type: "action" },
    ],
    user: [
      { to: "/", label: "Home", type: "route" },
      { to: "/viewplace", label: "View Places", type: "route" },
      { to: "/favorites", label: "Favourites", type: "route" },
    ],
    guide: [
      { to: "/", label: "Home", type: "route" },
      { to: "/newplace", label: "Add Place", type: "route" },
      { to: "/viewplace", label: "View Places", type: "route" },
    ],
  };

  const items =
    role === "GUIDE" ? menus.guide : role === "USER" ? menus.user : menus.none;

  // Derived labels
  const roleLabel = useMemo(() => {
    if (role === "GUIDE") return "Guide";
    if (role === "USER") return "User";
    return "Guest";
  }, [role]);

  const initials = useMemo(() => {
    const name = (displayName || "").trim();
    if (!name) return "G";
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (first + last).toUpperCase() || "U";
  }, [displayName]);

  const isAuthenticated = role === "USER" || role === "GUIDE";

  return (
    <>
      <nav className="navbar navbar-expand-lg tm-nav py-3">
        <div className="container tm-nav-container rounded-pill px-4 py-2 shadow-sm">
          <Link className="navbar-brand fw-bold tm-logo" to="/">
            TRAVEL TALES
          </Link>

          {/* Center menus */}
          <div className="collapse navbar-collapse justify-content-center" id="tmNav">
            <ul className="navbar-nav gap-3">
              {items.map((it, idx) => (
                <li key={idx} className="nav-item">
                  {it.type === "route" && (
                    <NavLink className="nav-link" to={it.to}>
                      {it.label}
                    </NavLink>
                  )}
                  {it.type === "anchor" && (
                    <a className="nav-link" href={it.href}>
                      {it.label}
                    </a>
                  )}
                  {it.type === "action" && (
                    <button className="btn btn-link nav-link p-0" onClick={it.onClick}>
                      {it.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Right actions */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <button
              type="button"
              className="btn theme-toggle-btn rounded-pill"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <strong>☀️</strong> : <strong>🌙</strong>}
            </button>

            {/* Profile dropdown – ONLY when logged in */}
            {isAuthenticated ? (
              <div className="dropdown user-dropdown">
                <button
                  className="btn user-pill d-flex align-items-center gap-2"
                  type="button"
                  aria-label="Account menu"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${displayName} avatar`}
                      className="avatar-img"
                    />
                  ) : (
                    <span className="avatar-circle" aria-hidden="true">
                      {initials}
                    </span>
                  )}
                  <span className="user-role-chip">{roleLabel}</span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end">
                  <li className="px-3 py-2 small text-muted">
                    Hello, Welcome <strong>{displayName}</strong>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    {/* CHANGED: open modal instead of immediate logout */}
                    <button className="dropdown-item text-danger" onClick={openLogoutConfirm}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      {/* === NEW: Logout confirmation modal === */}
      {/* Backdrop */}
      {showLogoutModal && <div className="modal-backdrop fade show"></div>}

      {/* Modal */}
      <div
        className={`modal fade ${showLogoutModal ? "show" : ""}`}
        style={{ display: showLogoutModal ? "block" : "none" }}
        role="dialog"
        aria-modal={showLogoutModal ? "true" : "false"}
        aria-labelledby="logoutModalLabel"
        aria-hidden={showLogoutModal ? "false" : "true"}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="logoutModalLabel">Confirm logout</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={handleCancelLogout}></button>
            </div>
            <div className="modal-body">
              {role === "GUIDE" || role === "USER" ? (
                <>Are you sure you want to log out as <strong>{role === "GUIDE" ? "Guide" : "User"}</strong> ({displayName})?</>
              ) : (
                <>Are you sure you want to log out of your current session?</>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleCancelLogout}
                ref={cancelBtnRef}
              >
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmLogout}>
                Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;