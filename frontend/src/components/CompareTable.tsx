import type { RenderResult } from '../types';
import { msColor } from '../utils';

interface Props {
  results: RenderResult[];
}

export function CompareTable({ results }: Props) {
  if (results.length === 0) return null;

  const sorted = [...results].sort((a, b) => a.duration_ms - b.duration_ms);
  const max = sorted[sorted.length - 1].duration_ms;

  return (
    <section className="panel" data-testid="compare-table">
      <label className="field-label">Сравнение всех движков</label>
      <div className="stats-list" style={{ marginTop: 8 }}>
        {sorted.map((r, i) => (
          <div key={r.engine} className="stats-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i === 0 && <span className="badge" style={{ background: '#e8f5e9', color: '#2e7d32' }}>быстрее всех</span>}
              <span className="stats-engine">{r.engineName}</span>
            </div>
            <div className="stats-timing">
              <span>Время:</span>
              <strong style={{ color: msColor(r.duration_ms) }}>{r.duration_ms.toFixed(3)} мс</strong>
            </div>
            <div className="bar-wrap">
              <div
                className="bar"
                style={{ width: `${(r.duration_ms / max) * 100}%`, backgroundColor: msColor(r.duration_ms) }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
