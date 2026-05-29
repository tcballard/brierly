import { useEffect, useState } from 'react';
import { loadAll, put, remove } from './db';
import PredictionForm from './components/PredictionForm';
import PredictionList from './components/PredictionList';
import ScoreSummary from './components/ScoreSummary';
import ReliabilityDiagram from './components/ReliabilityDiagram';
import DataIO from './components/DataIO';
import './App.css';

function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll().then((all) => {
      setPredictions(all);
      setLoading(false);
    });
  }, []);

  async function addPrediction({ text, probability, category, resolveBy }) {
    const prediction = {
      id: crypto.randomUUID(),
      text,
      probability,
      category,
      createdAt: new Date().toISOString(),
      resolveBy,
      resolvedAt: null,
      outcome: null,
      notes: '',
    };
    await put(prediction);
    setPredictions((prev) => [...prev, prediction]);
  }

  async function resolvePrediction(id, outcome) {
    const target = predictions.find((p) => p.id === id);
    if (!target) return;
    const updated = { ...target, outcome, resolvedAt: new Date().toISOString() };
    await put(updated);
    setPredictions((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function deletePrediction(id) {
    await remove(id);
    setPredictions((prev) => prev.filter((p) => p.id !== id));
  }

  async function importPredictions(incoming) {
    for (const prediction of incoming) {
      await put(prediction);
    }
    setPredictions(await loadAll());
  }

  return (
    <main>
      <h1>brierly</h1>
      <PredictionForm onAdd={addPrediction} />
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <ScoreSummary predictions={predictions} />
          <ReliabilityDiagram predictions={predictions} />
          <PredictionList
            predictions={predictions}
            onResolve={resolvePrediction}
            onDelete={deletePrediction}
          />
          <DataIO predictions={predictions} onImport={importPredictions} />
        </>
      )}
    </main>
  );
}

export default App;
