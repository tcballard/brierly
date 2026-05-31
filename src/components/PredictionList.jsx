const pct = (p) => `${Math.round(p * 100)}%`;

// Open predictions can be resolved (true/false) or deleted. Resolved ones are
// read-only history. Outcome carries a glyph + word so meaning never depends
// on colour alone; the math never changes once resolved.
function PredictionList({ predictions, onResolve, onDelete }) {
  const today = new Date().toISOString().slice(0, 10);
  const isDue = (p) => p.resolveBy <= today;

  // Surface due-to-resolve items first (then soonest), so the tool nudges you
  // to close the loop rather than letting open predictions become a graveyard.
  const open = predictions
    .filter((p) => p.outcome === null)
    .sort((a, b) => isDue(b) - isDue(a) || a.resolveBy.localeCompare(b.resolveBy));
  const resolved = predictions.filter((p) => p.outcome !== null);
  const dueCount = open.filter(isDue).length;

  return (
    <div>
      <section>
        <h2>
          Open ({open.length}
          {dueCount > 0 ? `, ${dueCount} due` : ''})
        </h2>
        {open.length === 0 && <p>Nothing open.</p>}
        <ul>
          {open.map((p) => (
            <li key={p.id}>
              {isDue(p) && <span>⏰ Due</span>}
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
              <span>{p.outcome ? '✓ Yes' : '✗ No'}</span>
              <span>{p.category}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default PredictionList;
