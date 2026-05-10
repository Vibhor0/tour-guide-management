const BASE_KEY = 'tt.favorites.v1';

export const getCurrentUsername = () => {
  const raw = (localStorage.getItem('username') || '').trim();
  return raw ? raw.toLowerCase() : '__anon__';
};

export const getFavStorageKey = (username = getCurrentUsername()) =>
  `${BASE_KEY}:${username}`;

const LEGACY_KEY = BASE_KEY;

const read = () => {
  try { return JSON.parse(localStorage.getItem(getFavStorageKey()) || '{}'); }
  catch { return {}; }
};

const write = (map) => {
  const key = getFavStorageKey();
  localStorage.setItem(key, JSON.stringify(map));
  // notify same-tab listeners
  window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { key } }));
};

const migrateIfNeeded = () => {
  try {
    const userKey = getFavStorageKey();
    const hasUser = !!localStorage.getItem(userKey);
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (!hasUser && legacyRaw) {
      // Copy legacy into user's bucket, keep legacy to avoid breaking other envs
      localStorage.setItem(userKey, legacyRaw);
      window.dispatchEvent(new CustomEvent('favorites:changed', { detail: { key: userKey } }));
    }
  } catch {  }
};

migrateIfNeeded();

export const getFavMap = () => read();
export const getFavIds = () => Object.keys(read());
export const isFav = (id) => Boolean(read()[String(id)]);

export const addFav = (id) => {
  const m = read();
  m[String(id)] = new Date().toISOString();
  write(m);
};

export const removeFav = (id) => {
  const m = read();
  delete m[String(id)];
  write(m);
};

export const toggleFav = (id) => (isFav(id) ? removeFav(id) : addFav(id));

export const pruneFavorites = (validIds) => {
  const m = read();
  let changed = false;
  for (const k of Object.keys(m)) {
    if (!validIds.has(k)) { delete m[k]; changed = true; }
  }
  if (changed) write(m);
  return changed;
};