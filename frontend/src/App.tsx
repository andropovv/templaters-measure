import { useState, useEffect } from 'react';
import { getEngines, renderTemplate } from './api';
import { useBenchmark } from './hooks/useBenchmark';
import { useHistory } from './hooks/useHistory';
import { useStats } from './hooks/useStats';
import { EngineSelector } from './components/EngineSelector';
import { TemplateEditor } from './components/TemplateEditor';
import { BenchmarkControls } from './components/BenchmarkControls';
import { ResultCard } from './components/ResultCard';
import { CompareTable } from './components/CompareTable';
import { HistoryTable } from './components/HistoryTable';
import { StatsView } from './components/StatsView';
import { ErrorBoundary } from './components/ErrorBoundary';
import type { Engine, RenderResult, Tab } from './types';

export default function App() {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [selectedEngine, setSelectedEngine] = useState('');
  const [template, setTemplate] = useState('');
  const [dataJson, setDataJson] = useState('{}');
  const [iterations, setIterations] = useState(100);
  const [tab, setTab] = useState<Tab>('sandbox');
  const [compareResults, setCompareResults] = useState<RenderResult[]>([]);
  const [comparing, setComparing] = useState(false);

  const benchmark = useBenchmark();
  const history = useHistory();
  const statsHook = useStats();

  useEffect(() => {
    getEngines().then((list) => {
      setEngines(list);
      if (list.length) {
        setSelectedEngine(list[0].id);
        setTemplate(list[0].example.template);
        setDataJson(JSON.stringify(list[0].example.data, null, 2));
      }
    });
  }, []);

  const onEngineChange = (id: string) => {
    setSelectedEngine(id);
    const eng = engines.find((e) => e.id === id);
    if (eng) {
      setTemplate(eng.example.template);
      setDataJson(JSON.stringify(eng.example.data, null, 2));
    }
    benchmark.reset();
    setCompareResults([]);
  };

  const handleRun = () => {
    setCompareResults([]);
    benchmark.run(selectedEngine, template, dataJson, iterations);
  };

  const handleCompareAll = async () => {
    setComparing(true);
    benchmark.reset();
    setCompareResults([]);
    const results: RenderResult[] = [];
    for (const engine of engines) {
      try {
        const res = await renderTemplate({ engine: engine.id, template, data: dataJson, iterations });
        if (!res.error) results.push(res);
      } catch { /* skip failed engines */ }
    }
    setCompareResults(results);
    setComparing(false);
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    if (t === 'history') history.load();
    if (t === 'stats') statsHook.load();
  };

  const TAB_LABELS: Record<Tab, string> = {
    sandbox: 'Песочница',
    history: 'История',
    stats: 'Статистика',
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Песочница шаблонизаторов</h1>
        <p className="subtitle">Измерение производительности рендеринга — К2: Кузнецов Андрей</p>
      </header>

      <nav className="tabs">
        {(['sandbox', 'history', 'stats'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' active' : ''}`}
            onClick={() => handleTabChange(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      <ErrorBoundary>
        {tab === 'sandbox' && (
          <div className="sandbox">
            <EngineSelector engines={engines} selected={selectedEngine} onChange={onEngineChange} />
            <TemplateEditor
              template={template}
              dataJson={dataJson}
              onTemplateChange={setTemplate}
              onDataChange={setDataJson}
            />
            <BenchmarkControls
              iterations={iterations}
              loading={benchmark.loading}
              comparing={comparing}
              onIterationsChange={setIterations}
              onRun={handleRun}
              onCompareAll={handleCompareAll}
            />

            {benchmark.error && <div className="error-box">{benchmark.error}</div>}
            {benchmark.result && compareResults.length === 0 && <ResultCard result={benchmark.result} />}
            {compareResults.length > 0 && <CompareTable results={compareResults} />}
          </div>
        )}

        {tab === 'history' && (
          <HistoryTable measurements={history.measurements} onClear={history.clear} />
        )}

        {tab === 'stats' && <StatsView stats={statsHook.stats} />}
      </ErrorBoundary>
    </div>
  );
}
