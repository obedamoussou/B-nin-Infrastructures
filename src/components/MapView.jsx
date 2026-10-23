import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import L from '../lib/leaflet.js';
import { BASEMAPS, BENIN_BOUNDS } from '../lib/config.js';
import { CATEGORIES, ETATS, plural } from '../lib/utils.js';
import { glyphSvg } from './ui.jsx';

const esc = s => (s ?? '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const mobile = () => innerWidth < 760;

/* Marges pour que la zone visée ne passe pas sous les panneaux */
const padding = drawerOpen => mobile()
  ? { paddingTopLeft: [16, 130], paddingBottomRight: [16, drawerOpen ? innerHeight * .55 : 40] }
  : { paddingTopLeft: [370, 96], paddingBottomRight: [drawerOpen ? 480 : 40, 40] };

function siteIcon(s, selected) {
  const c = CATEGORIES[s.cat].color, e = ETATS[s.etatKey].color;
  return L.divIcon({
    className: 'site-mk',
    html: `<div class="pin${selected ? ' sel' : ''}" style="--c:${c}">${glyphSvg(s.cat, 13, 2.2)}<i style="background:${e}"></i></div>`,
    iconSize: [30, 30], iconAnchor: [15, 15]
  });
}

const MapView = forwardRef(function MapView({ zones, communes, zoneOfCommune, sites, zone, site, basemap, onZoneClick, onSiteClick, onBackground }, ref) {
  const el = useRef(null);
  const m = useRef({}); // objets Leaflet
  const live = useRef({});
  live.current = { zone, site, onZoneClick, onSiteClick, onBackground };

  /* ---------- création de la carte ---------- */
  useEffect(() => {
    const map = L.map(el.current, { zoomControl: false, minZoom: 6, maxZoom: 18, maxBounds: [[4.5, -1.5], [14, 6]], maxBoundsViscosity: .8, zoomSnap: .25 });
    L.control.zoom({ position: 'bottomright', zoomInTitle: 'Zoomer', zoomOutTitle: 'Dézoomer' }).addTo(map);
    map.fitBounds(BENIN_BOUNDS, padding(false));
    map.on('click', () => live.current.onBackground());
    const lp = map.createPane('labels');
    lp.style.zIndex = 450; lp.style.pointerEvents = 'none';

    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false, spiderfyOnMaxZoom: true, maxClusterRadius: 44,
      iconCreateFunction: c => {
        const n = c.getChildCount();
        return L.divIcon({ className: 'site-mk', html: `<div class="cluster"><b>${n}</b></div>`, iconSize: [38, 38], iconAnchor: [19, 19] });
      }
    });
    const labels = L.layerGroup().addTo(map);
    const communeLabels = L.layerGroup();
    m.current = { map, cluster, labels, communeLabels, markers: {} };

    // libellés des communes visibles seulement de près
    const onZoom = () => {
      const z = map.getZoom();
      el.current.classList.toggle('far', z < 8.5);
      if (z >= 9) communeLabels.addTo(map); else communeLabels.remove();
    };
    map.on('zoomend', onZoom); onZoom();

    return () => { map.remove(); m.current = {}; };
  }, []);

  /* ---------- fond de carte ---------- */
  useEffect(() => {
    const { map } = m.current;
    const b = BASEMAPS[basemap];
    const opts = { maxZoom: 19, maxNativeZoom: b.maxNativeZoom };
    const layer = L.tileLayer(b.url, { ...opts, attribution: b.attribution }).addTo(map);
    // noms de lieux au-dessus des zones
    const names = b.labels ? L.tileLayer(b.labels, { ...opts, pane: 'labels' }).addTo(map) : null;
    el.current.dataset.basemap = basemap;
    return () => { layer.remove(); names?.remove(); };
  }, [basemap]);

  /* ---------- zones et communes ---------- */
  useEffect(() => {
    const { map, labels } = m.current;
    if (!zones.length) return;
    const zoneStyle = z => {
      const cur = live.current.zone;
      const sel = cur === z.key, dim = cur && !sel;
      return { color: z.color, weight: sel ? 2.6 : 1.4, opacity: dim ? .35 : .9, fillColor: z.color, fillOpacity: sel ? .08 : dim ? .04 : .22 };
    };
    const zoneLayer = L.geoJSON(
      { type: 'FeatureCollection', features: zones.filter(z => z.geometry).map(z => ({ type: 'Feature', properties: { key: z.key }, geometry: z.geometry })) },
      {
        style: f => zoneStyle(zones.find(z => z.key === f.properties.key)),
        onEachFeature: (f, layer) => {
          const z = zones.find(x => x.key === f.properties.key);
          layer.bindTooltip(`<b>Pôle ${esc(z.name)}</b><span>${plural(z.sites.length, 'infrastructure')} · ${plural(z.communes.length, 'commune')}</span>`, { sticky: true, className: 'map-tip', direction: 'top', offset: [0, -8] });
          layer.on({
            mouseover: () => { if (live.current.zone !== z.key) layer.setStyle({ fillOpacity: live.current.zone ? .1 : .34 }); },
            mouseout: () => layer.setStyle(zoneStyle(z)),
            click: e => { L.DomEvent.stopPropagation(e); live.current.onZoneClick(z); }
          });
        }
      }
    ).addTo(map);

    const communeLayer = L.geoJSON({ type: 'FeatureCollection', features: communes }, {
      interactive: false,
      style: f => zoneOfCommune[f.key]
        ? { color: '#ffffff', weight: .6, opacity: .22, fill: false }
        : { color: '#ffffff', weight: .6, opacity: .22, fillColor: '#8a96ad', fillOpacity: .12, dashArray: '3 3' }
    }).addTo(map);

    labels.clearLayers();
    zones.forEach(z => {
      if (!z.geometry) return;
      L.marker([z.center.lat, z.center.lng], {
        icon: L.divIcon({ className: '', html: `<div class="zone-label" style="--c:${z.color}"><b>${esc(z.name)}</b><span>${z.sites.length}</span></div>`, iconSize: [0, 0] }),
        keyboard: false
      }).on('click', e => { L.DomEvent.stopPropagation(e); live.current.onZoneClick(z); }).addTo(labels);
    });

    m.current.zoneLayer = zoneLayer; m.current.zoneStyle = zoneStyle;
    return () => { zoneLayer.remove(); communeLayer.remove(); };
  }, [zones, communes, zoneOfCommune]);

  // mise à jour du style quand la zone sélectionnée change
  useEffect(() => {
    const { zoneLayer, zoneStyle, labels, communeLabels } = m.current;
    if (!zoneLayer) return;
    zoneLayer.eachLayer(l => l.setStyle(zoneStyle(zones.find(z => z.key === l.feature.properties.key))));
    el.current.classList.toggle('zoned', !!zone);
    labels.eachLayer(l => l.getElement()?.classList.toggle('hidden', !!zone));
    communeLabels.clearLayers();
    const z = zones.find(x => x.key === zone);
    (z ? z.communeFeatures : communes).forEach(f => {
      L.marker([f.center.lat, f.center.lng], { interactive: false, keyboard: false, icon: L.divIcon({ className: '', html: `<div class="commune-label">${esc(f.properties.name)}</div>`, iconSize: [0, 0] }) }).addTo(communeLabels);
    });
  }, [zone, zones, communes]);

  /* ---------- marqueurs des infrastructures ---------- */
  useEffect(() => {
    const { map, cluster } = m.current;
    cluster.clearLayers();
    const markers = {};
    sites.filter(s => s.pos).forEach(s => {
      const mk = L.marker([s.pos.lat, s.pos.lng], { icon: siteIcon(s, live.current.site?.id === s.id), riseOnHover: true, title: s.nom });
      mk.bindTooltip(`<b>${esc(s.nom)}</b><span>${esc(s.ville)} · ${esc(ETATS[s.etatKey].label)}</span>`, { className: 'map-tip', direction: 'top', offset: [0, -14] });
      mk.on('click', e => { L.DomEvent.stopPropagation(e); live.current.onSiteClick(s); });
      markers[s.id] = mk;
    });
    cluster.addLayers(Object.values(markers));
    if (!map.hasLayer(cluster)) cluster.addTo(map);
    m.current.markers = markers;
  }, [sites]);

  // marqueur sélectionné mis en avant
  useEffect(() => {
    const { markers } = m.current;
    Object.entries(markers).forEach(([id, mk]) => {
      const s = sites.find(x => x.id === id);
      if (s) mk.setIcon(siteIcon(s, site?.id === id));
      mk.setZIndexOffset(site?.id === id ? 1000 : 0);
    });
  }, [site, sites]);

  useImperativeHandle(ref, () => ({
    fitBenin(drawerOpen = false) { m.current.map.flyToBounds(BENIN_BOUNDS, { ...padding(drawerOpen), duration: .9 }); },
    fitZone(z, drawerOpen = false) {
      if (!z.geometry) return;
      m.current.map.flyToBounds(L.geoJSON(z.geometry).getBounds(), { ...padding(drawerOpen), duration: .9 });
    },
    fitCommune(f, drawerOpen = false) { m.current.map.flyToBounds(L.geoJSON(f).getBounds(), { ...padding(drawerOpen), duration: .9, maxZoom: 12 }); },
    flyToSite(s) {
      if (!s.pos) return;
      const { map } = m.current;
      // décale le point pour qu'il reste visible à côté de la fiche
      const zoom = 15;
      const pt = map.project([s.pos.lat, s.pos.lng], zoom);
      const shift = mobile() ? L.point(0, -innerHeight * .3) : L.point(-(480 - 370) / 2, 0);
      map.flyTo(map.unproject(pt.subtract(shift), zoom), zoom, { duration: 1.1 });
    }
  }), []);

  return <div id="map" ref={el}></div>;
});

export default MapView;
