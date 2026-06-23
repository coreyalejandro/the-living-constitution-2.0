/**
 * Evidence — chronological timeline of governance evidence events.
 * Reads events.json (exported by scripts/export-web-data.mjs).
 * Filter bar: filter by event type. Keyboard: f = focus filter.
 * T21 — Phase 5
 */
import React, { useState, useEffect, useRef } from 'react';
import EvidenceItem from '../components/EvidenceItem.jsx';

export default function Evidence() {
  const [events,     setEvents]   = useState([]);
  const [loading,    setLoading]  = useState(true);
  const [error,      setError]    = useState(null);
  const [filter,     setFilter]   = useState('');
  const filterRef = useRef(null);

  // Load events.json from public/data/
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('./data/events.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status} — could not load events.json`);
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        // Accept array or { events: [] }
        const arr = Array.isArray(data) ? data : (data.events || []);
        setEvents(arr);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Keyboard: press 'f' to focus filter input
  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'f') {
        e.preventDefault();
        filterRef.current && filterRef.current.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Derive unique event types for the filter label hint
  const allTypes = Array.from(new Set(events.map(e => e.event_type || 'unknown'))).sort();

  // Filtered list
  const filtered = filter
    ? events.filter(e =>
        (e.event_type || '').toLowerCase().includes(filter.toLowerCase()) ||
        (e.module_id  || '').toLowerCase().includes(filter.toLowerCase()) ||
        (e.message    || '').toLowerCase().includes(filter.toLowerCase())
      )
    : events;

  // Loading state
  if (loading) {
    return (
      <div style={styles.root} role="status" aria-live="polite">
        <h1 style={styles.heading}>Evidence</h1>
        <p style={styles.loadMsg}>Loading evidence events…</p>
        <p style={styles.hint}>
          If this persists, run <code style={styles.code}>npm run tlc:export-data</code> first.
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={styles.root} role="alert">
        <h1 style={styles.heading}>Evidence</h1>
        <div style={styles.errorBox}>
          <p style={styles.errorTitle}>Could not load evidence events</p>
          <p style={styles.errorMsg}>{error}</p>
          <p style={styles.hint}>
            Run <code style={styles.code}>npm run tlc:export-data</code> to generate{' '}
            <code style={styles.code}>src/ui/public/data/events.json</code>, then refresh.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <h1 style={styles.heading}>Evidence</h1>

      {/* Filter bar */}
      <div style={styles.filterRow}>
        <label htmlFor="evidence-filter" style={styles.filterLabel}>
          Filter
          <span style={styles.filterHint} aria-hidden="true"> (press <kbd style={styles.kbd}>f</kbd>)</span>
        </label>
        <input
          id="evidence-filter"
          ref={filterRef}
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="event type, module ID, or message…"
          style={styles.filterInput}
          aria-label="Filter evidence events by event type, module ID, or message"
        />
        {filter && (
          <button
            onClick={() => setFilter('')}
            style={styles.clearBtn}
            aria-label="Clear filter"
          >
            Clear
          </button>
        )}
        <span style={styles.countLabel}>
          {filtered.length} of {events.length} events
        </span>
      </div>

      {/* Event type legend */}
      {allTypes.length > 0 && (
        <div style={styles.legend} aria-label="Event type legend">
          <span style={styles.legendLabel}>Types:</span>
          {allTypes.slice(0, 8).map(t => (
            <button
              key={t}
              onClick={() => setFilter(filter === t ? '' : t)}
              style={{
                ...styles.legendPill,
                ...(filter === t ? styles.legendPillActive : {}),
              }}
              aria-pressed={filter === t}
              aria-label={`Filter by event type: ${t}`}
            >
              {t}
            </button>
          ))}
          {allTypes.length > 8 && (
            <span style={styles.legendMore}>+{allTypes.length - 8} more</span>
          )}
        </div>
      )}

      {/* Empty state */}
      {events.length === 0 && (
        <div style={styles.emptyBox} role="status">
          <p style={styles.emptyTitle}>No evidence events found</p>
          <p style={styles.hint}>
            Governance events will appear here once sessions are opened and
            evidence files are captured. Run{' '}
            <code style={styles.code}>npm run tlc:export-data</code> to refresh.
          </p>
        </div>
      )}

      {/* Filtered empty state */}
      {events.length > 0 && filtered.length === 0 && (
        <div style={styles.emptyBox} role="status">
          <p style={styles.emptyTitle}>No events match &ldquo;{filter}&rdquo;</p>
          <button onClick={() => setFilter('')} style={styles.clearBtn}>
            Clear filter
          </button>
        </div>
      )}

      {/* Event timeline */}
      {filtered.length > 0 && (
        <ul
          style={styles.list}
          aria-label={`Evidence events — ${filtered.length} shown`}
          aria-live="polite"
          aria-atomic="false"
        >
          {filtered.map((ev, i) => (
            <EvidenceItem key={`${ev.timestamp || i}-${i}`} event={ev} />
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  root: { padding: '28px 36px', maxWidth: 880 },
  heading: { color: '#f5c518', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },

  // Loading / error
  loadMsg: { color: '#888', fontSize: 15, marginBottom: 8 },
  errorBox: {
    background: '#1e0a0a', border: '1px solid #f44336', borderRadius: 6,
    padding: '18px 24px', marginBottom: 20,
  },
  errorTitle: { color: '#f44336', fontWeight: 700, marginBottom: 6 },
  errorMsg:   { color: '#cc7777', fontSize: 13, marginBottom: 10 },

  // Filter row
  filterRow: {
    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap',
  },
  filterLabel: { color: '#888', fontSize: 12, whiteSpace: 'nowrap' },
  filterHint:  { color: '#555', fontSize: 11 },
  filterInput: {
    background: '#111', border: '1px solid #333', borderRadius: 4,
    color: '#e8e0c8', padding: '6px 12px', fontSize: 13, fontFamily: 'inherit',
    flex: '1 1 240px', minWidth: 160, outline: 'none',
  },
  clearBtn: {
    background: 'transparent', border: '1px solid #444', borderRadius: 4,
    color: '#888', padding: '5px 12px', fontSize: 12, cursor: 'pointer',
    fontFamily: 'inherit', whiteSpace: 'nowrap',
  },
  countLabel: { color: '#555', fontSize: 11, whiteSpace: 'nowrap' },
  kbd: {
    background: '#222', border: '1px solid #444', borderRadius: 3,
    padding: '1px 4px', fontSize: 10, color: '#888', fontFamily: 'inherit',
  },

  // Legend
  legend: {
    display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 16,
  },
  legendLabel: { color: '#555', fontSize: 11 },
  legendPill: {
    background: 'transparent', border: '1px solid #333', borderRadius: 12,
    color: '#666', padding: '2px 10px', fontSize: 11, cursor: 'pointer',
    fontFamily: 'inherit',
  },
  legendPillActive: { borderColor: '#f5c518', color: '#f5c518', background: '#1a1a00' },
  legendMore: { color: '#444', fontSize: 11 },

  // Empty state
  emptyBox: {
    background: '#111', border: '1px solid #222', borderRadius: 6,
    padding: '24px 28px', marginTop: 8,
  },
  emptyTitle: { color: '#888', fontSize: 14, marginBottom: 10 },

  // Timeline list
  list: {
    background: '#111', border: '1px solid #1e1e1e', borderRadius: 6,
    padding: 0, margin: '0',
    overflow: 'hidden',
  },

  // Shared
  hint: { color: '#555', fontSize: 12, lineHeight: 1.6 },
  code: {
    background: '#222', padding: '1px 5px', borderRadius: 3,
    color: '#90caf9', fontSize: 11,
  },
};
