/**
 * Dashboard — first screen. Status at a glance.
 * One primary action visible. No cognitive overload.
 */
import React from 'react';
import { useRegistry } from '../lib/useRegistry.js';
import { useSession } from '../lib/useSession.js';
import StatusRing from '../components/StatusRing.jsx';
import SessionCard from '../components/SessionCard.jsx';

export default function Dashboard() {
  const { modules, loading: regLoading, error, counts } = useRegistry();
  const { session, loading: sesLoading } = useSession();

  if (regLoading || sesLoading) {
    return (
      <div style={styles.loading} aria-live="polite">
        <p>Loading governance data…</p>
        <p style={{ color: '#555', fontSize: 12, marginTop: 8 }}>
          If this persists, run <code style={styles.code}>npm run tlc:export-data</code>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error} role="alert">
        <p style={{ color: '#f44336', marginBottom: 8 }}>Could not load registry: {error}</p>
        <p style={{ color: '#888', fontSize: 12 }}>
          Run <code style={styles.code}>npm run tlc:export-data</code> to generate web data.
        </p>
      </div>
    );
  }

  const working    = modules.filter(m => m.truth_status === 'working').length;
  const quarantined = modules.filter(m => m.truth_status === 'quarantined').length;

  return (
    <div style={styles.root}>
      <h1 style={styles.heading}>TLC Workbench</h1>
      <p style={styles.sub}>Governed research cockpit — {modules.length} modules</p>

      <div style={styles.grid}>
        {/* Status ring */}
        <section aria-labelledby="status-heading" style={styles.section}>
          <h2 id="status-heading" style={styles.sectionTitle}>Module Health</h2>
          <StatusRing counts={counts} size={140} />
        </section>

        {/* Session */}
        <section aria-labelledby="session-heading" style={styles.section}>
          <h2 id="session-heading" style={styles.sectionTitle}>Work Session</h2>
          <SessionCard session={session} />
        </section>

        {/* Quick stats */}
        <section aria-labelledby="stats-heading" style={styles.section}>
          <h2 id="stats-heading" style={styles.sectionTitle}>At a Glance</h2>
          <ul style={styles.statList}>
            <li style={styles.statItem}>
              <span style={{ color: '#4caf50' }}>●</span>
              <span style={styles.statLabel}>Working</span>
              <span style={styles.statVal}>{working}</span>
            </li>
            <li style={styles.statItem}>
              <span style={{ color: '#f44336' }}>●</span>
              <span style={styles.statLabel}>Quarantined</span>
              <span style={styles.statVal}>{quarantined}</span>
            </li>
            <li style={styles.statItem}>
              <span style={{ color: '#888' }}>●</span>
              <span style={styles.statLabel}>Total</span>
              <span style={styles.statVal}>{modules.length}</span>
            </li>
          </ul>
          <p style={styles.hint}>
            Navigate with keyboard: press <kbd style={styles.kbd}>1</kbd>–<kbd style={styles.kbd}>4</kbd> to switch views.
          </p>
        </section>
      </div>
    </div>
  );
}

const styles = {
  root: { padding: '32px 40px', maxWidth: 1100 },
  heading: { color: '#f5c518', fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
  sub: { color: '#555', fontSize: 14, marginBottom: 32 },
  grid: { display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' },
  section: { minWidth: 240 },
  sectionTitle: { color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 },
  statList: { listStyle: 'none', padding: 0 },
  statItem: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
  statLabel: { color: '#e8e0c8', fontSize: 13, flex: 1 },
  statVal: { color: '#f5c518', fontSize: 15, fontWeight: 'bold' },
  hint: { color: '#555', fontSize: 11, marginTop: 20, lineHeight: 1.6 },
  kbd: { background: '#222', border: '1px solid #444', borderRadius: 3, padding: '1px 5px', fontSize: 11, color: '#90caf9' },
  code: { background: '#222', padding: '1px 5px', borderRadius: 3, color: '#90caf9', fontSize: 12 },
  loading: { padding: 40, color: '#888' },
  error: { padding: 40 },
};
