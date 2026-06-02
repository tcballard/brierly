import { useEffect, useState } from 'react';
import { loadAll, put, remove } from '../db';

export default function usePredictions() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAll()
      .then((all) => {
        setPredictions(all);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message ?? 'Failed to load predictions');
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
    await Promise.all(incoming.map((prediction) => put(prediction)));
    setPredictions(await loadAll());
  }

  const resolvedItems = predictions
    .filter((p) => p.outcome !== null)
    .map((p) => ({ p: p.probability, o: p.outcome }));

  return {
    predictions,
    loading,
    error,
    resolvedItems,
    addPrediction,
    resolvePrediction,
    deletePrediction,
    importPredictions,
  };
}
