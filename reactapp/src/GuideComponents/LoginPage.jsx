// LoginPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./LoginPage.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../useAuth";
import api from "../apiConfig";

export default function LoginPage() {
  // ---- Dynamic light background images (optional eye-candy) ----
  const bgImages = useMemo(
    () => [
      "/assets/pastel01.jpg",
      "/assets/pastel02.jpg",
      "/assets/pastel03.jpg",
      "/assets/pastel04.jpeg",
    ],
    []
  );

  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined" || bgImages.length <= 1) return;
    const mql =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    if (mql?.matches) return;
    const id = setInterval(() => {
      setBgIndex((i) => (i + 1) % bgImages.length);
    }, 12000);
    return () => clearInterval(id);
  }, [bgImages.length]);

  useEffect(() => {
    const next = (bgIndex + 1) % bgImages.length;
    const img = new Image();
    img.src = bgImages[next];
  }, [bgIndex, bgImages]);

  // ---- State ----
  const [login, setLogin] = useState({ username: "", password: "" });
  const [register, setRegister] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const [isLoginPanel, setIsLoginPanel] = useState(true);

  // separate error bags for clarity
  const [regError, setRegError] = useState({});
  const [loginError, setLoginError] = useState({});

  const [message, setMessage] = useState(""); // general info/success/fail
  const [loginMessage, setLoginMessage] = useState(""); // used in your login alert

  const navigate = useNavigate();
  const [qs] = useSearchParams();
  const auth = useAuth(); // { login({token,role}), logout(), role, isAuthenticated }

  // ---- NEW: show/hide password states (added, no renames changed) ----
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // ---- Handlers ----
  const handleChange = (e) =>
    setLogin((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleChangeForRegister = (e) =>
    setRegister((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ---- Password checks (Register live hints) ----
  const getPasswordChecks = (pw) => ({
    hasUpper: /[A-Z]/.test(pw),
    hasLower: /[a-z]/.test(pw),
    hasSpecial: /[^A-Za-z0-9]/.test(pw),
    minLen: pw.length >= 10,
  });
  const regPwChecks = getPasswordChecks(register.password);

  // ---- Validation ----
  // 10+ chars, at least 1 upper, 1 lower, 1 special; whitespace not allowed
  const strongPassRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])\S{10,}$/;

  const ValidateRegister = () => {
    const err = {};

    // First name
    const fn = register.firstName.trim();
    if (fn === "") err.firstName = "First name is required";
    else if (fn.length < 2 || fn.length > 50)
      err.firstName = "Enter a name between 2–50 characters.";

    // Last name
    if (register.lastName.trim() === "")
      err.lastName = "Last name is required";

    // Username
    const un = register.username.trim();
    if (un === "") err.username = "Username is required";
    else if (un.length < 2 || un.length > 50)
      err.username = "Enter a name between 2–50 characters.";

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const em = register.email.trim();
    if (em === "") err.email = "Email is required";
    else if (!emailRegex.test(em)) err.email = "Enter a valid email";

    // Password (strong)
    const pw = register.password;
    if (pw.trim() === "") err.password = "Password is required";
    else if (!strongPassRegex.test(pw))
      err.password = "Password does not meet the required complexity.";

    // Role
    if (!register.role) err.role = "Please Select Role";

    setRegError(err);
    return Object.keys(err).length === 0;
  };

  const ValidateForm = () => {
    const err = {};
    if (login.username.trim() === "") err.username = "Username is required";

    if (login.password.trim() === "") err.password = "Password is required";

    setLoginError(err);
    return Object.keys(err).length === 0;
  };

  // --- Helper to map 400 errors to field-specific messages (username/email) ---
  // (ADDED - does not change existing flow or variables)
  function applyUniquenessErrorsFromResponse(err) {
    // Only handle HTTP 400 here; ignore others.
    const status = err?.response?.status;
    if (status !== 400) return false;

    // Normalize possible payloads from backend
    const data = err?.response?.data;
    const msg = (data?.message || "").toString().toLowerCase();

    const fieldErrs = {};

    // Case 1: Single 'message' string from backend
    if (msg.includes("username")) {
      fieldErrs.username = "username already exist";
    }
    if (msg.includes("email")) {
      fieldErrs.email = "email already exist";
    }

    // Case 2: Backend sends an errors object { username: "...", email: "..." }
    const errorsObj =
      data?.errors && typeof data.errors === "object" ? data.errors : null;
    if (errorsObj) {
      const u = (errorsObj.username || "").toString().toLowerCase();
      const e = (errorsObj.email || "").toString().toLowerCase();

      if (!fieldErrs.username && u.includes("exist")) {
        fieldErrs.username = "username already exist";
      } else if (!fieldErrs.username && u) {
        // prefer backend text if provided
        fieldErrs.username = errorsObj.username;
      }

      if (!fieldErrs.email && e.includes("exist")) {
        fieldErrs.email = "email already exist";
      } else if (!fieldErrs.email && e) {
        // prefer backend text if provided
        fieldErrs.email = errorsObj.email;
      }
    }

    // Case 3: Array of messages, e.g., ["username already exist", "email already exist"]
    const arr = Array.isArray(data)
      ? data
      : Array.isArray(data?.messages)
      ? data.messages
      : null;
    if (arr) {
      const lower = arr.map((x) => x.toString().toLowerCase());
      if (!fieldErrs.username && lower.some((t) => t.includes("username"))) {
        fieldErrs.username = "username already exist";
      }
      if (!fieldErrs.email && lower.some((t) => t.includes("email"))) {
        fieldErrs.email = "email already exist";
      }
    }

    // Apply to the existing regError bag if anything detected
    if (Object.keys(fieldErrs).length > 0) {
      setRegError((prev) => ({ ...prev, ...fieldErrs }));
      return true; // handled
    }

    return false; // nothing matched
  }

  // ---- Submit handlers ----
  const handleSubmitForRegister = async (e) => {
    e.preventDefault();
    if (!ValidateRegister()) return;
    try {
      const payload = {
        ...register,
        role: register.role ? register.role.trim().toUpperCase() : "",
      };
      await api.post(`/user/register`, payload);
      setMessage("User registration successful");
      setRegError({});
      const l = {
        username: register.username,
        password: register.password,
      };
      const { data } = await api.post(`/user/login`, l);
      const { token, role, username } = data || {};
      if (!token) throw new Error("No token returned from server");
      auth.login({ token, role, username });
      setMessage("Login successful");
      setTimeout(() => {
        setRegister({
          firstName: "",
          lastName: "",
          username: "",
          email: "",
          password: "",
          role: "",
        });
        setMessage("");
        const next = qs.get("next") || "/home";
        navigate(next, { replace: true });
        setIsLoginPanel(true);
      }, 1200);
    } catch (err) {
      console.error(err);

      // NEW: Map backend 400 errors to username/email field messages
      const handled = applyUniquenessErrorsFromResponse(err);
      if (handled) {
        setMessage("Registration failed");
        return;
      }

      // Fallback for non-400 or unknown shapes
      setMessage("Registration failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ValidateForm()) return;
    try {
      const { data } = await api.post(`/user/login`, login);
      const { token, role, username } = data || {};
      if (!token) throw new Error("No token returned from server");
      auth.login({ token, role, username });
      setMessage("Login successful");
      setLoginMessage("Login successful"); // keep your loginMessage path alive
      const next = qs.get("next") || "/home";
      navigate(next, { replace: true });
    } catch (err) {
      console.error(err);
      setLoginMessage("Login failed");
    }
  };


  return (
    <div className="auth-shell d-flex align-items-center justify-content-center min-vh-100">
      {/* Background layer */}
      <div
        className="bg-layer"
        key={bgIndex}
        style={{ backgroundImage: `url(${bgImages[bgIndex]})` }}
        aria-hidden="true"
      />

      <div
        style={{ height: "1100px" }}
        className={`auth-card shadow-lg rounded-4 overflow-hidden ${
          isLoginPanel ? "" : "right-panel-active"
        }`}
      >
        {isLoginPanel ? (
          // ----------------------- LOGIN PANEL -----------------------
          <div
            className="form-container sign-in-container p-4 p-md-5"
            style={{
              width: "50%",
              marginLeft: "2px",
              height: "1260px",
              marginTop: "-160px",
            }}
          >
            <div className="w-100" style={{ maxWidth: 420 }}>
              <div className="text-center mb-3">
                <h1 className="fw-bold mb-1" style={{ color: "black" }}>
                  Login
                </h1>
                <p className="text-muted m-0">
                  Welcome back! Please enter your details.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label fw-semibold">
                    Username
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      loginError.username ? "is-invalid" : ""
                    }`}
                    id="username"
                    name="username"
                    value={login.username}
                    onChange={handleChange}
                    placeholder="Enter username"
                  />
                  {loginError.username && (
                    <div className="invalid-feedback">
                      {loginError.username}
                    </div>
                  )}
                </div>

                <div className="mb-2">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Password
                  </label>

                  {/* --- input-group with eye toggle (Login) --- */}
                  <div className="input-group">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      className={`form-control ${
                        loginError.password ? "is-invalid" : ""
                      }`}
                      id="password"
                      name="password"
                      value={login.password}
                      onChange={handleChange}
                      placeholder="Enter password"
                      aria-describedby="toggleLoginPassword"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary password-toggle-btn"
                      id="toggleLoginPassword"
                      aria-label={
                        showLoginPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowLoginPassword((v) => !v)}
                      tabIndex={0}
                    >
                      {/* When hidden → Open Eye; when visible → Eye Slash */}
                      {showLoginPassword ? (
                        // Open Eye (hidden -> click to show)
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                        >
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8ZM8 12.5c-3.5 0-6-3.5-6-4.5s2.5-4.5 6-4.5 6 3.5 6 4.5-2.5 4.5-6 4.5Z" />
                          <path d="M8 5.5A2.5 2.5 0 1 0 8 10a2.5 2.5 0 0 0 0-4.5Z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                        >
                          <path d="M13.359 11.238 11.7 9.58A5 5 0 0 0 8 3a5 5 0 0 0-3.04 1.04L3.354 2.435a.75.75 0 1 0-1.06 1.06l11.313 11.314a.75.75 0 0 0 1.06-1.06l-1.308-1.51Z" />
                          <path d="M10.607 8.486a2.5 2.5 0 0 1-2.12 2.12L6.2 8.318a2.5 2.5 0 0 1 4.407.168Z" />
                          <path d="M15.833 8.445a.75.75 0 0 0 .004-.89C14.6 5.91 11.66 3 8 3c-.77 0-1.5.11-2.176.31l1.3 1.3A6.5 6.5 0 0 1 8 4.5c3.05 0 5.54 2.25 6.68 3.99-.33.48-.84 1.1-1.52 1.74l1.673 1.673c.48-.43.92-.92 1.28-1.46.17-.26.27-.58.27-.9Z" />
                          <path d="M1.32 2.027 2.99 3.7C1.88 4.77 1.08 5.78.52 6.49a1.2 1.2 0 0 0 .003 1.43C1.4 8.87 4.34 11.78 8 11.78c.79 0 1.54-.12 2.25-.33l1.36 1.36A9.2 9.2 0 0 1 8 13.28c-3.66 0-6.6-2.92-7.48-4.36a2.7 2.7 0 0 1-.006-3.17c.58-.8 1.52-1.93 2.81-2.72Z" />
                        </svg>
                      )}
                    </button>
                    {loginError.password && (
                      <div className="invalid-feedback d-block">
                        {loginError.password}
                      </div>
                    )}
                  </div>
                  {/* --- END input-group --- */}
                </div>

                <div className="d-grid mt-4">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Login
                  </button>
                </div>

                {loginMessage && (
                  <div className="alert alert-info mt-3 mb-0" role="alert">
                    {loginMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        ) : (
          // ----------------------- REGISTER PANEL -----------------------
          <div
            className="form-container sign-up-container p-4 p-md-5"
            style={{
              width: "50%",
              marginLeft: "2px",
              height: "1236px",
              marginTop: "-140px",
            }}
          >
            <div className="w-100" style={{ maxWidth: 520 }}>
              <div className="text-center mb-3">
                <h1 className="fw-bold mb-1" style={{ color: "black" }}>
                  Create Account
                </h1>
                <p className="text-muted m-0">
                  Enter your personal details and start your journey with us
                </p>
              </div>

              <form onSubmit={handleSubmitForRegister} noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="firstName" className="form-label fw-semibold">
                      First Name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        regError.firstName ? "is-invalid" : ""
                      }`}
                      id="firstName"
                      name="firstName"
                      value={register.firstName}
                      onChange={handleChangeForRegister}
                      placeholder="John"
                    />
                    {regError.firstName && (
                      <div className="invalid-feedback">
                        {regError.firstName}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="lastName" className="form-label fw-semibold">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        regError.lastName ? "is-invalid" : ""
                      }`}
                      id="lastName"
                      name="lastName"
                      value={register.lastName}
                      onChange={handleChangeForRegister}
                      placeholder="Doe"
                    />
                    {regError.lastName && (
                      <div className="invalid-feedback">
                        {regError.lastName}
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label htmlFor="regUsername" className="form-label fw-semibold">
                      Username
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        regError.username ? "is-invalid" : ""
                      }`}
                      id="regUsername"
                      name="username"
                      value={register.username}
                      onChange={handleChangeForRegister}
                      placeholder="johndoe"
                    />
                    {regError.username && (
                      <div className="invalid-feedback">
                        {regError.username}
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`form-control ${
                        regError.email ? "is-invalid" : ""
                      }`}
                      id="email"
                      name="email"
                      value={register.email}
                      onChange={handleChangeForRegister}
                      placeholder="john@example.com"
                    />
                    {regError.email && (
                      <div className="invalid-feedback">{regError.email}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <label htmlFor="regPassword" className="form-label fw-semibold">
                      Password
                    </label>

                    {/* --- input-group with eye toggle (Register) --- */}
                    <div className="input-group">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        className={`form-control ${
                          regError.password ? "is-invalid" : ""
                        }`}
                        id="regPassword"
                        name="password"
                        value={register.password}
                        onChange={handleChangeForRegister}
                        placeholder="••••••"
                        aria-describedby="toggleRegisterPassword registerPasswordHelp"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary password-toggle-btn"
                        id="toggleRegisterPassword"
                        aria-label={
                          showRegPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowRegPassword((v) => !v)}
                        tabIndex={0}
                      >
                        {showRegPassword ? (
                          // Eye Slash (visible -> click to hide)
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                          >
                            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8ZM8 12.5c-3.5 0-6-3.5-6-4.5s2.5-4.5 6-4.5 6 3.5 6 4.5-2.5 4.5-6 4.5Z" />
                            <path d="M8 5.5A2.5 2.5 0 1 0 8 10a2.5 2.5 0 0 0 0-4.5Z" />
                          </svg>
                        ) : (
                          // Open Eye (hidden -> click to show)
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                          >
                            <path d="M13.359 11.238 11.7 9.58A5 5 0 0 0 8 3a5 5 0 0 0-3.04 1.04L3.354 2.435a.75.75 0 1 0-1.06 1.06l11.313 11.314a.75.75 0 0 0 1.06-1.06l-1.308-1.51Z" />
                            <path d="M10.607 8.486a2.5 2.5 0 0 1-2.12 2.12L6.2 8.318a2.5 2.5 0 0 1 4.407.168Z" />
                            <path d="M15.833 8.445a.75.75 0 0 0 .004-.89C14.6 5.91 11.66 3 8 3c-.77 0-1.5.11-2.176.31l1.3 1.3A6.5 6.5 0 0 1 8 4.5c3.05 0 5.54 2.25 6.68 3.99-.33.48-.84 1.1-1.52 1.74l1.673 1.673c.48-.43.92-.92 1.28-1.46.17-.26.27-.58.27-.9Z" />
                            <path d="M1.32 2.027 2.99 3.7C1.88 4.77 1.08 5.78.52 6.49a1.2 1.2 0 0 0 .003 1.43C1.4 8.87 4.34 11.78 8 11.78c.79 0 1.54-.12 2.25-.33l1.36 1.36A9.2 9.2 0 0 1 8 13.28c-3.66 0-6.6-2.92-7.48-4.36a2.7 2.7 0 0 1-.006-3.17c.58-.8 1.52-1.93 2.81-2.72Z" />
                          </svg>
                        )}
                      </button>
                      {regError.password && (
                        <div className="invalid-feedback d-block">
                          {regError.password}
                          <ul
                            id="registerPasswordHelp"
                            className="password-hints mt-2"
                            style={{ color: "red" }}
                          >
                            <li
                              className={regPwChecks.hasUpper ? "passed" : "failed"}
                            >
                              At least 1 uppercase letter (A–Z)
                            </li>
                            <li
                              className={regPwChecks.hasLower ? "passed" : "failed"}
                            >
                              At least 1 lowercase letter (a–z)
                            </li>
                            <li
                              className={
                                regPwChecks.hasSpecial ? "passed" : "failed"
                              }
                            >
                              At least 1 special character (! @ $ % ^ &amp; *)
                            </li>
                            <li
                              className={regPwChecks.minLen ? "passed" : "failed"}
                            >
                              Minimum 10 characters
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-12">
                    <label htmlFor="role" className="form-label fw-semibold">
                      Role
                    </label>
                    <select
                      name="role"
                      id="role"
                      value={register.role}
                      className={`form-control ${
                        regError.role ? "is-invalid" : ""
                      }`}
                      onChange={handleChangeForRegister}
                    >
                      <option value="">Select Role</option>
                      <option value="GUIDE">Guide</option>
                      <option value="USER">User</option>
                    </select>
                    {regError.role && (
                      <div className="invalid-feedback">{regError.role}</div>
                    )}
                  </div>
                </div>

                <div className="d-grid mt-4">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Sign Up
                  </button>
                </div>

                {message && (
                  <div className="alert alert-warning mt-3 mb-0" role="alert">
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            {isLoginPanel ? (
              <div className="overlay-panel overlay-right text-center text-lg-start">
                <h1 className="fw-bold text-white mb-2">Hello, Friend!</h1>
                <p className="text-white-50">
                  Enter your personal details and start your journey with us
                </p>
                <button
                  className="btn btn-outline-light mt-2 px-4"
                  onClick={() => setIsLoginPanel(false)}
                >
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="overlay-panel overlay-left text-center text-lg-start">
                <h1 className="fw-bold text-white mb-2">Welcome Back!</h1>
                <p className="text-white-50">
                  To keep connected with us please login with your personal info
                </p>
                <button
                  className="btn btn-outline-light mt-2 px-4"
                  onClick={() => setIsLoginPanel(true)}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
