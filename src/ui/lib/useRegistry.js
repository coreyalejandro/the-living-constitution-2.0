/**
 * useRegistry — reads exported registry data from public/data/registry.json
 * Falls back to empty state if data is not yet exported.
 */
import { useState, useEffect } from 'react';

export const STATUS_COLORS = {
  working:     '#4caf50',
  partial:     '#f5c518',
  draft:       '#90caf9',
  unverified:  '#888',
  quarantined: '#f44336',
  planned:     '#78909c',
};

export const STATUS_LABEL = {
  working:     'Working',
  partial:     'Partial',
  draft:       'Draft',
  unverified:  'Unverified',
  quarantined: 'Quarantined',
  planned:     'Planned',
};

export function useRegistry() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetch('./data/registry.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        // Handle both {modules:[...]} and [...] shapes
        const list = Array.isArray(data) ? data : (data.modules || []);
        setModules(list);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const counts = modules.reduce((acc, m) => {
    const s = m.truth_status || 'unverified';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return { modules, loading, error, counts };
}
