import usePredictions from './hooks/usePredictions';
import PredictionForm from './components/PredictionForm';
import PredictionList from './components/PredictionList';
import ScoreSummary from './components/ScoreSummary';
import ReliabilityDiagram from './components/ReliabilityDiagram';
import DataIO from './components/DataIO';

function App() {
  const {
    predictions,
    loading,
    error,
    resolvedItems,
    addPrediction,
    resolvePrediction,
    deletePrediction,
    importPredictions,
  } = usePredictions();

  if (error) {
    return (
      <main>
        <h1>brierly</h1>
        <p role="alert">Could not load your predictions: {error}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>brierly</h1>
      <PredictionForm onAdd={addPrediction} />
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <ScoreSummary resolvedItems={resolvedItems} openCount={predictions.length - resolvedItems.length} />
          <ReliabilityDiagram resolvedItems={resolvedItems} />
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
