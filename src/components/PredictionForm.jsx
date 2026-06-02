import { useRef, useState } from 'react';
import { CATEGORIES } from '../constants';

// Default resolve-by a week out, as YYYY-MM-DD (so the Phase 3 nudge has a
// real date to compare against, not a graveyard).
function defaultResolveBy() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

// The make-or-break screen: a prediction logged in ~5s. Text autofocuses;
// after submit we clear the text and refocus but keep category and date, so
// logging several in a row is fast.
function PredictionForm({ onAdd }) {
  const [text, setText] = useState('');
  const [probability, setProbability] = useState(50);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [resolveBy, setResolveBy] = useState(defaultResolveBy);
  const textRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({
      text: text.trim(),
      probability: probability / 100, // slider 1-99 -> 0.01-0.99
      category,
      resolveBy,
    });
    setText('');
    setProbability(50);
    textRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={textRef}
        type="text"
        placeholder="What will happen?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus
      />
      <label>
        {probability}%
        <input
          type="range"
          min="1"
          max="99"
          value={probability}
          onChange={(e) => setProbability(Number(e.target.value))}
        />
      </label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="date"
        value={resolveBy}
        onChange={(e) => setResolveBy(e.target.value)}
      />
      <button type="submit">Log</button>
    </form>
  );
}

export default PredictionForm;
