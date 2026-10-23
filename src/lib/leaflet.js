/* Leaflet + regroupement des marqueurs.
   leaflet.markercluster s'appuie sur la variable globale L : elle doit exister avant son chargement. */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';

window.L = L;
await import('leaflet.markercluster');

export default L;
