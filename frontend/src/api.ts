import type { Engine, RenderResult, Measurement, EngineStat } from './types';

const BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:3001') + '/api';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  return res.json() as Promise<T>;
}

export const getEngines = (): Promise<Engine[]> =>
  apiFetch('/engines');

export interface RenderPayload {
  engine: string;
  template: string;
  data: string;
  iterations: number;
}

export const renderTemplate = (payload: RenderPayload): Promise<RenderResult> =>
  apiFetch('/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const getMeasurements = (params?: { limit?: number; engine?: string }): Promise<Measurement[]> => {
  const q = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
  return apiFetch(`/measurements${q ? '?' + q : ''}`);
};

export const getStats = (): Promise<EngineStat[]> =>
  apiFetch('/stats');

export const clearMeasurements = (): Promise<{ ok: boolean }> =>
  apiFetch('/measurements', { method: 'DELETE' });
