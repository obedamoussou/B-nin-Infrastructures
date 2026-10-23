import { Fragment } from 'react';
import { norm, isTbd, parseDate, fmtDate, since, fmtNum, fullNum, link, CATEGORIES, ETATS, statusStyle, plural, etatOfNote, fmtNote } from '../lib/utils.js';
import { NOTE_MAX } from '../lib/config.js';
import { Val, Dot, EtatBadge, CatIcon, ICON } from './ui.jsx';

function Hero({ s, zone, onClose }) {
  const c = CATEGORIES[s.cat];
  return (
    <div className="hero" style={{ '--accent': c.color }}>
      <button className="close" aria-label="Fermer" onClick={onClose}>{ICON.close}</button>
      <CatIcon cat={s.cat} size={22} className="cat-ico xl" />
      <h2>{s.nom}</h2>
      <div className="cap">{[s.ville, zone && `Pôle ${zone.name}`].filter(Boolean).join(' · ') || ' '}</div>
      <div className="badges">
        <span className="badge"><CatIcon cat={s.cat} size={11} />{s.cat === 'autre' && s.categorie ? s.categorie : c.label}</span>
        <EtatBadge s={s} />
        {/* {s.projets.length ? <span className="badge">{plural(s.projets.length, 'projet')}</span> : null} */}
      </div>
    </div>
  );
}

/* Jauge d'état : de « Bon » à « Critique » */
function EtatGauge({ s }) {
  const scale = ['bon', 'satisfaisant', 'moyen', 'mauvais', 'critique'];
  const i = scale.indexOf(s.etatKey);
  return (
    <div className="gauge">
      {scale.map((k, j) => <i key={k} className={j === i ? 'on' : ''} style={{ '--c': ETATS[k].color }} title={ETATS[k].label}></i>)}
      <div className="gauge-l"><span>Bon</span><span>Critique</span></div>
    </div>
  );
}

function Etat({ s }) {
  const last = fmtDate(s.lastEval), next = fmtDate(s.nextEval);
  const late = parseDate(s.nextEval) && parseDate(s.nextEval) < Date.now();
  return (
    <div className="card"><h3>État &amp; évaluation</h3>
      <div className="etat-big" style={{ '--c': ETATS[s.etatKey].color }}>
        <Dot color={ETATS[s.etatKey].color} /><b>{isTbd(s.etat) ? ETATS[s.etatKey].label : s.etat}</b>
      </div>
      {s.etatKey !== 'nd' ? <EtatGauge s={s} /> : null}
      {s.etatSource === 'calcul' ? <p className="hint">Déduit de la notation : moyenne de {fmtNote(s.notation.moyenne)}/{NOTE_MAX}.</p>
        : s.etatSource === 'notation' ? <p className="hint">Selon la notation du site.</p> : null}
      <div className="grid2">
        <div className="kv"><span>Dernière évaluation</span><b>{last || <Val v="" />}</b>{since(s.lastEval) ? <small>{since(s.lastEval)}</small> : null}</div>
        <div className={`kv${late ? ' late' : ''}`}><span>Prochaine évaluation</span><b>{next || <Val v="" />}</b>{since(s.nextEval) ? <small>{late ? `en retard · ${since(s.nextEval)}` : since(s.nextEval)}</small> : null}</div>
      </div>
    </div>
  );
}

/* Libellé d'un critère coupé en deux lignes au plus */
function wrap(label, width = 15) {
  const lines = [''];
  for (const w of label.split(/\s+/)) {
    const cur = lines[lines.length - 1];
    if (cur && (cur + ' ' + w).length > width && lines.length < 2) lines.push(w);
    else lines[lines.length - 1] = cur ? cur + ' ' + w : w;
  }
  return lines;
}

