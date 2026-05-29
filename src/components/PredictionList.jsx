const pct = (p) => `${Math.round(p * 100)}%`;

// Open predictions can be resolved (true/false) or deleted. Resolved ones are
// read-only history. Outcome is shown as a word, not by colour (T1.11 adds the
// glyph); the math never changes once resolved.
function PredictionList({ predictions, onResolve, onDelete }) {
  const open = predictions.filter((p) => p.outcome === null);
  const resolved = predictions.filter((p) => p.outcome !== null);

  return (
    <div>
      <section>
        <h2>Open ({open.length})</h2>
        {open.length === 0 && <p>Nothing open.</p>}
        <ul>
          {open.map((p) => (
            <li key={p.id}>
              <span>{p.text}</span>
              <span>{pct(p.probability)}</span>
              <span>{p.category}</span>
              <span>by {p.resolveBy}</span>
              <button type="button" onClick={() => onResolve(p.id, true)}>
                ✓
              </button>
              <button type="button" onClick={() => onResolve(p.id, false)}>
                ✕
              </button>
              <button type="button" onClick={() => onDelete(p.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Resolved ({resolved.length})</h2>
        {resolved.length === 0 && <p>Nothing resolved yet.</p>}
        <ul>
          {resolved.map((p) => (
            <li key={p.id}>
              <span>{p.text}</span>
              <span>{pct(p.probability)}</span>
              <span>{p.outcome ? 'Yes' : 'No'}</span>
              <span>{p.category}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default PredictionList;
