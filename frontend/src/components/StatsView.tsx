import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { EngineStat } from '../types';
import { msColor } from '../utils';

interface Props {
  stats: EngineStat[];
}

export function StatsView({ stats }: Props) {
  if (stats.length === 0) {
    return <p className="empty">Нет данных. Запустите рендеринг в песочнице.</p>;
  }

  const sorted = [...stats].sort((a, b) => a.avg_ms - b.avg_ms);

  return (
    <div className="stats" data-testid="stats-view">
      <h2>Сравнительная статистика</h2>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={sorted} margin={{ top: 12, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="engineName" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} unit=" мс" width={72} />
            <Tooltip
              formatter={(v) => [`${Number(v).toFixed(3)} мс`, 'Среднее время']}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="avg_ms" name="Среднее время" radius={[4, 4, 0, 0]}>
              {sorted.map((s) => (
                <Cell key={s.engine} fill={msColor(s.avg_ms)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-list" style={{ marginTop: 24 }}>
        {sorted.map((s) => (
          <div key={s.engine} className="stats-card">
            <div className="stats-engine">{s.engineName}</div>
            <div className="stats-timing">
              <span>Среднее:</span>
              <strong style={{ color: msColor(s.avg_ms) }}>{s.avg_ms.toFixed(3)} мс</strong>
            </div>
            <div className="stats-meta">
              Мин: {s.min_ms.toFixed(3)} | Макс: {s.max_ms.toFixed(3)} | Замеров: {s.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
