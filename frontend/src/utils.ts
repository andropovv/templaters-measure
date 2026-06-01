import type { Measurement } from './types';

export function msColor(ms: number): string {
  if (ms < 1) return '#2e7d32';
  if (ms < 5) return '#f57c00';
  return '#c62828';
}

export function exportToCSV(measurements: Measurement[]): void {
  const header = ['id', 'engine', 'duration_ms', 'template', 'created_at'];
  const rows = measurements.map((m) =>
    [m.id, m.engine, m.duration_ms, `"${m.template.replace(/"/g, '""')}"`, m.created_at].join(',')
  );
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `measurements_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
