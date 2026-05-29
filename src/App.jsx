import { useEffect, useState } from 'react';
import { loadAll } from './db';
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

  return (
    <main>
      <h1>brierly</h1>
      {loading ? <p>Loading…</p> : <p>{predictions.length} predictions</p>}
    </main>
  );
}

export default App;