/* Profil du site en radar (hexagone pour 6 critères), à la manière des caractéristiques d'une équipe */
function Radar({ n, color }) {
  const W = 340, H = 290, cx = W / 2, cy = H / 2, R = 92, N = n.criteres.length;
  const pt = (i, r) => {
    const a = -Math.PI / 2 + i * 2 * Math.PI / N;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ring = r => n.criteres.map((_, i) => pt(i, r).join(',')).join(' ');
  return (
    <svg className="radar" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={n.criteres.map(c => `${c.label} : ${fmtNote(c.note)}/${NOTE_MAX}`).join(', ')}>
      {Array.from({ length: NOTE_MAX }, (_, k) => <polygon key={k} className={`radar-ring${k === NOTE_MAX - 1 ? ' out' : ''}`} points={ring(R * (k + 1) / NOTE_MAX)} />)}
      {n.criteres.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} className="radar-axis" x1={cx} y1={cy} x2={x} y2={y} />; })}
      <g className="radar-shape" style={{ '--c': color, transformOrigin: `${cx}px ${cy}px` }}>
        <polygon points={n.criteres.map((c, i) => pt(i, R * (c.note || 0) / NOTE_MAX).join(',')).join(' ')} />
        {n.criteres.map((c, i) => { const [x, y] = pt(i, R * (c.note || 0) / NOTE_MAX); return <circle key={i} cx={x} cy={y} r="3.5" />; })}
      </g>
      {n.criteres.map((c, i) => {
        const [x, y] = pt(i, R + 16), dx = x - cx, dy = y - cy;
        const anchor = Math.abs(dx) < 8 ? 'middle' : dx > 0 ? 'start' : 'end';
        const lines = wrap(c.label), h = 16 + lines.length * 12;
        // en haut le bloc remonte, en bas il descend, sur les côtés il est centré sur le sommet
        const top = dy < -R / 2 ? y - h + 6 : dy > R / 2 ? y + 4 : y - h / 2 + 6;
        return (
          <text key={i} className="radar-label" x={x} y={top} textAnchor={anchor}>
            <tspan className="v" x={x} dy="10" style={{ fill: c.note === null ? 'var(--faint)' : ETATS[etatOfNote(c.note)].color }}>{fmtNote(c.note)}</tspan>
            {lines.map((l, j) => <tspan key={j} x={x} dy={j ? 12 : 14}>{l}</tspan>)}
          </text>
        );
      })}
    </svg>
  );
}

function Notation({ s }) {
  const n = s.notation;
  if (!n || !n.criteres.length) return null;
  const color = ETATS[n.moyenne === null ? 'nd' : etatOfNote(n.moyenne)].color;
  return (
    <div className="card"><h3>Notation <span className="n">{plural(n.criteres.length, 'critère')} · sur {NOTE_MAX}</span></h3>
      <div className="score" style={{ '--c': color }}>
        <b>{fmtNote(n.moyenne)}</b><span>/{NOTE_MAX}</span>
        <small>Moyenne des critères<br />{fmtNote(n.total)} / {n.max} points{n.complet ? '' : ' · notation incomplète'}</small>
      </div>
      {n.criteres.length >= 3 ? <Radar n={n} color={color} /> : (
        <div className="bars">{n.criteres.map((c, i) => (
          <div key={i}><span>{c.label}</span><i><em style={{ width: `${(c.note || 0) / NOTE_MAX * 100}%` }}></em></i><b>{fmtNote(c.note)}</b></div>
        ))}</div>
      )}
    </div>
  );
}

function Actions({ s }) {
  const items = isTbd(s.actions) ? [] : s.actions.split(/\n+|;\s*/).map(x => x.replace(/^[-•*\d.)\s]+/, '').trim()).filter(Boolean);
  return (
    <div className="card"><h3>{ICON.tools}Actions à entreprendre</h3>
      {items.length > 1 ? <ul className="todo">{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
        : items.length ? <p className="txt">{items[0]}</p> : <Val v="" />}
    </div>
  );
}

// function Localisation({ s, zone, onZone }) {
//   return (
//     <div className="card"><h3>{ICON.pin}Localisation</h3>
//       <div className="grid2" style={{ marginTop: 0 }}>
//         <div className="kv"><span>Ville</span><b><Val v={s.ville} /></b></div>
//         <div className="kv"><span>Zone</span><b>{zone
//           ? <button className="zone-link" style={{ '--c': zone.color }} onClick={() => onZone(zone)}><i></i>Pôle {zone.name}</button>
//           : <Val v="" />}</b></div>
//       </div>
//       {s.pos && !s.exact ? <p className="hint">Position indicative, au sein de la commune de {s.ville}.</p> : null}
//     </div>
//   );
// }

