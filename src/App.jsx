/* ============================================================
   App — composition, state, handlers. The IndexedDB load and the
   add/resolve/delete/import handlers persist real data; the tab
   nav, sheets, and toast are presentation added for the design.
   ============================================================ */
import { useEffect, useRef, useState } from 'react';
import { loadAll, put, remove } from './db';
import { I } from './icons';
import { isOpen, isDue, brierOne } from './lib';
import PredictionForm from './components/PredictionForm';
import PredictionList, { OpenRow } from './components/PredictionList';
import ScoreSummary from './components/ScoreSummary';
import ReliabilityDiagram from './components/ReliabilityDiagram';
import DataIO from './components/DataIO';
import './App.css';

function FirstRun({ onStart }) {
  return (
    <div className="firstrun anim-in">
      <div className="firstrun-badge">{I.target}</div>
      <h2>Track your calibration</h2>
      <p>Log what you think will happen and how sure you are. Resolve it when the outcome lands — brierly shows whether your confidence matches reality.</p>
      <button className="firstrun-cta" onClick={onStart}>
        <span style={{ width: 19, height: 19, display: 'inline-flex' }}>{I.plus}</span>
        Log your first prediction
      </button>
    </div>
  );
}

function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('summary');
  const [scope, setScope] = useState('open');
  const [sheet, setSheet] = useState(null); // 'form' | 'settings' | null
  const [sheetIn, setSheetIn] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    loadAll().then((all) => { setPredictions(all); setLoading(false); });
  }, []);

  // ---- sheet open/close with transition ----
  function openSheet(which) {
    setSheet(which);
    requestAnimationFrame(() => requestAnimationFrame(() => setSheetIn(true)));
  }
  function closeSheet() {
    setSheetIn(false);
    setTimeout(() => setSheet(null), 420);
  }

  // ---- toast ----
  function fireToast(data) {
    clearTimeout(toastTimer.current);
    setToast({ ...data, in: false });
    requestAnimationFrame(() => requestAnimationFrame(() => setToast((x) => x && { ...x, in: true })));
    toastTimer.current = setTimeout(() => {
      setToast((x) => x && { ...x, in: false });
      setTimeout(() => setToast(null), 320);
    }, 2200);
  }

  // ---- data handlers (persist to IndexedDB) ----
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
    setPredictions((prev) => [prediction, ...prev]);
    fireToast({ kind: 'logged' });
  }

  async function resolvePrediction(id, outcome) {
    const target = predictions.find((p) => p.id === id);
    if (!target) return;
    const updated = { ...target, outcome, resolvedAt: new Date().toISOString() };
    await put(updated);
    setPredictions((prev) => prev.map((p) => (p.id === id ? updated : p)));
    fireToast({ kind: 'resolved', outcome, brier: brierOne(target.probability, outcome) });
  }

  async function deletePrediction(id) {
    await remove(id);
    setPredictions((prev) => prev.filter((p) => p.id !== id));
  }

  async function importPredictions(incoming) {
    const clean = incoming.filter((d) => d && d.id && typeof d.probability === 'number');
    for (const p of clean) await put(p);
    setPredictions(await loadAll());
    closeSheet();
  }

  const open = predictions.filter(isOpen);
  const dueItems = open.filter(isDue);
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const empty = !loading && predictions.length === 0;

  return (
    <div className="app">
      <header className="hdr">
        <div className="hdr-row">
          <div>
            <div className="hdr-title">{tab === 'summary' ? 'Calibration' : 'Predictions'}</div>
            <div className="hdr-sub">
              {tab === 'summary' ? today : `${open.length} open · ${predictions.length - open.length} resolved`}
            </div>
          </div>
          <button className="hdr-gear" aria-label="Data & settings" onClick={() => openSheet('settings')}>
            <span style={{ width: 21, height: 21, display: 'inline-flex' }}>{I.gear}</span>
          </button>
        </div>
      </header>

      <main className="scroll" key={tab}>
        {loading ? null : empty ? (
          <FirstRun onStart={() => openSheet('form')} />
        ) : tab === 'summary' ? (
          <>
            {dueItems.length > 0 && (
              <section>
                <div className="section-h">
                  <h2>Due to resolve</h2>
                  <span className="act" style={{ color: 'var(--due)' }}>{dueItems.length}</span>
                </div>
                <div className="list">
                  {dueItems.map((d) => (
                    <OpenRow key={d.id} d={d} onResolve={resolvePrediction} onDelete={deletePrediction} />
                  ))}
                </div>
              </section>
            )}

            <div className="section-h"><h2>Your calibration</h2></div>
            <ScoreSummary predictions={predictions} />

            <div className="section-h"><h2>Reliability</h2></div>
            <ReliabilityDiagram predictions={predictions} />
          </>
        ) : (
          <>
            <div className="seg" role="tablist" aria-label="Filter">
              <button role="tab" aria-selected={scope === 'open'} onClick={() => setScope('open')}>
                Open <span className="seg-count">{open.length}</span>
              </button>
              <button role="tab" aria-selected={scope === 'resolved'} onClick={() => setScope('resolved')}>
                Resolved <span className="seg-count">{predictions.length - open.length}</span>
              </button>
            </div>
            <PredictionList scope={scope} predictions={predictions} onResolve={resolvePrediction} onDelete={deletePrediction} />
          </>
        )}
      </main>

      <nav className="tabbar" role="tablist" aria-label="Sections">
        <button className="tab" role="tab" aria-selected={tab === 'summary'} onClick={() => setTab('summary')}>
          <span>{I.summary}</span>Calibration
        </button>
        <div className="fab-wrap">
          <button className="fab" aria-label="Log a prediction" onClick={() => openSheet('form')}>{I.plus}</button>
        </div>
        <button className="tab" role="tab" aria-selected={tab === 'predictions'} onClick={() => setTab('predictions')}>
          <span>{I.list}</span>Predictions
        </button>
      </nav>

      {toast && (
        <div className="toast-wrap">
          <div className={'toast' + (toast.in ? ' in' : '')} role="status">
            {toast.kind === 'logged' ? (
              <>
                <span className="tcheck" style={{ background: 'var(--tint)', color: '#fff' }}>{I.plus}</span>
                Prediction logged
              </>
            ) : (
              <>
                <span className="tcheck" style={{ background: toast.outcome ? 'var(--pos)' : 'var(--neg)', color: '#fff' }}>
                  {toast.outcome ? I.check : I.cross}
                </span>
                Resolved {toast.outcome ? 'Yes' : 'No'} · Brier {toast.brier.toFixed(2)}
              </>
            )}
          </div>
        </div>
      )}

      {sheet && <div className={'scrim' + (sheetIn ? ' in' : '')} onClick={closeSheet} />}

      {sheet === 'form' && (
        <section className={'sheet' + (sheetIn ? ' in' : '')} role="dialog" aria-modal="true" aria-label="New prediction">
          <div className="grabber" />
          <div className="sheet-hd">
            <button className="sheet-cancel" onClick={closeSheet}>Cancel</button>
            <h2>New prediction</h2>
            <span style={{ minWidth: 44 }} />
          </div>
          <div className="sheet-body">
            <PredictionForm onAdd={(p) => { addPrediction(p); closeSheet(); }} autoFocus />
          </div>
        </section>
      )}

      {sheet === 'settings' && (
        <section className={'sheet' + (sheetIn ? ' in' : '')} role="dialog" aria-modal="true" aria-label="Data & backup">
          <div className="grabber" />
          <div className="sheet-hd">
            <span style={{ minWidth: 44 }} />
            <h2>Data & backup</h2>
            <button className="sheet-cancel" onClick={closeSheet}>Done</button>
          </div>
          <div className="sheet-body">
            <DataIO predictions={predictions} onImport={importPredictions} />
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
