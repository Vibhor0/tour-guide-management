import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  setAuthStorage,
  clearAuthStorage,
  getToken,
  getRole,
  getUsername,     // <-- NEW
  msUntilExpiry,
  isExpired,
} from "./token";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getToken());
  const [role, setRole] = useState(() => getRole());
  const [username, setUsername] = useState(() => getUsername());
  const timerRef = useRef(null);

  const logout = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setRole(null);
    setUsername(null); 
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
  }, []);

  const scheduleLogout = useCallback(
    (tkn) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (!tkn) return;

      const leftMs = msUntilExpiry(tkn);
      if (leftMs === null) return;    // token without exp — skip auto logout
      if (leftMs <= 0) return logout();

      timerRef.current = setTimeout(() => {
        logout();
      }, leftMs);
    },
    [logout]
  );

  // Accept username from backend and persist it
  const login = useCallback(
    ({ token: tkn, role: rl, username: un }) => {
      setAuthStorage({ token: tkn, role: rl, username: un }); // <-- NEW
      setToken(tkn);
      setRole(rl);
      setUsername(un); // <-- NEW
      scheduleLogout(tkn);
    },
    [scheduleLogout]
  );

  useEffect(() => {
    const t = getToken();
    if (t && isExpired(t)) {
      logout();
    } else if (t) {
      scheduleLogout(t);
    }
  }, [logout, scheduleLogout]);

  useEffect(() => {
    const onVis = () => {
      const t = getToken();
      if (t && isExpired(t)) logout();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", onVis);
    };
  }, [logout]);

  // Keep tabs/windows in sync, now including username
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "token" || e.key === "role" || e.key === "username") { // <-- NEW
        const t = getToken();
        const r = getRole();
        const u = getUsername(); // <-- NEW
        setToken(t);
        setRole(r);
        setUsername(u); // <-- NEW
        if (!t) {
          if (timerRef.current) clearTimeout(timerRef.current);
          if (window.location.pathname !== "/login") {
            window.location.replace("/login");
          }
        } else {
          scheduleLogout(t);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [scheduleLogout]);

  const value = useMemo(
    () => ({
      token,
      role,
      username,                 // <-- NEW
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, role, username, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
