/* ============================================================
   PredictionForm — the adoption-critical surface.
   Autofocus text, confidence slider (1–99) with a live anchor,
   category chips, date presets. Clears + re-ready on submit.
   Calls onAdd({ text, probability, category, resolveBy }) where
   probability is the 0.01–0.99 decimal and resolveBy is YYYY-MM-DD.
   ============================================================ */
import { useEffect, useRef, useState } from 'react';
import { I } from '../icons';
import { CATS, CAT_ORDER, anchorFor, addDaysStr } from '../lib';

function ProbSlider({ value, onChange }) {
  const pct = ((value - 1) / 98) * 100;
  return (
    <div className="slider-wrap">
      <div className="slider-readout">
        <div className="slider-pct tnum">{value}<span className="pc">%</span></div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        <span className="slider-anchor" aria-live="polite">{anchorFor(value)}</span>
      </div>
      <input
        className="range"
        type="range" min="1" max="99" step="1"
        value={value}
        aria-label="Confidence, percent"
        aria-valuetext={`${value} percent, ${anchorFor(value)}`}
        style={{ '--pct': pct + '%' }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="slider-scale" aria-hidden="true">
        <span>1</span><span>25</span><span>50</span><span>75</span><span>99</span>
      </div>
    </div>
  );
}

function CategoryChips({ value, onChange }) {
  return (
    <div className="chips" role="group" aria-label="Category">
      {CAT_ORDER.map((key) => {
        const c = CATS[key];
        const on = value === key;
        return (
          <button
            key={key}
            type="button"
            className="chip"
            aria-pressed={on}
            onClick={() => onChange(key)}
            style={on ? { background: `var(${c.v})`, color: '#fff' } : {}}
          >
            <span className="cat-dot" style={{ background: `var(${c.v})` }} />
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

const PRESETS = [
  { key: 'tom', label: 'Tomorrow', sub: '+1 day', days: 1 },
  { key: 'week', label: '1 week', sub: '+7 days', days: 7 },
  { key: 'mon', label: '1 month', sub: '+30 days', days: 30 },
];

function DatePresets({ value, onChange }) {
  const [custom, setCustom] = useState(false);
  const matched = PRESETS.find((p) => addDaysStr(p.days) === value);
  return (
    <div>
      <div className="presets" role="group" aria-label="Resolve by">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className="preset"
            aria-pressed={!custom && matched?.key === p.key}
            onClick={() => { setCustom(false); onChange(addDaysStr(p.days)); }}
          >
            {p.label}<small>{p.sub}</small>
          </button>
        ))}
      </div>
      <label className="preset-date">
        <span style={{ width: 16, height: 16, display: 'inline-flex' }}>{I.cal}</span>
        <span>Resolve by</span>
        <input
          type="date"
          value={value}
          aria-label="Resolve-by date"
          onChange={(e) => {
            if (!e.target.value) return;
            setCustom(true);
            onChange(e.target.value);
          }}
        />
      </label>
    </div>
  );
}

function PredictionForm({ onAdd, autoFocus = true }) {
  const [text, setText] = useState('');
  const [prob, setProb] = useState(50);
  const [cat, setCat] = useState('work');
  const [by, setBy] = useState(() => addDaysStr(7));
  const taRef = useRef(null);

  useEffect(() => {
    if (autoFocus && taRef.current) {
      const id = setTimeout(() => taRef.current && taRef.current.focus(), 360);
      return () => clearTimeout(id);
    }
  }, [autoFocus]);

  const valid = text.trim().length > 0;

  function submit(e) {
    e.preventDefault();
    if (!valid) return;
    onAdd({ text: text.trim(), probability: prob / 100, category: cat, resolveBy: by });
    // clear + instantly ready for the next entry
    setText('');
    setProb(50);
    setBy(addDaysStr(7));
    if (taRef.current) taRef.current.focus();
  }

  function autosize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 132) + 'px';
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="field-label">Prediction</div>
      <textarea
        ref={taRef}
        className="f-text"
        rows={2}
        placeholder="What do you think will happen?"
        value={text}
        onChange={(e) => { setText(e.target.value); autosize(e.target); }}
        enterKeyHint="done"
      />

      <div className="field-label">Confidence it happens</div>
      <ProbSlider value={prob} onChange={setProb} />

      <div className="field-label">Category</div>
      <CategoryChips value={cat} onChange={setCat} />

      <div className="field-label">Resolve by</div>
      <DatePresets value={by} onChange={setBy} />

      <button type="submit" className="submit" disabled={!valid}>
        <span style={{ width: 19, height: 19, display: 'inline-flex' }}>{I.plus}</span>
        Log prediction
      </button>
    </form>
  );
}

export default PredictionForm;
