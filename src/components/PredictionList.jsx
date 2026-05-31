/* ============================================================
   PredictionList — Open + Resolved groups (one shown per `scope`).
   Open rows: text, probability, category, resolve-by, inline ✓/✗
   resolve + delete; past-date items flagged "Due" and sorted to
   top; trailing swipe reveals resolve / delete. Resolved rows:
   read-only ✓ Yes / ✗ No (glyph + label).
   ============================================================ */
import { useRef, useState } from 'react';
import { I } from '../icons';
import { CATS, isOpen, isDue, relDay, fmtDate, anchorFor, brierOne } from '../lib';

const pct = (p) => Math.round(p * 100);

function Swipeable({ width = 216, children, actions, disabled }) {
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const st = useRef({ down: false, sx: 0, base: 0, moved: false });

  function down(e) {
    if (disabled) return;
    st.current = { down: true, sx: e.clientX, base: x, moved: false };
    setDragging(true);
  }
  function move(e) {
    const s = st.current;
    if (!s.down) return;
    let nx = s.base + (e.clientX - s.sx);
    if (Math.abs(e.clientX - s.sx) > 4) s.moved = true;
    nx = Math.max(-width, Math.min(0, nx));
    setX(nx);
  }
  function up() {
    const s = st.current;
    if (!s.down) return;
    s.down = false;
    setDragging(false);
    setX(x < -width * 0.4 ? -width : 0);
  }
  const close = () => setX(0);

  return (
    <div className="swipe" onPointerLeave={up}>
      <div className="swipe-actions" aria-hidden={x === 0}>
        {actions(close)}
      </div>
      <div
        className="row-shell"
        style={{ transform: `translateX(${x}px)`, transition: dragging ? 'none' : 'transform var(--dur) var(--ease)', position: 'relative', zIndex: 1 }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onClickCapture={(e) => {
          if (st.current.moved) { e.stopPropagation(); st.current.moved = false; }
          if (x !== 0) { e.stopPropagation(); close(); }
        }}
      >
        {children}
      </div>
    </div>
  );
}

function CatTag({ cat }) {
  const c = CATS[cat] || CATS.work;
  return (
    <span className="cat-tag">
      <span className="cat-dot" style={{ background: `var(${c.v})` }} />
      {c.label}
    </span>
  );
}

export function OpenRow({ d, onResolve, onDelete }) {
  const [leaving, setLeaving] = useState(null); // 'yes' | 'no' | 'del'
  const due = isDue(d);
  const p = pct(d.probability);

  function end() {
    if (leaving === 'del') onDelete(d.id);
    else if (leaving) onResolve(d.id, leaving === 'yes');
  }

  return (
    <Swipeable
      width={216}
      actions={(close) => (<>
        <button className="swipe-act yes" onClick={() => { close(); setLeaving('yes'); }} aria-label="Resolve as Yes">{I.check}Yes</button>
        <button className="swipe-act no" onClick={() => { close(); setLeaving('no'); }} aria-label="Resolve as No">{I.cross}No</button>
        <button className="swipe-act del" onClick={() => { close(); setLeaving('del'); }} aria-label="Delete">{I.trash}Delete</button>
      </>)}
    >
      <article
        className={'row' + (due ? ' due' : '') + (leaving ? ' row-leaving' : '')}
        onAnimationEnd={(e) => { if (e.animationName === 'row-collapse') end(); }}
      >
        <div className="row-top">
          <CatTag cat={d.category} />
          {due
            ? <span className="due-pill"><span style={{ width: 12, height: 12, display: 'inline-flex' }}>{I.clock}</span>Due</span>
            : <span className="row-when">{relDay(d.resolveBy)}</span>}
        </div>
        <div className="row-text">{d.text}</div>
        <div className="row-bot">
          <div className="prob">
            <span className="prob-val tnum">{p}%</span>
            <span className="prob-anchor">· {anchorFor(p)}</span>
          </div>
        </div>
        <div className="prob-bar" style={{ marginTop: 10 }}>
          <div className="prob-fill" style={{ width: p + '%' }} />
        </div>
        <div className="row-bot" style={{ marginTop: 12 }}>
          {due && <span className="row-when" style={{ marginLeft: 0 }}>Was due {fmtDate(d.resolveBy)} — did it happen?</span>}
          <div className="row-actions">
            <button className="rbtn no" onClick={() => setLeaving('no')} aria-label="Resolve as No">{I.cross}No</button>
            <button className="rbtn yes" onClick={() => setLeaving('yes')} aria-label="Resolve as Yes">{I.check}Yes</button>
          </div>
        </div>
      </article>
    </Swipeable>
  );
}

export function ResolvedRow({ d, onDelete }) {
  const [leaving, setLeaving] = useState(false);
  const yes = d.outcome === true;
  const brier = brierOne(d.probability, d.outcome);
  return (
    <Swipeable
      width={84}
      actions={(close) => (
        <button className="swipe-act del" onClick={() => { close(); setLeaving(true); }} aria-label="Delete">{I.trash}Delete</button>
      )}
    >
      <article
        className={'row' + (leaving ? ' row-leaving' : '')}
        onAnimationEnd={(e) => { if (e.animationName === 'row-collapse') onDelete(d.id); }}
      >
        <div className="row-top">
          <CatTag cat={d.category} />
          {d.resolvedAt && <span className="row-when">Resolved {fmtDate(d.resolvedAt)}</span>}
        </div>
        <div className="row-text" style={{ color: 'var(--label)' }}>{d.text}</div>
        <div className="row-bot" style={{ marginTop: 12 }}>
          <span className={'outcome ' + (yes ? 'yes' : 'no')}>
            {yes ? I.check : I.cross}{yes ? 'Yes' : 'No'}
          </span>
          <span className="prob-anchor" style={{ fontSize: 'var(--f-subhead)' }}>
            said <b className="tnum" style={{ fontWeight: 700, color: 'var(--label)' }}>{pct(d.probability)}%</b>
          </span>
          <span className="brier-chip" title="Brier score for this prediction">
            Brier <b className="tnum">{brier.toFixed(2)}</b>
          </span>
        </div>
      </article>
    </Swipeable>
  );
}

function PredictionList({ scope, predictions, onResolve, onDelete }) {
  const open = predictions.filter(isOpen);
  const done = predictions
    .filter((d) => !isOpen(d))
    .sort((a, b) => (b.resolvedAt || '').localeCompare(a.resolvedAt || ''));

  // due first, then soonest resolve-by
  const openSorted = [...open].sort((a, b) => {
    const da = isDue(a), db = isDue(b);
    if (da !== db) return da ? -1 : 1;
    return (a.resolveBy || '').localeCompare(b.resolveBy || '');
  });
  const dueCount = open.filter(isDue).length;

  if (scope === 'open') {
    if (!open.length) return (
      <div className="card empty" style={{ marginTop: 4 }}>
        <div className="empty-ico">{I.spark}</div>
        <div className="empty-t">No open predictions</div>
        <div className="empty-d">Tap + to log what you think will happen next.</div>
      </div>
    );
    return (
      <div className="list">
        {dueCount > 0 && (
          <div className="row-when" style={{ margin: '0 4px 2px', color: 'var(--due)', fontWeight: 700 }}>
            {dueCount} ready to resolve
          </div>
        )}
        {openSorted.map((d, i) => (
          <div key={d.id} className="anim-in" style={{ animationDelay: Math.min(i * 28, 200) + 'ms' }}>
            <OpenRow d={d} onResolve={onResolve} onDelete={onDelete} />
          </div>
        ))}
      </div>
    );
  }

  if (!done.length) return (
    <div className="card empty" style={{ marginTop: 4 }}>
      <div className="empty-ico">{I.target}</div>
      <div className="empty-t">Nothing resolved yet</div>
      <div className="empty-d">Resolved predictions become your calibration record.</div>
    </div>
  );
  return (
    <div className="list">
      {done.map((d, i) => (
        <div key={d.id} className="anim-in" style={{ animationDelay: Math.min(i * 28, 200) + 'ms' }}>
          <ResolvedRow d={d} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}

export default PredictionList;
