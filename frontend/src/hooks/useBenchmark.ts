import { useState, useCallback } from 'react';
import { renderTemplate } from '../api';
import type { RenderResult } from '../types';

interface BenchmarkState {
  result: RenderResult | null;
  error: string;
  loading: boolean;
}

export function useBenchmark() {
  const [state, setState] = useState<BenchmarkState>({ result: null, error: '', loading: false });

  const run = useCallback(async (engine: string, template: string, data: string, iterations: number) => {
    setState({ result: null, error: '', loading: true });
    try {
      const res = await renderTemplate({ engine, template, data, iterations });
      if (res.error) {
        setState({ result: null, error: res.error, loading: false });
      } else {
        setState({ result: res, error: '', loading: false });
      }
    } catch {
      setState({ result: null, error: 'Ошибка соединения с бэкендом', loading: false });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ result: null, error: '', loading: false });
  }, []);

  return { ...state, run, reset };
}
