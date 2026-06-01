import { useState, useCallback } from 'react';
import { getMeasurements, clearMeasurements } from '../api';
import type { Measurement } from '../types';

export function useHistory() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getMeasurements({ limit: 50 });
    setMeasurements(data);
    setLoading(false);
  }, []);

  const clear = useCallback(async () => {
    if (!confirm('Очистить всю историю измерений?')) return;
    await clearMeasurements();
    setMeasurements([]);
  }, []);

  return { measurements, loading, load, clear };
}
