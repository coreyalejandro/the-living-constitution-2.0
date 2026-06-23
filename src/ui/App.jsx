/**
 * App — top-level router shell for TLC Workbench Web UI.
 * Nav: keyboard 1-4 to switch views. Mouse click also works.
 * All views are mounted in the main pane below the nav bar.
 */
import React, { useState, useEffect, useCallback } from 'react';
import Dashboard   from './views/Dashboard.jsx';
import Modules     from './views/Modules.jsx';
import ModuleDetail from './views/ModuleDetail.jsx';
import Work        from './views/Work.jsx';

const VIEWS = [
  { key: 'dashboard', label: 'Dashboard', shortcut: '1' },
  { key: 'modules',   label: 'Modules',   shortcut: '2' },
  { key: 'work',      label: 'Work',       shortcut: '3' },
];

export default function App() {
  const [view, setView]             = useState('dashboard');
  const [selectedModule, setModule] = useState(null);

  // Global keyboard nav: 1-3 to switch views
  const handleKey = useCallback(e => {
    // Don't intercept when typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (e.key === '1') setView('dashboard');
    if (e.key === '2') setView('modules');
    if (e.key === '3') setView('work');
    if (e.key === 'Escape' && selectedModule) setModule(null);
  }, [selectedModule]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const handleSelectModule = m => {
    setModule(m);
    setView('modules'); // stay in modules, show detail pane
  };

  return (
    <div style={styles.shell}>
      {/* Skip nav for screen readers */}
      <a href="#main-content" style={styles.skipLink} className="sr-only">Skip to main content</a>

      {/* Top nav bar */}
      <nav style={styles.nav} aria-label="Main navigation">
        <span style={styles.brand}>TLC Workbench</span>
        <div style={styles.navItems} role="tablist">
          {VIEWS.map(v => (
            <button
              key={v.key}
              role="tab"
              aria-selected={view === v.key}
              onClick={() => { setView(v.key); setModule(null); }}
              style={{
                ...styles.navBtn,
                ...(view === v.key ? styles.navBtnActive : {}),
              }}
              title={`Keyboard shortcut: ${v.shortcut}`}
            >
              <span style={styles.shortcut}>{v.shortcut}</span>
              {v.label}
            </button>
          ))}
        </div>
        <span style={styles.navHint} aria-hidden="true">Press 1–3 to navigate</span>
      </nav>

      {/* Main content */}
      <main id="main-content" style={styles.main}>
        {view === 'dashboard' && <Dashboard />}
        {view === 'modules' && !selectedModule && (
          <Modules onSelectModule={handleSelectModule} />
        )}
        {view === 'modules' && selectedModule && (
          <ModuleDetail module={selectedModule} onBack={() => setModule(null)} />
        )}
        {view === 'work' && <Work />}
      </main>

      {/* Status bar */}
      <footer style={styles.footer} aria-label="Status bar">
        <span style={styles.footerLeft}>
          TLC 2.0 — Governed Research OS
        </span>
        <span style={styles.footerRight}>
          Web UI — read-only. Use <code style={styles.code}>tlc</code> CLI for writes.
        </span>
      </footer>
    </div>
  );
}

const styles = {
  shell: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    height: '100vh',
    overflow: 'hidden',
  },
  skipLink: {
    position: 'absolute', top: 0, left: 0, background: '#f5c518', color: '#000',
    padding: '4px 8px', zIndex: 9999, fontSize: 12,
  },
  nav: {
    background: '#0d0d0d',
    borderBottom: '1px solid #222',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    height: 44,
    gap: 8,
  },
  brand: {
    color: '#f5c518',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 24,
    letterSpacing: '0.02em',
  },
  navItems: { display: 'flex', gap: 2 },
  navBtn: {
    background: 'transparent',
    border: 'none',
    color: '#666',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'inherit',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'color 0.1s',
  },
  navBtnActive: { color: '#f5c518', background: '#1a1a00' },
  shortcut: {
    background: '#222',
    border: '1px solid #444',
    borderRadius: 3,
    padding: '1px 4px',
    fontSize: 10,
    color: '#555',
    fontFamily: 'inherit',
  },
  navHint: {
    marginLeft: 'auto',
    color: '#333',
    fontSize: 11,
  },
  main: {
    overflow: 'auto',
    background: '#0d0d0d',
  },
  footer: {
    background: '#080808',
    borderTop: '1px solid #1a1a1a',
    padding: '6px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 11,
    color: '#333',
  },
  footerLeft: { color: '#444' },
  footerRight: { color: '#333' },
  code: { background: '#1a1a1a', padding: '0px 4px', borderRadius: 2, color: '#555', fontSize: 10 },
};
