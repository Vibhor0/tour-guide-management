const TOKEN_KEY = "token";
const ROLE_KEY  = "role";
const USERNAME_KEY = "username"

export const setAuthStorage = ({ token, role, username }) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (role)  localStorage.setItem(ROLE_KEY, role);
  if (username) localStorage.setItem(USERNAME_KEY, String(username)); 
};

export const clearAuthStorage = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USERNAME_KEY);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY) || null;
export const getRole  = () => localStorage.getItem(ROLE_KEY) || null;
export const getUsername = () => localStorage.getItem(USERNAME_KEY) || null;

export const decodeJwt = (token) => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const getExpiryMs = (token) => {
  const payload = decodeJwt(token);
  if (!payload?.exp) return null;        
  return payload.exp * 1000;          
};

export const msUntilExpiry = (token) => {
  const expMs = getExpiryMs(token);
  if (!expMs) return null;
  return expMs - Date.now();
};

export const isExpired = (token) => {
  const left = msUntilExpiry(token);
  return left !== null ? left <= 0 : false;
};

export const willExpireIn = (token, ms = 60000) => {
  const left = msUntilExpiry(token);
  return left !== null ? left <= ms : false;
};