/**
 * ConfirmModal — neurodivergent-safe confirmation dialog.
 * States the action and its consequence explicitly. NO is the default.
 * Keyboard: Enter = NO (safe default), Y or click YES to confirm.
 */
import React, { useEffect, useRef } from 'react';

export default function ConfirmModal({ isOpen, action, consequence, onConfirm, onCancel }) {
  const noRef = useRef(null);

  useEffect(() => {
    if (isOpen) noRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = e => {
      if (e.key === 'Escape' || e.key === 'Enter') onCancel();
      if (e.key === 'y' || e.key === 'Y') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-action">
      <div style={styles.box}>
        <p style={styles.actionLabel} id="confirm-action">Action</p>
        <p style={styles.action}>{action}</p>
        {consequence && (
          <>
            <p style={styles.consequenceLabel}>What will happen</p>
            <p style={styles.consequence}>{consequence}</p>
          </>
        )}
        <div style={styles.buttons}>
          <button
            ref={noRef}
            onClick={onCancel}
            style={{ ...styles.btn, ...styles.btnNo }}
            aria-label="Cancel — keyboard shortcut: Enter or Escape"
          >
            No (Enter/Esc)
          </button>
          <button
            onClick={onConfirm}
            style={{ ...styles.btn, ...styles.btnYes }}
            aria-label="Confirm — keyboard shortcut: Y"
          >
            Yes (Y)
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  box: {
    background: '#161616', border: '1px solid #f5c518', borderRadius: 8,
    padding: '28px 32px', maxWidth: 420, width: '90%',
  },
  actionLabel: { color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 },
  action: { color: '#e8e0c8', fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  consequenceLabel: { color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 },
  consequence: { color: '#f5c518', fontSize: 13, marginBottom: 24, lineHeight: 1.5 },
  buttons: { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  btn: { padding: '8px 20px', borderRadius: 4, fontSize: 13, cursor: 'pointer', border: 'none', fontFamily: 'inherit', fontWeight: 600 },
  btnNo: { background: '#222', color: '#e8e0c8' },
  btnYes: { background: '#f44336', color: '#fff' },
};
