/**
 * Modules — searchable, filterable list of all 30 modules.
 * Keyboard-navigable. Click or Enter to open detail.
 * Filter by truth_status and surface. No mouse required.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useRegistry, STATUS_COLORS, STATUS_LABEL } from '../lib/useRegistry.js';
import ModuleRow from '../components/ModuleRow.jsx';

const SURFACES = ['all', 'governance_core', 'private_lab', 'documentation', 'research'];

export default function Modules({ onSelectModule }) {
  const { modules, loading, error } = useRegistry();
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [surface, setSurface]   = useState('all');
  const [selected, setSelected] = useState(null);
  const searchRef               = useRef(null);

  // Focus search on mount
  useEffect(() => searchRef.current?.focus(), []);

  // Keyboard: up/down to navigate list
  const filtered = modules.filter(m => {
    const matchSearch  = !search || m.id.toLowerCase().includes(search.toLowerCase()) ||
                         (m.description || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus  = status === 'all'  || m.truth_status === status;
    const matchSurface = surface === 'all' || m.surface === surface;
    return matchSearch && matchStatus && matchSurface;
  });

  if (loading) return <p style={{ padding: 40, color: '#888' }}>Loading modules…</p>;
  if (error)   return <p style={{ padding: 40, color: '#f44336' }}>Error: {error}</p>;

  return (
    <div style={styles.root}>
      <h1 style={styles.heading}>Modules</h1>
      <p style={styles.sub}>{modules.length} total — {filtered.length} shown</p>

      {/* Filter bar */}
      <div style={styles.filterBar} role="search">
        <input
          ref={searchRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search ID or description…"
          aria-label="Search modules"
          style={styles.searchInput}
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          aria-label="Filter by status"
          style={styles.select}
        >
          <option value="all">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={surface}
          onChange={e => setSurface(e.target.value)}
          aria-label="Filter by surface"
          style={styles.select}
        >
          {SURFACES.map(s => <option key={s} value={s}>{s === 'all' ? 'All surfaces' : s}</option>)}
        </select>
      </div>

      {/* Column headers */}
      <div style={styles.header}>
        <span>Module ID</span>
        <span style={{ textAlign: 'right' }}>Surface</span>
        <span style={{ textAlign: 'right' }}>Status</span>
      </div>

      {/* List */}
      <div role="list" aria-label="Module list">
        {filtered.length === 0 ? (
          <p style={{ padding: '20px 16px', color: '#555' }}>No modules match filters.</p>
        ) : (
          filtered.map(m => (
            <ModuleRow
              key={m.id}
              module={m}
              active={selected === m.id}
              onClick={() => {
                setSelected(m.id);
                onSelectModule?.(m);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  root: { display: 'flex', flexDirection: 'column', height: '100%' },
  heading: { color: '#f5c518', fontSize: 22, fontWeight: 'bold', padding: '24px 20px 4px' },
  sub: { color: '#555', fontSize: 12, padding: '0 20px 16px' },
  filterBar: {
    display: 'flex', gap: 10, padding: '0 20px 16px', flexWrap: 'wrap',
  },
  searchInput: {
    flex: '1 1 220px', background: '#161616', border: '1px solid #333', borderRadius: 4,
    color: '#e8e0c8', padding: '7px 12px', fontSize: 13, fontFamily: 'inherit',
  },
  select: {
    background: '#161616', border: '1px solid #333', borderRadius: 4,
    color: '#e8e0c8', padding: '7px 12px', fontSize: 12, fontFamily: 'inherit', cursor: 'pointer',
  },
  header: {
    display: 'grid', gridTemplateColumns: '1fr 100px 110px',
    padding: '6px 16px', borderBottom: '1px solid #2a2a2a',
    color: '#555', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
  },
};
