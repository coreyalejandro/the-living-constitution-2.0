/**
 * ModuleRow — single row in the modules list.
 * Color-coded by truth_status. Keyboard-focusable.
 */
import React from 'react';
import { STATUS_COLORS, STATUS_LABEL } from '../lib/useRegistry.js';

export default function ModuleRow({ module: m, onClick, active = false }) {
  const color = STATUS_COLORS[m.truth_status] || '#888';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-selected={active}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 100px 110px',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid #1e1e1e',
        cursor: 'pointer',
        background: active ? '#1a1a0d' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      {/* ID */}
      <div>
        <span style={{ color: '#e8e0c8', fontSize: 13, fontWeight: active ? 600 : 400 }}>
          {m.id}
        </span>
        {m.description && (
          <span style={{ color: '#555', fontSize: 11, display: 'block', marginTop: 2 }}>
            {m.description.slice(0, 80)}{m.description.length > 80 ? '…' : ''}
          </span>
        )}
      </div>

      {/* Surface */}
      <span style={{ color: '#555', fontSize: 11, textAlign: 'right' }}>
        {m.surface || '—'}
      </span>

      {/* Status badge */}
      <span style={{
        color,
        fontSize: 11,
        fontWeight: 600,
        textAlign: 'right',
        paddingRight: 4,
      }}>
        ● {STATUS_LABEL[m.truth_status] || m.truth_status || 'unknown'}
      </span>
    </div>
  );
}
