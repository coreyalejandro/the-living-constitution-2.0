/**
 * ModuleDetail — full module card.
 * Shows all fields from registry, invariant status, evidence files.
 * Neurodivergent-first: every field is labeled, no visual-only encoding,
 * clear "back" affordance, no modal traps.
 */
import React from 'react';
import { STATUS_COLORS, STATUS_LABEL } from '../lib/useRegistry.js';

const FIELDS = [
  ['ID',           m => m.id],
  ['Description',  m => m.description || '—'],
  ['Status',       m => STATUS_LABEL[m.truth_status] || m.truth_status || '—'],
  ['Surface',      m => m.surface || '—'],
  ['Contract',     m => m.contract || '—'],
  ['Path',         m => m.path || '—'],
  ['Notes',        m => m.notes || '—'],
];

export default function ModuleDetail({ module: m, onBack }) {
  if (!m) return null;
  const color = STATUS_COLORS[m.truth_status] || '#888';

  return (
    <div style={styles.root}>
      <button onClick={onBack} style={styles.backBtn} aria-label="Back to module list">
        ← Back
      </button>

      <div style={styles.header}>
        <h1 style={styles.title}>{m.id}</h1>
        <span style={{ ...styles.badge, color, borderColor: color }}>
          ● {STATUS_LABEL[m.truth_status] || m.truth_status}
        </span>
      </div>

      {/* All fields */}
      <dl style={styles.dl}>
        {FIELDS.map(([label, fn]) => {
          const val = fn(m);
          if (!val || val === '—') return null;
          return (
            <React.Fragment key={label}>
              <dt style={styles.dt}>{label}</dt>
              <dd style={styles.dd}>{val}</dd>
            </React.Fragment>
          );
        })}
      </dl>

      {/* Scope items */}
      {m.scope && m.scope.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Scope</h2>
          <ul style={styles.list}>
            {m.scope.map((item, i) => (
              <li key={i} style={styles.listItem}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* ACs */}
      {m.acceptance_criteria && m.acceptance_criteria.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Acceptance Criteria</h2>
          <ul style={styles.list}>
            {m.acceptance_criteria.map((ac, i) => (
              <li key={i} style={styles.listItem}>{ac}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Invariants */}
      {m.invariants && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Invariant Status</h2>
          <pre style={styles.pre}>{JSON.stringify(m.invariants, null, 2)}</pre>
        </section>
      )}
    </div>
  );
}

const styles = {
  root: { padding: '24px 32px', maxWidth: 800 },
  backBtn: {
    background: 'transparent', border: '1px solid #333', color: '#888', cursor: 'pointer',
    padding: '5px 12px', borderRadius: 4, fontSize: 12, fontFamily: 'inherit', marginBottom: 20,
  },
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  title: { color: '#f5c518', fontSize: 24, fontWeight: 'bold' },
  badge: { fontSize: 12, fontWeight: 600, border: '1px solid', borderRadius: 12, padding: '3px 10px' },
  dl: { display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px 16px', marginBottom: 28 },
  dt: { color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 2 },
  dd: { color: '#e8e0c8', fontSize: 13, lineHeight: 1.5 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, borderBottom: '1px solid #1e1e1e', paddingBottom: 6 },
  list: { paddingLeft: 0, listStyle: 'none' },
  listItem: { color: '#e8e0c8', fontSize: 13, padding: '5px 0', borderBottom: '1px solid #111' },
  pre: { background: '#111', padding: '12px 16px', borderRadius: 4, color: '#e8e0c8', fontSize: 11, overflowX: 'auto', lineHeight: 1.5 },
};
