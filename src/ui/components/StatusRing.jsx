/**
 * StatusRing — color-coded ring visualization for module truth_status distribution.
 * Pure SVG, no dependencies.
 */
import React from 'react';
import { STATUS_COLORS, STATUS_LABEL } from '../lib/useRegistry.js';

const ORDER = ['working', 'partial', 'draft', 'unverified', 'quarantined', 'planned'];

export default function StatusRing({ counts = {}, size = 120 }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const r = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 18;

  // Build arc segments
  let segments = [];
  let angle = -Math.PI / 2; // start at top

  ORDER.forEach(status => {
    const count = counts[status] || 0;
    if (!count) return;
    const fraction = count / total;
    const sweep = fraction * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + sweep);
    const y2 = cy + r * Math.sin(angle + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    segments.push({
      d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      color: STATUS_COLORS[status] || '#888',
      status,
      count,
    });
    angle += sweep;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={size} height={size} role="img" aria-label="Module status distribution ring">
        {/* Background track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#222" strokeWidth={stroke} />
        {segments.map((seg, i) => (
          <path
            key={i}
            d={seg.d}
            fill="none"
            stroke={seg.color}
            strokeWidth={stroke}
            strokeLinecap="butt"
          />
        ))}
        {/* Center count */}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#e8e0c8" fontSize="22" fontWeight="bold">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#888" fontSize="10">
          modules
        </text>
      </svg>

      {/* Legend */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {ORDER.filter(s => counts[s]).map(s => (
          <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
              background: STATUS_COLORS[s], flexShrink: 0,
            }} />
            <span style={{ color: STATUS_COLORS[s], fontSize: 12 }}>
              {STATUS_LABEL[s]}
            </span>
            <span style={{ color: '#888', fontSize: 12, marginLeft: 'auto', paddingLeft: 8 }}>
              {counts[s]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
