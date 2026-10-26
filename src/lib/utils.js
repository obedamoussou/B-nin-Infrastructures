/* ---------- utilitaires ---------- */
export const norm = s => (s || '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
export const isTbd = v => !v || /^(a|à)\s*preciser$/i.test(v.normalize('NFD').replace(/[̀-ͯ]/g, '').trim()) || /^(n\/?a|-|—|nd|non\s*determine)$/i.test(v.normalize('NFD').replace(/[̀-ͯ]/g, '').trim());
export const plural = (n, word, many = word + 's') => `${n} ${n > 1 ? many : word}`;

export function parseCSV(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cur); cur = ''; }
    else if (c === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export function parseDate(v) {
  if (isTbd(v)) return null;
  const m = v.trim().match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if (m) { const y = +m[3] < 100 ? 2000 + +m[3] : +m[3]; return new Date(y, +m[2] - 1, +m[1]); }
  const iso = v.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(+iso[1], +iso[2] - 1, +iso[3]);
  return null;
}
export function fmtDate(v) {
  const d = parseDate(v);
  if (!d) return isTbd(v) ? null : v;
  return `${d.getDate() === 1 ? '1er' : d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
export function since(v) {
  const d = parseDate(v); if (!d) return '';
  const days = Math.round((Date.now() - d) / 864e5);
  if (days < -45) { const m = Math.round(-days / 30.4); return m < 12 ? `dans ${m} mois` : `dans ${plural(Math.round(m / 12), 'an')}`; }
  if (days < 0) return `dans ${plural(-days, 'jour')}`;
  if (days < 1) return "aujourd'hui";
  if (days < 45) return `il y a ${plural(days, 'jour')}`;
  const m = Math.round(days / 30.4);
  return m < 12 ? `il y a ${m} mois` : `il y a ${plural(Math.round(m / 12), 'an')}`;
}
export function fmtNum(v) {
  if (isTbd(v)) return null;
  const n = Number(v.toString().replace(/[\s  ]/g, '').replace(',', '.'));
  if (!isFinite(n)) return v;
  if (n >= 1e9) return (n / 1e9).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' Md FCFA';
  if (n >= 1e6) return (n / 1e6).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' M FCFA';
  return n.toLocaleString('fr-FR') + ' FCFA';
}
export const fullNum = v => { const n = Number((v || '').replace(/[\s  ]/g, '')); return isFinite(n) && n ? n.toLocaleString('fr-FR') + ' FCFA' : ''; };
export const link = v => !isTbd(v) && /^https?:\/\//i.test(v) ? v : null;

/* ---------- états des sites ---------- */
export const ETATS = {
  bon: { label: 'Bon', color: '#2fd08a', rank: 0 },
  satisfaisant: { label: 'Satisfaisant', color: '#9be15d', rank: 1 },
  moyen: { label: 'Moyen', color: '#f4c542', rank: 2 },
  mauvais: { label: 'Mauvais', color: '#ff7a59', rank: 3 },
  critique: { label: 'Critique', color: '#ff3b5c', rank: 4 },
  nd: { label: 'Non déterminé', color: '#7f8db0', rank: 5 }
};
export function etatOf(v) {
  const n = norm(v);
  if (!n || isTbd(v)) return 'nd';
  if (/^(bon|tresbon|excellent)/.test(n)) return 'bon';
  if (/^(satisf|correct|acceptable)/.test(n)) return 'satisfaisant';
  if (/^(moyen|passable|modere)/.test(n)) return 'moyen';
  if (/^(mauvais|degrade|vetuste)/.test(n)) return 'mauvais';
  if (/^(critique|ruine|tresmauvais|urgent)/.test(n)) return 'critique';
  return 'nd';
}

/* ---------- catégories d'infrastructures ---------- */
export const CATEGORIES = {
  monument: { label: 'Monuments et patrimoine', color: '#f4c542', icon: 'monument' },
  musee: { label: 'Musées', color: '#ff8a65', icon: 'musee' },
  hotel: { label: 'Infrastructures hôtelières', color: '#4f9dff', icon: 'hotel' },
  culture: { label: 'Infrastructures culturelles', color: '#c084fc', icon: 'culture' },
  autre: { label: 'Autres', color: '#9aa6bf', icon: 'autre' }
};
export function categoryOf(v) {
  const n = norm(v);
  if (/monument|patrimoine/.test(n)) return 'monument';
  if (/musee/.test(n)) return 'musee';
  if (/hotel|hebergement/.test(n)) return 'hotel';
  if (/cultur|spectacle|theatre|cinema/.test(n)) return 'culture';
  return 'autre';
}

/* ---------- statut des projets ---------- */
export function statusStyle(s) {
  const n = norm(s);
  if (/cours|actif|execution/.test(n)) return { background: 'rgba(47,208,138,.15)', color: '#7ff0bc' };
  if (/termine|cloture|acheve|livre/.test(n)) return { background: 'rgba(109,139,214,.18)', color: '#b3c6f5' };
  if (/prepar|etude|attente|planifi|negoc/.test(n)) return { background: 'rgba(244,197,66,.15)', color: '#f8d97a' };
  if (/suspend|annul|arret/.test(n)) return { background: 'rgba(255,122,89,.15)', color: '#ffab95' };
  return { background: 'rgba(255,255,255,.07)', color: 'var(--muted)' };
}
