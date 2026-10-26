import { Fragment, useEffect, useState } from 'react';
import { norm, isTbd, parseDate, fmtDate, since, fmtNum, fullNum, link, CATEGORIES, ETATS, statusStyle, plural } from '../lib/utils.js';
import { NOTE_MAX } from '../lib/config.js';
import { Val, Dot, EtatBadge, CatIcon, ICON } from './ui.jsx';

function Hero({ s, zone, compact, onClose, onBack }) {
  const c = CATEGORIES[s.cat];
  return (
    <div className={`hero${compact ? ' compact' : ''}`} style={{ '--accent': c.color }}>
      <button className="back hero-back" aria-label="Retour à la liste" onClick={onBack}>{ICON.back}<span>{zone ? `Pôle ${zone.name}` : 'Liste des sites'}</span></button>
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

/* Jauge du niveau de valorisation : de « Bon » à « Critique » */
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
    <div className="card"><h3>Niveau de valorisation</h3>
      <div className="etat-big" style={{ '--c': ETATS[s.etatKey].color }}>
        <Dot color={ETATS[s.etatKey].color} /><b>{isTbd(s.etat) ? ETATS[s.etatKey].label : s.etat}</b>
      </div>
      {s.etatKey !== 'nd' ? <EtatGauge s={s} /> : null}
      <div className="grid2">
        <div className="kv"><span>Dernière évaluation</span><b>{last || <Val v="" />}</b>{since(s.lastEval) ? <small>{since(s.lastEval)}</small> : null}</div>
        <div className={`kv${late ? ' late' : ''}`}><span>Prochaine évaluation</span><b>{next || <Val v="" />}</b>{since(s.nextEval) ? <small>{late ? `en retard · ${since(s.nextEval)}` : since(s.nextEval)}</small> : null}</div>
      </div>
    </div>
  );
}

/* Note sur NOTE_MAX en anneau qui se remplit ; couleur selon la note (vide tant qu'elle n'est pas renseignée) */
function NoteRing({ n }) {
  const R = 26, C = 2 * Math.PI * R;
  const ratio = n === null ? 0 : Math.max(0, Math.min(1, n / NOTE_MAX));
  const color = ratio >= .8 ? '#2fd08a' : ratio >= .6 ? '#9be15d' : ratio >= .4 ? '#f4c542' : ratio >= .2 ? '#ff7a59' : '#ff3b5c';
  return (
    <div className="ring" style={{ '--c': color }}>
      <svg viewBox="0 0 64 64" width="64" height="64">
        <circle className="ring-track" cx="32" cy="32" r={R} />
        {n === null ? null : <circle className="ring-fill" cx="32" cy="32" r={R} strokeDasharray={C} style={{ '--off': C * (1 - ratio), '--len': C }} />}
      </svg>
      <b>{n === null ? '—' : n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}<small>/{NOTE_MAX}</small></b>
    </div>
  );
}

/* Valeur d'un indicateur : note sur NOTE_MAX (titre en « Note… »), nombre, ou texte tel quel */
function Indicateur({ label, value }) {
  const n = Number((value || '').replace(/[\s\u00a0\u202f]/g, '').replace(',', '.'));
  const isNum = !isTbd(value) && value.trim() !== '' && isFinite(n);
  if (/^note/.test(norm(label)) && (isNum || isTbd(value))) return (
    <div className="kv ind note"><span>{label}</span><NoteRing n={isNum ? n : null} /></div>
  );
  return (
    <div className="kv ind">
      <span>{label}</span>
      {isNum ? <b className="big">{n.toLocaleString('fr-FR')}</b> : <b><Val v={value} /></b>}
    </div>
  );
}

function Notation({ s }) {
  if (!s.notation.length) return null;
  return (
    <div className="card"><h3>Notation <span className="n">{plural(s.notation.length, 'indicateur')}</span></h3>
      <div className="grid2" style={{ marginTop: 0 }}>{/* les nombres d'abord, puis les notes : chaque type sur sa propre ligne */}
        {[...s.notation].sort((a, b) => /^note/.test(norm(a.label)) - /^note/.test(norm(b.label))).map(c => <Indicateur key={c.label} {...c} />)}</div>
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

export default function Drawer({ s, open, version, zones, onClose, onBack, onZone, onLocate }) {
  const zone = s && zones.find(z => z.key === s.zone);
  // mobile : en-tête réduit (icône + nom sur une ligne) dès qu'on fait défiler la fiche
  const [compact, setCompact] = useState(false);
  useEffect(() => setCompact(false), [version]);
  const onScroll = e => {
    const b = e.currentTarget;
    if (b.scrollTop < 4) setCompact(false);
    // seulement s'il reste assez à faire défiler, sinon l'en-tête rétréci ramènerait le défilement à zéro
    else if (b.scrollTop > 24 && b.scrollHeight - b.clientHeight > 160) setCompact(true);
  };
  return (
    <aside className={`drawer glass${open ? ' open' : ''}`} aria-live="polite">
      {/* la clé force un rendu neuf (animations, défilement en haut) à chaque ouverture */}
      <Fragment key={version}>{s ? <>
        <Hero s={s} zone={zone} compact={compact} onClose={onClose} onBack={onBack} />
        <div className="body" onScroll={onScroll}>
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
