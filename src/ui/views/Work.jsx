/**
 * Work — session-aware operator console.
 * Shows current work session. Buttons for tlc work / tlc done.
 * All destructive actions require explicit confirmation (ConfirmModal).
 * Read-only surface — actual work session changes happen via CLI.
 */
import React, { useState } from 'react';
import { useSession } from '../lib/useSession.js';
import ConfirmModal from '../components/ConfirmModal.jsx';

export default function Work() {
  const { session, loading } = useSession();
  const [showConfirm, setShowConfirm] = useState(false);

  if (loading) return <p style={{ padding: 40, color: '#888' }}>Loading session…</p>;

  return (
    <div style={styles.root}>
      <h1 style={styles.heading}>Work</h1>

      {session ? (
        <>
          <div style={styles.activeBox}>
            <p style={styles.activeLabel}>Session open</p>
            <p style={styles.moduleId}>{session.module_id}</p>
            {session.contract && (
              <p style={styles.meta}>Contract: {session.contract}</p>
            )}
            {session.started_at && (
              <p style={styles.meta}>Started: {session.started_at}</p>
            )}
          </div>

          {session.next_step && (
            <div style={styles.nextStep}>
              <p style={styles.nextLabel}>Current next step</p>
              <p style={styles.nextVal}>{session.next_step}</p>
            </div>
          )}

          <div style={styles.actions}>
            <button
              onClick={() => setShowConfirm(true)}
              style={styles.doneBtn}
              aria-label="Mark session done — will require evidence file"
            >
              Mark Done
            </button>
            <p style={styles.hint}>
              Clicking "Mark Done" shows a confirmation before running <code style={styles.code}>tlc done</code>.
            </p>
          </div>

          <ConfirmModal
            isOpen={showConfirm}
            action={`Close session: ${session.module_id}`}
            consequence="An evidence file will be required before the session can close. This cannot be undone from the UI — run tlc done in your terminal."
            onConfirm={() => {
              setShowConfirm(false);
              // UI is read-only. Just instruct the user.
              alert(`Run in your terminal:\n\ntlc done\n\nHave your evidence file path ready.`);
            }}
            onCancel={() => setShowConfirm(false)}
          />
        </>
      ) : (
        <div style={styles.noSession}>
          <p style={styles.noSessionMsg}>No active session.</p>
          <p style={styles.hint}>
            Select a module from the registry and start a work session.
          </p>
          <div style={styles.actions}>
            <button
              onClick={() => alert('Run in your terminal:\n\ntlc work [MODULE-ID]\n\nReplace MODULE-ID with the exact ID from the Modules view.')}
              style={styles.workBtn}
              aria-label="Start a work session — shows terminal command to run"
            >
              Start Work
            </button>
            <p style={styles.hint}>
              The module ID must exist in the registry and have a bound contract.{' '}
              Run <code style={styles.code}>tlc work [MODULE-ID]</code> in your terminal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: { padding: '28px 36px', maxWidth: 680 },
  heading: { color: '#f5c518', fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  activeBox: {
    background: '#161616', border: '1px solid #f5c518', borderRadius: 6,
    padding: '18px 24px', marginBottom: 20,
  },
  activeLabel: { color: '#f5c518', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 },
  moduleId: { color: '#e8e0c8', fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  meta: { color: '#888', fontSize: 12, marginTop: 4 },
  nextStep: {
    background: '#0e1a0e', border: '1px solid #4caf50', borderRadius: 6,
    padding: '14px 20px', marginBottom: 24,
  },
  nextLabel: { color: '#4caf50', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 },
  nextVal: { color: '#e8e0c8', fontSize: 14, lineHeight: 1.5 },
  actions: { display: 'flex', flexDirection: 'column', gap: 10 },
  doneBtn: {
    background: '#1e0a0a', border: '1px solid #f44336', borderRadius: 4, color: '#f44336',
    padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    alignSelf: 'flex-start',
  },
  noSession: {},
  noSessionMsg: { color: '#888', fontSize: 16, marginBottom: 12 },
  pre: { background: '#111', border: '1px solid #333', borderRadius: 4, padding: '10px 16px', color: '#90caf9', fontSize: 13, margin: '12px 0' },
  hint: { color: '#555', fontSize: 12, lineHeight: 1.6 },
  code: { background: '#222', padding: '1px 5px', borderRadius: 3, color: '#90caf9', fontSize: 11 },
  workBtn: {
    background: '#0e1a0e', border: '1px solid #4caf50', borderRadius: 4, color: '#4caf50',
    padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    alignSelf: 'flex-start',
  },
};
