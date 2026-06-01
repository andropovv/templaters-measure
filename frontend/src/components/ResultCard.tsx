import type { RenderResult } from '../types';
import { msColor } from '../utils';

interface Props {
  result: RenderResult;
}

export function ResultCard({ result }: Props) {
  return (
    <section className="panel result-panel" data-testid="result-card">
      <div className="timing-card">
        <span className="timing-label">Время рендеринга</span>
        <span className="timing-value" style={{ color: msColor(result.duration_ms) }} data-testid="timing-value">
          {result.duration_ms.toFixed(3)} мс
        </span>
        <span className="timing-sub">среднее по {result.iterations} итерациям</span>
      </div>
      <div style={{ flex: 1 }}>
        <label className="field-label">Результат</label>
        <div className="result-output" data-testid="render-output">{result.result}</div>
      </div>
    </section>
  );
}
