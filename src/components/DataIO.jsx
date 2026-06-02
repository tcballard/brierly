import { useRef, useState } from 'react';

// The only real backup: IndexedDB is per-browser, so export is the backstop.
// Import is guarded by a try/catch (no schema-validator module on purpose);
// a bad file surfaces a clear message instead of corrupting state.
function DataIO({ predictions, onImport }) {
  const fileRef = useRef(null);
  const [error, setError] = useState('');

  function handleExport() {
    const json = JSON.stringify(predictions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brierly-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data)) {
        throw new Error('expected a JSON array of predictions');
      }
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        if (typeof item.id !== 'string' || !item.id) {
          throw new Error(`item ${i}: missing or invalid "id" (expected non-empty string)`);
        }
        if (typeof item.text !== 'string' || !item.text) {
          throw new Error(`item ${i}: missing or invalid "text" (expected non-empty string)`);
        }
        if (typeof item.probability !== 'number' || item.probability < 0 || item.probability > 1) {
          throw new Error(`item ${i}: missing or invalid "probability" (expected number between 0 and 1)`);
        }
      }
      await onImport(data);
    } catch (err) {
      setError(`Import failed: ${err.message}`);
    } finally {
      e.target.value = ''; // let the same file be re-imported
    }
  }

  return (
    <section>
      <h2>Data</h2>
      <button type="button" onClick={handleExport}>
        Export JSON
      </button>
      <button type="button" onClick={() => fileRef.current?.click()}>
        Import JSON
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        onChange={handleImport}
        hidden
      />
      {error && <p role="alert">{error}</p>}
    </section>
  );
}

export default DataIO;