function Projet({ p }) {
  const a = parseDate(p.debut), b = parseDate(p.fin);
  const pct = a && b ? Math.max(0, Math.min(100, (Date.now() - a) / (b - a) * 100)) : null;
  const res = (p.resultats || '').split(/\n+/).map(x => x.trim()).filter(Boolean);
  return (
    <div className="acc">
      <div className="acc-t"><b>{p.intitule}</b>{p.statut ? <span className="status" style={statusStyle(p.statut)}>{p.statut}</span> : null}</div>
      {p.objectif && !isTbd(p.objectif) ? <p className="obj">{p.objectif}</p> : null}
      <div className="acc-m">
        {p.moa && !isTbd(p.moa) ? <span>Maître d'ouvrage <b>{p.moa}</b></span> : null}
        {p.moe && !isTbd(p.moe) ? <span>Maître d'œuvre <b>{p.moe}</b></span> : null}
        {fmtNum(p.montant) ? <span title={fullNum(p.montant)}>Montant <b>{fmtNum(p.montant)}</b></span> : null}
        {fmtDate(p.debut) ? <span>Début <b>{fmtDate(p.debut)}</b></span> : null}
        {fmtDate(p.fin) ? <span>Fin <b>{fmtDate(p.fin)}</b></span> : null}
      </div>
      {res.length ? <div className="res"><small>Résultats attendus</small><ul>{res.map((r, i) => <li key={i}>{r}</li>)}</ul></div> : null}
      {p.commentaires && !isTbd(p.commentaires) ? <p className="comment">{p.commentaires}</p> : null}
      {pct !== null ? <><div className="prog"><i style={{ width: `${pct.toFixed(1)}%` }}></i></div><div className="prog-l"><span>{fmtDate(p.debut)}</span><span>{Math.round(pct)} %</span><span>{fmtDate(p.fin)}</span></div></> : null}
    </div>
  );
}

function Projets({ s }) {
  return (
    <div className="card"><h3>Projets <span className="n">{s.projets.length || ''}</span></h3>
      {s.projets.length ? s.projets.map((p, i) => <Projet p={p} key={i} />) : <div className="none">Aucun projet renseigné pour ce site.</div>}
    </div>
  );
}

/* Colonnes ajoutées plus tard : affichées automatiquement */
function Extra({ s }) {
  const extra = Object.entries(s._cells).filter(([h, v]) => !s._used.has(h) && norm(h) && v);
  if (!extra.length) return null;
  return (
    <div className="card"><h3>Autres informations</h3><div className="grid2" style={{ marginTop: 0 }}>{extra.map(([h, v]) => (
      <div className="kv" key={h}><span>{h}</span><b>{link(v) ? <a href={v} target="_blank" rel="noopener">{v}</a> : <Val v={v} />}</b></div>
    ))}</div></div>
  );
}

export default function Drawer({ s, open, version, zones, onClose, onZone, onLocate }) {
  const zone = s && zones.find(z => z.key === s.zone);
  return (
    <aside className={`drawer glass${open ? ' open' : ''}`} aria-live="polite">
      {/* la clé force un rendu neuf (animations, défilement en haut) à chaque ouverture */}
      <Fragment key={version}>{s ? <>
        <Hero s={s} zone={zone} onClose={onClose} />
        <div className="body">
          <Etat s={s} />
          <Notation s={s} />
          <Actions s={s} />
          <Projets s={s} />
          {/* <Localisation s={s} zone={zone} onZone={onZone} /> */}
          <Extra s={s} />
        </div>
        <div className="actions">
          <button className="btn" disabled={!s.pos} onClick={() => onLocate(s)}>{ICON.target} Centrer sur la carte</button>
          <button className="btn primary" disabled={!zone} onClick={() => onZone(zone)}>{ICON.zone} Voir la zone</button>
        </div>
      </> : null}</Fragment>
    </aside>
  );
}
