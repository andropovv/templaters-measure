import { useState, useCallback } from 'react';
import { getStats } from '../api';
import type { EngineStat } from '../types';

export function useStats() {
  const [stats, setStats] = useState<EngineStat[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getStats();
    setStats(data);
    setLoading(false);
  }, []);

  return { stats, loading, load };
}
