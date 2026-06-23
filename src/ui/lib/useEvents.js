/**
 * useEvents — reads exported evidence events from public/data/events.json
 * Falls back to empty list if data is not yet exported.
 */
import { useState, useEffect } from 'react';

export function useEvents() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('./data/events.json')
      .then(r => r.ok ? r.json() : [])
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return { events, loading };
}
