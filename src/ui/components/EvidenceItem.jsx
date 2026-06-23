/**
 * EvidenceItem — single row in the Evidence timeline.
 * Shows: event type badge (color-coded), module ID, message, timestamp.
 * T22 — Phase 5
 */
import React from 'react';

/** Map event_type → highlight color. Uses keyword matching for resilience. */
function getEventColor(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('error') || t.includes('halt') || t.includes('block') || t.includes('quarantine')) {
    return '#f44336'; // red — failure / halt
  }
  if (
    t.includes('done') || t.includes('start') || t.includes('open') ||
    t.includes('pass') || t.includes('verified') || t.includes('complete')
  ) {
    return '#4caf50'; // green — success / progress
  }
  if (t.includes('check') || t.includes('vnt') || t.includes('warn') || t.includes('partial')) {
    return '#f5c518'; // yellow — check / partial
  }
  return '#666'; // gray — unknown / neutral
}

/** Format ISO timestamp to human-readable local string. */
function formatTs(ts) {
  if (!ts) return '—';
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  } catch {
    return String(ts);
  }
}

export default function EvidenceItem({ event }) {
  const color = getEventColor(event.event_type);

  return (
    <li
      style={styles.item}
      aria-label={`${event.event_type || 'unknown'} event for ${event.module_id || 'unknown module'} at ${formatTs(event.timestamp)}`}
    >
      {/* Event type badge */}
      <span
        style={{ ...styles.typeBadge, color, borderColor: color }}
        aria-label={`Event type: ${event.event_type || 'unknown'}`}
      >
        {event.event_type || 'unknown'}
      </span>

      {/* Main content: module + message */}
      <div style={styles.content}>
        <span style={styles.module}>{event.module_id || '—'}</span>
        <span style={styles.message}>{event.message}</span>
        {event.decision && (
          <span style={styles.decision}>Decision: {event.decision}</span>
        )}
      </div>

      {/* Timestamp — right-aligned */}
      <span
        style={styles.timestamp}
        aria-label={`Timestamp: ${formatTs(event.timestamp)}`}
      >
        {formatTs(event.timestamp)}
      </span>
    </li>
  );
}

const styles = {
  item: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '14px 20px',
    borderBottom: '1px solid #1a1a1a',
    listStyle: 'none',
  },
  typeBadge: {
    flexShrink: 0,
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    border: '1px solid',
    borderRadius: 3,
    padding: '2px 7px',
    minWidth: 90,
    textAlign: 'center',
    fontFamily: 'inherit',
    marginTop: 2,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  module: {
    color: '#e8e0c8',
    fontSize: 12,
    fontWeight: 600,
  },
  message: {
    color: '#888',
    fontSize: 12,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  decision: {
    color: '#666',
    fontSize: 11,
    fontStyle: 'italic',
  },
  timestamp: {
    flexShrink: 0,
    color: '#555',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 3,
    whiteSpace: 'nowrap',
  },
};
