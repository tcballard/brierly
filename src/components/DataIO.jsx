/* ============================================================
   DataIO — Export / Import JSON. The only real backup (IndexedDB
   is per-browser). Import is guarded by a try/catch; a bad file
   surfaces a clear message instead of corrupting state.
   ============================================================ */
import { useRef, useState } from 'react';
import { I } from '../icons';

function DataIO({ predictions, onImport }) {
  const fileRef = useRef(null);
  const [msg, setMsg] = useState(null);

  function flash(t) { setMsg(t); setTimeout(() => setMsg(null), 2600); }

  function exportJson() {
    const blob = new Blob([JSON.stringify(predictions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brierly-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash(`Exported ${predictions.length} predictions`);
  }

  async function onFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (!Array.isArray(data)) throw new Error('not an array');
      await onImport(data);
      flash(`Imported ${data.length} predictions`);
    } catch {
      flash("Couldn't read that file");
    } finally {
      e.target.value = '';
    }
  }

  return (
    <div>
      <div className="io-group">
        <button className="io-row" onClick={exportJson}>
          <span className="io-ico" style={{ background: 'var(--cat-work)' }}>{I.export}</span>
          <div className="io-body">
            <div className="io-title">Export backup</div>
            <div className="io-sub">Download all {predictions.length} predictions as JSON</div>
          </div>
          <span style={{ width: 18, height: 18, color: 'var(--label-3)' }}>{I.chevron}</span>
        </button>
        <button className="io-row" onClick={() => fileRef.current && fileRef.current.click()}>
          <span className="io-ico" style={{ background: 'var(--cat-markets)' }}>{I.import}</span>
          <div className="io-body">
            <div className="io-title">Import from file</div>
            <div className="io-sub">Restore or merge a JSON backup</div>
          </div>
          <span style={{ width: 18, height: 18, color: 'var(--label-3)' }}>{I.chevron}</span>
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" onChange={onFile} style={{ display: 'none' }} />
      <p className="io-note">Your data lives only on this device (IndexedDB). Export regularly to keep a backup you control — no account, no server.</p>
      {msg && <p className="io-note" style={{ color: 'var(--pos)', fontWeight: 600 }} role="status">{msg}</p>}
    </div>
  );
}

export default DataIO;
