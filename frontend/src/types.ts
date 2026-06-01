export interface Engine {
  id: string;
  name: string;
  example: {
    template: string;
    data: Record<string, unknown>;
  };
}

export interface RenderResult {
  id: number;
  engine: string;
  engineName: string;
  result: string;
  duration_ms: number;
  iterations: number;
  error?: string;
}

export interface Measurement {
  id: number;
  engine: string;
  template: string;
  data: Record<string, unknown>;
  result: string;
  duration_ms: number;
  created_at: string;
}

export interface EngineStat {
  engine: string;
  engineName: string;
  count: number;
  avg_ms: number;
  min_ms: number;
  max_ms: number;
}

export type Tab = 'sandbox' | 'history' | 'stats';
