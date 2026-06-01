import type { Measurement } from '../types';
import { msColor, exportToCSV } from '../utils';

interface Props {
  measurements: Measurement[];
  onClear: () => void;
}

export function HistoryTable({ measurements, onClear }: Props) {
  return (
    <div className="history">
      <div className="history-header">
        <h2>История замеров ({measurements.length})</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="export-btn"
            onClick={() => exportToCSV(measurements)}
            disabled={measurements.length === 0}
          >
            Экспорт CSV
          </button>
          <button className="clear-btn" onClick={onClear}>Очистить</button>
        </div>
      </div>
      {measurements.length === 0 ? (
        <p className="empty">Нет данных. Запустите рендеринг в песочнице.</p>
      ) : (
        <table className="table" data-testid="history-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Шаблонизатор</th>
              <th>Время (мс)</th>
              <th>Шаблон</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m) => (
              <tr key={m.id}>
                <td>{m.id}</td>
                <td><span className="badge">{m.engine}</span></td>
                <td style={{ color: msColor(m.duration_ms), fontWeight: 600 }}>
                  {m.duration_ms.toFixed(3)}
                </td>
                <td className="template-cell" title={m.template}>
                  {m.template.slice(0, 50)}{m.template.length > 50 ? '…' : ''}
                </td>
                <td className="date-cell">{m.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
