import { CATEGORIES, ETATS, plural } from '../lib/utils.js';
import { CatIcon, Dot, ICON } from './ui.jsx';

/* Puces de filtre : catégories et niveaux de valorisation, avec leurs effectifs */
function Filters({ pool, cats, etats, onCats, onEtats }) {
  const count = (key, field) => pool.filter(s => s[field] === key).length;
  const toggle = (set, k, fn) => { const n = new Set(set); n.has(k) ? n.delete(k) : n.add(k); fn(n); };
  const group = (title, set, fn, chips) => (
    <div className="fgroup">
      <div className="fgroup-t"><span>{title}</span>{set.size ? <button onClick={() => fn(new Set())}>Tout afficher</button> : null}</div>
      <div className="chips">{chips}</div>
    </div>
  );
  return (
    <div className="filters">
      {group('Catégorie', cats, onCats, <>
        {Object.entries(CATEGORIES).filter(([k]) => count(k, 'cat')).map(([k, c]) => (
          <button key={k} className={`chip ${cats.has(k) ? 'on' : ''}`} onClick={() => toggle(cats, k, onCats)} title={c.label}>
            <CatIcon cat={k} size={12} />{c.label} <span>{count(k, 'cat')}</span>
          </button>
        ))}
      </>)}
      {group('Niveau de valorisation', etats, onEtats, <>
        {Object.entries(ETATS).sort((a, b) => a[1].rank - b[1].rank).filter(([k]) => count(k, 'etatKey')).map(([k, e]) => (
          <button key={k} className={`chip ${etats.has(k) ? 'on' : ''}`} onClick={() => toggle(etats, k, onEtats)}>
            <Dot color={e.color} />{e.label} <span>{count(k, 'etatKey')}</span>
          </button>
        ))}
      </>)}
    </div>
  );
}

function SiteItem({ s, selected, onSite }) {
  const e = ETATS[s.etatKey];
  return (
    <button className={`item ${selected ? 'sel' : ''}`} onClick={() => onSite(s)}>
      <CatIcon cat={s.cat} size={14} className="cat-ico lg" />
      <span><span className="nm">{s.nom}</span><span className="sub">{s.ville || 'Ville non renseignée'}</span></span>
      <span className="etat-mini" title={e.label}><Dot color={e.color} /></span>
    </button>
  );
}

/* Vue d'ensemble : les zones */
function ZoneList({ zones, visible, unplaced, onZone, onUnplaced }) {
  return (
    <div className="list">
      {zones.map(z => {
        const vs = visible.filter(s => s.zone === z.key);
        return (
          <button key={z.key} className="zone-item" style={{ '--c': z.color }} onClick={() => onZone(z)}>
            <i className="swatch"></i>
            <span className="zi-t"><span className="nm">Pôle {z.name}</span><span className="sub">{plural(z.communes.length, 'commune')}</span>
              <span className="mix">{Object.keys(CATEGORIES).map(k => {
                const n = vs.filter(s => s.cat === k).length;
                return n ? <span key={k} title={CATEGORIES[k].label}><CatIcon cat={k} size={11} />{n}</span> : null;
              })}</span>
            </span>
            <b className="count">{vs.length}</b>{ICON.chevron}
          </button>
        );
      })}
      {unplaced.length ? (
        <button className="zone-item muted" style={{ '--c': '#7f8db0' }} onClick={onUnplaced}>
          <i className="swatch"></i>
          <span className="zi-t"><span className="nm">Sans zone</span><span className="sub">Ville ou pôle non renseigné</span></span>
          <b className="count">{unplaced.length}</b>{ICON.chevron}
        </button>
      ) : null}
    </div>
  );
}

/* Vue d'une zone : ses infrastructures, regroupées par ville */
function ZoneSites({ list, site, onSite }) {
  if (!list.length) return <div className="list"><div className="empty">Aucune infrastructure pour ces filtres.</div></div>;
  const groups = {};
  list.forEach(s => (groups[s.ville || '—'] ??= []).push(s));
  return (
    <div className="list">
      {Object.entries(groups).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'fr')).map(([v, items]) => (
        <section key={v}>
          <h4>{v === '—' ? 'Ville non renseignée' : v}<span>{items.length}</span></h4>
          {items.map(s => <SiteItem key={s.id} s={s} selected={site?.id === s.id} onSite={onSite} />)}
        </section>
      ))}
    </div>
  );
}

export default function SidePanel({ ready, open, zones, zone, unplacedView, sites, visible, site, cats, etats, sync, spinning, onCats, onEtats, onZone, onUnplaced, onBack, onSite, onRefresh, onClose }) {
  const z = zones.find(x => x.key === zone);
  const unplaced = sites.filter(s => !s.zone);
  const pool = z ? z.sites : unplacedView ? unplaced : sites;
  const list = visible.filter(s => pool.includes(s));

  return (
    <aside className={`side glass${open ? ' open' : ''}`} id="side">
      <header>
        <button className="side-close" aria-label="Fermer la liste" onClick={onClose}>{ICON.close}</button>
        {z || unplacedView ? <>
          <button className="back" onClick={onBack}>{ICON.back}Toutes les zones</button>
          <h2 className="zone-title" style={{ '--c': z ? z.color : '#7f8db0' }}><i></i>{z ? `Pôle ${z.name}` : 'Sans zone'}</h2>
          {/* <p className="zone-sub">{plural(list.length, 'infrastructure')}{z ? ` · ${plural(z.communes.length, 'commune')}` : ''}</p> */}
        </> : <h2>Zones</h2>}
        {ready ? <Filters pool={pool} cats={cats} etats={etats} onCats={onCats} onEtats={onEtats} /> : null}
      </header>
      {!ready ? <div className="list"></div>
        : z || unplacedView ? <ZoneSites list={list} site={site} onSite={onSite} />
          : <ZoneList zones={zones} visible={visible} unplaced={unplaced.filter(s => visible.includes(s))} onZone={onZone} onUnplaced={onUnplaced} />}
      <footer>
        <span className={`sync${sync && !sync.live ? ' off' : ''}`}><i></i>
          <span>{!sync ? 'Synchronisation…' : sync.live ? `Données à jour · ${sync.time}` : 'Hors ligne · copie locale'}</span>
        </span>
        <button className={`iconbtn${spinning ? ' spin' : ''}`} title="Recharger les données" onClick={onRefresh}>{ICON.refresh}Actualiser</button>
      </footer>
    </aside>
  );
}
