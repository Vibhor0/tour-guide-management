import React, { useEffect, useRef } from "react";

/**
 * ConfirmDeleteModal
 * - Accessible, keyboard-friendly (ESC, focus trap, Tab wrap)
 * - Click outside to close
 * - Reuses your existing "vp-modal" styles from ViewPlace.css
 */
export default function ConfirmDeleteModal({
  open,
  name = "",
  loading = false,
  onConfirm,
  onCancel,
  title = "Delete this place?",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}) {
  const panelRef = useRef(null);
  const firstBtnRef = useRef(null);

  // Close on ESC; Trap Tab focus inside the modal
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape" && !loading) {
        e.preventDefault();
        onCancel?.();
      }
      if (e.key === "Tab") {
        const focusable = panelRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  // Autofocus primary (Delete) button on open
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstBtnRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  const handleBackdropMouseDown = (e) => {
    // Only close if user clicked the backdrop (not the panel)
    if (loading) return;
    if (e.target?.getAttribute("data-backdrop") === "true") {
      onCancel?.();
    }
  };

  return (
    <div
      className="vp-modal"
      data-backdrop="true"
      onMouseDown={handleBackdropMouseDown}
      aria-hidden={!open}
    >
      <div
        ref={panelRef}
        className="vp-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-del-title"
        aria-describedby="confirm-del-desc"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="vp-modal-header">
          <h3 id="confirm-del-title" className="m-0">
            {title}
          </h3>
          <button
            type="button"
            className="btn-close"
            onClick={onCancel}
            aria-label="Close"
            disabled={loading}
            style={loading ? { opacity: 0.65, cursor: "not-allowed" } : undefined}
          />
        </div>

        {/* Body */}
        <div className="vp-modal-body">
          <div id="confirm-del-desc" style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 18 }} aria-hidden="true">
              🗑️
            </div>
            <div style={{ fontWeight: 800 }}>
              {name ? `“${name}” will be permanently removed.` : "This item will be permanently removed."}
            </div>
            <div style={{ color: "var(--muted)" }}>
              This action cannot be undone. Are you sure you want to proceed?
            </div>
          </div>

          {/* Actions */}
          <div className="vp-modal-actions" style={{ marginTop: 12 }}>
            <button
              ref={firstBtnRef}
              type="button"
              className="btn btn-delete"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Deleting…" : confirmLabel}
            </button>
            <button
              type="button"
              className="btn btn-quiet"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}