interface Props {
  iterations: number;
  loading: boolean;
  onIterationsChange: (n: number) => void;
  onRun: () => void;
  onCompareAll: () => void;
  comparing: boolean;
}

export function BenchmarkControls({ iterations, loading, onIterationsChange, onRun, onCompareAll, comparing }: Props) {
  return (
    <section className="panel">
      <div className="controls">
        <label className="field-label" style={{ marginBottom: 0 }}>
          Итераций: <strong>{iterations}</strong>
        </label>
        <input
          type="range"
          min={1}
          max={1000}
          value={iterations}
          onChange={(e) => onIterationsChange(Number(e.target.value))}
          className="slider"
          data-testid="iterations-slider"
        />
        <button className="run-btn" onClick={onRun} disabled={loading || comparing} data-testid="run-btn">
          {loading ? 'Измерение...' : 'Запустить'}
        </button>
        <button className="compare-btn" onClick={onCompareAll} disabled={loading || comparing} data-testid="compare-btn">
          {comparing ? 'Сравниваем...' : 'Сравнить все'}
        </button>
      </div>
    </section>
  );
}
