import React, { useEffect } from 'react';

export default function Modal({ open, title, children, onClose }) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="vp-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vp-modal-title"
      onClick={onClose}
    >
      <div
        className="vp-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="vp-modal-header">
          <h5 id="vp-modal-title" className="m-0">{title}</h5>
          <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
        </div>
        <div className="vp-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
