/**
 * SessionCard — shows active work session.
 * Neurodivergent-first: explicit current action, next step, no ambiguity.
 */
import React from 'react';

export default function SessionCard({ session }) {
  if (!session) {
    return (
      <div style={styles.card} aria-label="No active session">
        <p style={styles.label}>Active Session</p>
        <p style={styles.empty}>No session open.</p>
        <p style={styles.hint}>Run <code style={styles.code}>tlc work [MODULE-ID]</code> to begin.</p>
      </div>
    );
  }

  return (
    <div style={{ ...styles.card, borderColor: '#f5c518' }} aria-label="Active session">
      <p style={styles.label}>Active Session</p>
      <p style={styles.module}>{session.module_id || 'UNKNOWN'}</p>
      {session.contract && (
        <p style={styles.meta}>Contract: <span style={styles.value}>{session.contract}</span></p>
      )}
      {session.started_at && (
        <p style={styles.meta}>Started: <span style={styles.value}>{session.started_at}</span></p>
      )}
      {session.next_step && (
        <div style={styles.nextBox}>
          <p style={styles.nextLabel}>Next step</p>
          <p style={styles.nextValue}>{session.next_step}</p>
        </div>
      )}
      <p style={styles.hint}>Run <code style={styles.code}>tlc done</code> when complete.</p>
    </div>
  );
}

const styles = {
  card: {
    background: '#161616',
    border: '1px solid #333',
    borderRadius: 6,
    padding: '16px 20px',
    minWidth: 280,
    maxWidth: 380,
  },
  label: { color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 },
  empty: { color: '#e8e0c8', fontSize: 14, marginBottom: 8 },
  module: { color: '#f5c518', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  meta: { color: '#888', fontSize: 12, marginBottom: 4 },
  value: { color: '#e8e0c8' },
  nextBox: { background: '#1e1e1e', borderLeft: '3px solid #4caf50', padding: '8px 12px', marginTop: 12, marginBottom: 12, borderRadius: 3 },
  nextLabel: { color: '#4caf50', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 },
  nextValue: { color: '#e8e0c8', fontSize: 13 },
  hint: { color: '#555', fontSize: 11, marginTop: 8 },
  code: { background: '#222', padding: '1px 5px', borderRadius: 3, color: '#90caf9', fontSize: 11 },
};
