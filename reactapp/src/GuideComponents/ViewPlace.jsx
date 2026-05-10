import React, { useEffect, useMemo, useState, useRef } from 'react';
import './ViewPlace.css';
import api from '../apiConfig.js';
import { useNavigate } from 'react-router-dom';
import Modal from '../Components/Modal.jsx';
import ConfirmDeleteModal from '../Components/ConfirmDeleteModal.jsx';
import {
  getFavIds,
  isFav as isFavFn,
  toggleFav as toggleFavFn,
  getFavStorageKey
} from '../favorites.js';

function ViewPlace() {
  const [place, setPlace] = useState([]);
  const [flag, setFlag] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const navigate = useNavigate();

  // Modal + description state
  const [openModal, setOpenModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null); // { id, name, ... }
  const [descLoading, setDescLoading] = useState(false);
  const [descError, setDescError] = useState('');
  const [descData, setDescData] = useState(null); // { extract, title, thumbnail? }
  const descCacheRef = useRef(new Map());

  const role = localStorage.getItem("role");
  const isGuide = role && role.toUpperCase() === "GUIDE";
  const isUser = role && role.toUpperCase() === "USER";

  // ===== Toolbar UI state =====
  const [searchText, setSearchText] = useState(''); // what user is typing
  const [query, setQuery] = useState('');           // committed value used to filter
  const [category, setCategory] = useState('all');
  const [season, setSeason] = useState('any');
  const [sortBy, setSortBy] = useState('recent');

  // 🔁 New: delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    name: '',
  });
  const [deleting, setDeleting] = useState(false);

  const [favTick, setFavTick] = useState(0);
  useEffect(() => {
    const onFavs = () => setFavTick(t => t + 1);
    window.addEventListener('favorites:changed', onFavs);
    window.addEventListener('storage', (e) => {
      if (e.key === getFavStorageKey()) onFavs();
    });
    return () => window.removeEventListener('favorites:changed', onFavs);
  }, []);

  // ===== Debounce configuration =====
  const DEBOUNCE_MS = 300;

  // Debounce: update `query` only after user stops typing for DEBOUNCE_MS
  useEffect(() => {
    const handle = setTimeout(() => {
      setQuery(searchText.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [searchText]);

  // ===== Data fetch =====
  useEffect(() => { fetchPlaces(); }, []);
  const fetchPlaces = () => {
    api.get(`/places`)
      .then(res => setPlace(res.data ?? []))
      .catch(() => {console.log("No places found")});
  };

  const handleEdit = (id) => navigate(`/places/${id}/edit`);

  // 🔁 Replace old toast trigger with modal trigger
  const handleDelete = (id, name) => {
    setDeleteModal({ open: true, id, name: name || '' });
  };

  const fetchWikiSummary = async (name) => {
    if (!name) return null;
    const key = String(name).toLowerCase().trim();
    const cached = descCacheRef.current.get(key);
    if (cached) return cached;
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const simplified = {
        title: data.title,
        extract: data.extract || '',
        thumbnail: data.thumbnail?.source || '',
        content_urls: data.content_urls?.desktop?.page || '',
      };
      descCacheRef.current.set(key, simplified);
      return simplified;
    } catch (e) {
      return null;
    }
  };

  const openPlaceModal = async (p) => {
    setSelectedPlace(p);
    setOpenModal(true);
    setDescLoading(true);
    setDescError('');
    setDescData(null);
    const main = await fetchWikiSummary(p?.name);
    if (main && main.extract) {
      setDescData(main);
      setDescLoading(false);
      return;
    }
    const altName =
      (p?.name && p?.location) ? `${p.name} ${p.location.split(',')[0]}` : p?.name;
    if (altName && altName !== p?.name) {
      const alt = await fetchWikiSummary(altName);
      if (alt && alt.extract) {
        setDescData(alt);
        setDescLoading(false);
        return;
      }
    }
    setDescLoading(false);
    setDescError("We couldn't find a description for this place. Please enter valid Place name...");
  };

  const confirmDelete = async (id) => {
    try {
      const idNum = Number(id);
      if (!Number.isFinite(idNum)) {
        console.error("[Delete] Invalid id:", id);
        return;
      }
      const url = `/places/${idNum}`;
      console.debug("[Delete] DELETE", `${api.defaults.baseURL}${url}`);
      await api.delete(url);
      setFlag(false);
      setPendingDeleteId(null);
      fetchPlaces();
    } catch (err) {
      console.error("[Delete] failed:", err?.message, err?.response?.status, err?.response?.data);
    }
  };

  const hasData = (p) =>
    Boolean((p?.placeId ?? p?.id) && (p?.name && String(p.name).trim()) && (p?.placeImage && String(p.placeImage).trim()));

  /* ---------- Derived list: search/filter/sort ---------- */
  const months = useMemo(() => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], []);
  const normalized = (s = "") => s.toLowerCase();
  const isNowSeason = (p) => (p.bestTimeToVisit || "").includes(months[new Date().getMonth()]);

  const filtered = place
    .filter((p) => {
      const q = normalized(query);
      const hay = `${normalized(p.name || '')}`;
      const queryOk = !q || hay.includes(q);

      const categoryOk = category === "all" || normalized(p.category || '').includes(normalized(category));
      const seasonOk = season === "any" || (p.bestTimeToVisit || "").includes(season);

      return queryOk && categoryOk && seasonOk;
    })
    .sort((a, b) => {
      if (sortBy === "az") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "za") return (b.name || "").localeCompare(a.name || "");
      return 0;
    });

  /* ---------- Reveal-on-scroll ---------- */
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || targets.length === 0) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -10% 0px' });
    targets.forEach(t => io.observe(t));
    return () => io.disconnect();
  }, [filtered]);

  /* ---------- Place Card ---------- */
  const PlaceCard = ({ p }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const id = String(p.placeId ?? p.id);
    const now = isNowSeason(p);
    const isFavorite = isFavFn(id);
    useEffect(() => { }, [favTick]);

    const onCardKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPlaceModal(p);
      }
    };

    return (
      <article
        key={id}
        className="card shadow border-0 rounded-4 card-hover reveal"
        aria-labelledby={`title-${id}`}
        role="button"
        tabIndex={0}
        onClick={() => openPlaceModal(p)}
        onKeyDown={onCardKey}
      >

        {/* Image / Empty state */}
        <div className="thumb rounded-top-4 overflow-hidden position-relative">
          {p.category && <span className="badge-category">{p.category}</span>}

          {!p.placeImage || imgError ? (
            <div className="empty-cover">
              <div className="empty-icon">📷</div>
              <div className="empty-text">No image</div>
            </div>
          ) : (
            <>
              {!imgLoaded && <div className="skeleton" />}
              <img
                src={p.placeImage}
                alt={p.name ? `${p.name} photo` : 'Place image'}
                className={`w-100 h-100 cover ${imgLoaded ? 'visible' : ''}`}
                loading="lazy"
                decoding="async"
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            </>
          )}

          {isUser && (
            <button
              type="button"
              className={`btn btn-fav ${isFavorite ? 'is-fav' : ''}`}
              onClick={(e) => { e.stopPropagation(); toggleFavFn(id); }}
              aria-label={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
              title={`${isFavorite ? 'Remove from' : 'Add to'} favorites`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 21s-6.716-4.418-9.192-7.048C.63 11.662 1.162 8.4 3.516 6.86 5.34 5.644 7.83 6.02 9.2 7.7L12 10.9l2.8-3.2c1.37-1.68 3.86-2.056 5.684-.84 2.354 1.54 2.886 4.802.708 7.092C18.716 16.582 12 21 12 21z"
                  fill={isFavorite ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          )}

        </div>

        {/* Details */}
        <div className="details-bar rounded-bottom-4">
          <div className="px-3 pt-3">
            <h3 id={`title-${id}`} className="fw-bold card-title-modern mb-1">
              {p.name || '-'}
            </h3>
            <div className="small text-muted">{p.location || '—'}</div>

            <div className="chip-row mt-2">
              {p.bestTimeToVisit && (
                <span
                  className={`chip chip-season ${now ? 'now' : ''}`}
                  aria-label={`Best season ${p.bestTimeToVisit}${now ? ', currently in season' : ''}`}
                >
                  {p.bestTimeToVisit}{now ? ' • Now' : ''}
                </span>
              )}
            </div>
            <div className="spacer-cta" />
          </div>
        </div>

        {/* Actions */}
        <div className="position-absolute bottom-0 start-0 end-0 p-2 d-flex justify-content-between">

          {isGuide && (
            <>
              <button type="button" className="btn btn-edit btn-sm"
                onClick={(e) => { e.stopPropagation(); handleEdit(id); }}
                aria-label={`Edit ${p.name ?? 'place'}`}
              >
                Edit
              </button>
              {hasData(p) && (

                <button
                  type="button"
                  className="btn btn-delete btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleDelete(id, p.name); }}
                  aria-label={`Delete ${p.name ?? 'place'}`}
                >
                  Delete
                </button>

              )}
            </>
          )}

        </div>
      </article>
    );
  };

  /* ---------- Toolbar ---------- */
  const Toolbar = () => {
    // Apply immediately on Enter but prevent full-page reload
    const onSearchKeyDown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();                // prevent submit/reload
        setQuery(searchText.trim());       // apply instantly on Enter
      }
    };

    return (
      <form
        className="vp-toolbar d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3"
        role="search"
        onSubmit={(e) => e.preventDefault()}  // prevent default submit
      >
        <div className="d-flex gap-2 flex-grow-1">
          <div className="d-flex gap-2" style={{ maxWidth: 520, width: '100%' }}>
            <input
              type="search"
              className="form-control"
              placeholder="Type to search…"
              style={{ maxWidth: 340, flex: '1 1 auto' }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={onSearchKeyDown}
              aria-label="Search places"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setQuery(searchText.trim())}
              title="Apply search"
            >
              Search
            </button>
            {query && (
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => { setQuery(''); setSearchText(''); }}
                title="Clear search"
              >
                Clear
              </button>
            )}
          </div>

          <select className="form-select" style={{ maxWidth: 180 }} value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="all">All categories</option>
            <option value="city">City</option>
            <option value="beach">Beach</option>
            <option value="island">Island</option>
            <option value="mountain">Mountain</option>
            <option value="heritage">Heritage</option>
          </select>

          <select className="form-select" style={{ maxWidth: 160 }} value={season} onChange={e => setSeason(e.target.value)} aria-label="Filter by month">
            <option value="any">Any season</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          <select className="form-select" style={{ maxWidth: 160 }} value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort places">
            <option value="recent">Recent</option>
            <option value="az">Name A–Z</option>
            <option value="za">Name Z–A</option>
          </select>
        </div>

        {/* Right actions — Add/Favourites beside Home */}
        <div className="d-flex align-items-center gap-2">
          {isGuide && (
            <button
              className="btn btn-edit rounded-pill px-3 has-tip"
              type="button"
              onClick={() => navigate('/newplace')}
              aria-label="Add a new place"
              title="Add a new place"
              data-tip="Add Place"
            >
              <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" focusable="false">
                  <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z"></path>
                </svg>
                <span> Add Place</span>
              </span>
            </button>
          )}

          {isUser && (
            <button
              className="btn btn-quiet rounded-pill px-3 has-tip"
              type="button"
              onClick={() => navigate('/favorites')}
              aria-label="Go to favourites"
              title="Go to favourites"
              data-tip="Favourites"
            >
              <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" focusable="false" fill="currentColor">
                  <path
                    d="M12 21s-6.716-4.418-9.192-7.048C.63 11.662 1.162 8.4 3.516 6.86 5.34 5.644 7.83 6.02 9.2 7.7L12 10.9l2.8-3.2c1.37-1.68 3.86-2.056 5.684-.84 2.354 1.54 2.886 4.802.708 7.092C18.716 16.582 12 21 12 21z"
                  />
                </svg>
                <span> Favourites</span>
              </span>
            </button>
          )}

          <button
            className="btn btn-pink rounded-pill px-3 has-tip"
            type="button"
            onClick={() => navigate('/')}
            aria-label="Go to home"
            title="Go to home"
            data-tip="Home"
          >
            <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" focusable="false" fill="currentColor">
                <path d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z" />
              </svg>
              <span> Home</span>
            </span>
          </button>
        </div>
      </form>
    );
  };

  return (
    <>
      <div className="bg-hero">
        <div className="container-xxl py-3">
          <div className="hero-title-wrap">
            <h2 className="hero-title display-7"><i>Discover the World</i></h2>
            <p className="hero-sub">Browse handpicked destinations from Travel Tales</p>
            <div className="hero-title-underline"></div>
          </div>

          <Toolbar />

          {/* Results status for screen readers */}
          <div className="visually-hidden" aria-live="polite">
            {filtered.length} places shown
          </div>
          <div className="vp-grid mt-3" aria-label="Places grid">
            {filtered.map((p) => <PlaceCard key={p.placeId ?? p.id} p={p} />)}
          </div>
        </div>
      </div>

      {/* Existing info modal */}
      <Modal
        open={openModal}
        title={selectedPlace?.name || 'Place'}
        onClose={() => { setOpenModal(false); setSelectedPlace(null); }}
      >
        {descLoading ? (
          <div className="vp-modal-skeleton">
            <div className="sk-hero" />
            <div className="sk-line w-80" />
            <div className="sk-line w-100" />
            <div className="sk-line w-60" />
          </div>
        ) : descError ? (
          <div className="vp-modal-empty">
            <div className="emoji">🧭</div>
            <p>{descError}</p>
          </div>
        ) : (
          <div className="vp-modal-content">
            {/* Hero image (if available) */}
            {descData?.thumbnail && (
              <div className="vp-modal-hero">
                <img
                  src={descData.thumbnail}
                  alt={`${selectedPlace?.name} thumbnail`}
                  className="vp-modal-img"
                  loading="lazy"
                  decoding="async"
                />
                <div className="vp-modal-hero-overlay" />
              </div>
            )}

            <div className="vp-modal-main">
              <h3 className="vp-modal-title">{descData?.title || selectedPlace?.name}</h3>

              {/* Optional meta line — feel free to adjust or remove */}
              {selectedPlace?.location && (
                <div className="vp-modal-meta">
                  <span className="meta-chip">
                    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="currentColor" d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7m0 9.5c-1.38 0-2.5-1.13-2.5-2.5S10.62 6.5 12 6.5s2.5 1.13 2.5 2.5S13.38 11.5 12 11.5Z" />
                    </svg>
                    📍 {selectedPlace.location}
                  </span>
                  {selectedPlace?.bestTimeToVisit && (
                    <span className="meta-chip">
                      🌤️ Best: {selectedPlace.bestTimeToVisit}
                    </span>
                  )}
                </div>
              )}

              <p className="vp-modal-desc">
                {descData?.extract}
              </p>

              <div className="vp-modal-actions">
                {descData?.content_urls && (
                  <a
                    href={descData.content_urls}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-pill btn-primary-ghost"
                    aria-label="Read full article on Wikipedia"
                  >
                    Read full article
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-pill btn-quiet"
                  onClick={() => setOpenModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 🔁 New: Global Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={deleteModal.open}
        name={deleteModal.name}
        loading={deleting}
        onCancel={() => setDeleteModal({ open: false, id: null, name: '' })}
        onConfirm={async () => {
          try {
            setDeleting(true);
            await confirmDelete(deleteModal.id);
            setDeleteModal({ open: false, id: null, name: '' });
          } finally {
            setDeleting(false);
          }
        }}
      />
    </>
  );
}

export default ViewPlace;
