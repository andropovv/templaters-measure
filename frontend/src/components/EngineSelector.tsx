import type { Engine } from '../types';

interface Props {
  engines: Engine[];
  selected: string;
  onChange: (id: string) => void;
}

export function EngineSelector({ engines, selected, onChange }: Props) {
  return (
    <section className="panel">
      <label className="field-label">Шаблонизатор</label>
      <div className="engine-grid">
        {engines.map((e) => (
          <button
            key={e.id}
            className={`engine-btn${selected === e.id ? ' selected' : ''}`}
            onClick={() => onChange(e.id)}
          >
            {e.name}
          </button>
        ))}
      </div>
    </section>
  );
}
