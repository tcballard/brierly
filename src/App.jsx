import { useEffect, useState } from 'react';
import { loadAll, put } from './db';
import PredictionForm from './components/PredictionForm';
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

  return (
    <main>
      <h1>brierly</h1>
      <PredictionForm onAdd={addPrediction} />
      {loading ? <p>Loading…</p> : <p>{predictions.length} predictions</p>}
    </main>
  );
}

export default App;
