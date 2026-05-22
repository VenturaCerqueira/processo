import React, { useEffect, useRef } from 'react';

function ConfirmModal({
  open,
  title,
  message,
  variant = 'default',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  inputLabel,
  inputPlaceholder,
  inputValue,
  inputType = 'text',
  requireInput = false,
  onInputChange,
  onCancel,
  onConfirm,
  loading = false,
}) {
  const cancelBtnRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const t = setTimeout(() => {
      if (requireInput && inputRef.current) inputRef.current.focus();
      else cancelBtnRef.current?.focus();
    }, 0);

    return () => clearTimeout(t);
  }, [open, requireInput]);

  if (!open) return null;

  const danger = variant === 'danger';
  const confirmStyle = danger
    ? { background: 'linear-gradient(135deg, var(--danger), #ef4444)', color: 'var(--white)' }
    : variant === 'warning'
      ? { background: 'linear-gradient(135deg, var(--warning), #f59e0b)', color: 'var(--white)' }
      : undefined;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: danger ? 'rgba(220,38,38,0.10)' : 'rgba(15,76,129,0.08)',
                border: danger ? '1px solid rgba(220,38,38,0.20)' : '1px solid rgba(15,76,129,0.18)',
                color: danger ? 'var(--danger)' : 'var(--primary)',
                fontWeight: 900,
              }}
            >
              {danger ? '!' : '✓'}
            </span>
            {title}
          </h3>
        </div>

        <div className="modal-body">
          {message && <p style={{ color: 'var(--gray-600)', fontWeight: 500, lineHeight: 1.6 }}>{message}</p>}

          {requireInput && (
            <div className="form-group" style={{ marginTop: 14 }}>
              {inputLabel && (
                <label style={{ display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 700 }}>
                  {inputLabel}
                </label>
              )}
              <input
                ref={inputRef}
                className="form-control"
                type={inputType}
                placeholder={inputPlaceholder}
                value={inputValue || ''}
                onChange={(e) => onInputChange?.(e.target.value)}
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {cancelText}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            style={confirmStyle}
            onClick={() => onConfirm?.(inputValue)}
            disabled={loading || (requireInput && (!inputValue || !String(inputValue).trim()))}
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {loading ? 'Processando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

