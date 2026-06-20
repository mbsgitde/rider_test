const APP = {
  map: null,
  routeLayerGroup: null,
  charts: [],
  colors: ['#14b8a6', '#f59e0b', '#8b5cf6', '#84cc16', '#ec4899', '#06b6d4', '#f97316'],
  state: { config: null, stages: [], stops: [], routeName: null, routeLabel: null, routesManifest: [], selectedStageId: null, rawGpxText: '', activeRouteMeta: null },
  baseLayers: {},
  currentBaseLayer: null,
  mapStyleControl: null,
  stageNumberMarkers: []
};

const stageChartHoverGuidePlugin = {
  id: 'stageChartHoverGuide',
  afterDatasetsDraw(chart) {
    const tooltip = chart.tooltip;
    if (!tooltip || tooltip.opacity === 0 || !tooltip.dataPoints?.length) return;
    const ctx = chart.ctx;
    const point = tooltip.dataPoints[0].element;
    if (!point) return;
    const x = point.x;
    const y = point.y;
    const bottomY = chart.scales.y.bottom;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, bottomY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(17,24,39,0.45)';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = chart.data.datasets[0].borderColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();
  }
};
Chart.register(stageChartHoverGuidePlugin);

document.addEventListener('DOMContentLoaded', async () => {
  APP.map = L.map('map').setView([47.2, 13.0], 7);
  APP.baseLayers = {
    Standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap-Mitwirkende' }),
    Humanitarian: L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap-Mitwirkende, HOT' }),
    Topografisch: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap-Mitwirkende, OpenTopoMap' })
  };
  APP.currentBaseLayer = APP.baseLayers.Humanitarian;
  APP.currentBaseLayer.addTo(APP.map);
  APP.routeLayerGroup = L.featureGroup().addTo(APP.map);
  setupMapMaximizeControl();
  document.getElementById('loadBtn').addEventListener('click', loadTour);
  document.getElementById('downloadFullGpxBtn').addEventListener('click', downloadFullGpx);
  document.getElementById('downloadAllStagesZipBtn').addEventListener('click', downloadAllStagesZip);
  document.getElementById('downloadTourBriefBtn').addEventListener('click', downloadTourBrief);
  document.getElementById('downloadActiveStageBtn').addEventListener('click', downloadActiveStage);
  document.getElementById('resetStageFocusBtn').addEventListener('click', resetStageFocus);
  document.getElementById('prevStageBtn').addEventListener('click', () => moveStageFocus(-1));
  document.getElementById('nextStageBtn').addEventListener('click', () => moveStageFocus(1));
  await initializeApp();
});

function setStatus(text) {
  const el = document.getElementById('status');
  if (el) el.textContent = text;
}

async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Fehler beim Laden von ${path}: ${res.status}`);
  return res.json();
}

async function loadText(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Fehler beim Laden von ${path}: ${res.status}`);
  return res.text();
}

function formatHoursHm(hours) {
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const hh = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const mm = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDurationWithUnit(hours) {
  return `${formatHoursHm(hours)} h`;
}

function todayStamp() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function sanitizeFilenamePart(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function getRouteFileBase() {
  const route = sanitizeFilenamePart(APP.state.routeLabel || APP.state.routeName || 'tour');
  return `${route || 'tour'}-${todayStamp()}`;
}

function normalizeCompatLabel(value, maxLen = 42) {
  const cleaned = sanitizeFilenamePart(value).replace(/-/g, '_');
  return cleaned.slice(0, maxLen) || 'etappe';
}

function buildCompatibleStageBase(stage) {
  const stageNo = String(stage.id).padStart(2, '0');
  const routeBaseShort = normalizeCompatLabel(APP.state.routeLabel || APP.state.routeName || 'tour', 18);
  const stageNameShort = normalizeCompatLabel(stage.name || `etappe_${stageNo}`, 34);
  return `${routeBaseShort}_${stageNo}_${stageNameShort}`;
}

function getSelectedStage() {
  return APP.state.stages.find(stage => stage.id === APP.state.selectedStageId) || null;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function gpxFromPoints(points, name) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<gpx version="1.1" creator="M365 Copilot" xmlns="http://www.topografix.com/GPX/1/1">', `<trk><name>${escapeXml(name)}</name><trkseg>`];
  points.forEach(p => lines.push(`<trkpt lat="${Number(p.lat).toFixed(6)}" lon="${Number(p.lon).toFixed(6)}"><ele>${Number(p.ele || 0).toFixed(1)}</ele></trkpt>`));
  lines.push('</trkseg></trk>', '</gpx>');
  return lines.join('\n');
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadText(contentOrBlob, filename, mimeType='application/gpx+xml;charset=utf-8') {
  const blob = contentOrBlob instanceof Blob ? contentOrBlob : new Blob([contentOrBlob], { type: mimeType });
  triggerBlobDownload(blob, filename);
}

function buildStageFilename(stage) {
  return `${getRouteFileBase()}-${buildCompatibleStageBase(stage)}.gpx`;
}

function buildFullRouteFilename() {
  return `${getRouteFileBase()}-gesamt.gpx`;
}

function buildTourBriefText() {
  const hotels = APP.state.stops.filter(s => s.type === 'overnight');
  const start = APP.state.stops.find(s => s.type === 'start');
  const end = APP.state.stops.find(s => s.type === 'end');
  const totalDistance = APP.state.stages.reduce((a, s) => a + s.dist, 0);
  const totalNet = APP.state.stages.reduce((a, s) => a + s.netRideTimeHours, 0);
  const totalGross = APP.state.stages.reduce((a, s) => a + s.grossRideTimeHours, 0);
  const lines = [
    `Tour-Steckbrief`,
    `Route: ${APP.state.routeLabel || APP.state.routeName || 'Tour'}`,
    `Erstellt: ${todayStamp()}`,
    `Etappen: ${APP.state.stages.length}`,
    `Gesamtdistanz: ${totalDistance.toFixed(1)} km`,
    `Netto-Fahrzeit: ${formatDurationWithUnit(totalNet)}`,
    `Brutto-Fahrzeit: ${formatDurationWithUnit(totalGross)}`,
    '',
    `Offizielle Beschreibung: ${APP.state.activeRouteMeta?.officialDescriptionUrl || 'nicht hinterlegt'}`,
    `ADFC-Sterne: ${APP.state.activeRouteMeta?.adfcStars ?? 'nicht hinterlegt'}`,
    `ADFC-Link: ${APP.state.activeRouteMeta?.adfcTourUrl || 'nicht hinterlegt'}`,
    '',
    `Anreise: ${start ? `${start.name} | ${start.meetingPoint || '-'} | ${start.departureTime || '-'} | ${start.arrivalTime || '-'}` : 'nicht hinterlegt'}`,
    `Rückreise: ${end ? `${end.name} | ${end.meetingPoint || '-'} | ${end.departureTime || '-'} | ${end.arrivalTime || '-'}` : 'nicht hinterlegt'}`,
    '',
    'Hotels:',
    ...(hotels.length ? hotels.map(h => `- ${h.name}${h.hotelUrl ? ` | ${h.hotelUrl}` : ''}`) : ['- keine Hotels hinterlegt'])
  ];
  return lines.join('\n');
}

function downloadTourBrief() {
  downloadText(buildTourBriefText(), `${getRouteFileBase()}-tour-steckbrief.txt`, 'text/plain;charset=utf-8');
}

function downloadFullGpx() {
  if (!APP.state.rawGpxText) return;
  downloadText(APP.state.rawGpxText, buildFullRouteFilename());
}

function downloadStageGpx(stage) {
  downloadText(gpxFromPoints(stage.seg, buildCompatibleStageBase(stage)), buildStageFilename(stage));
}

function downloadActiveStage() {
  const stage = getSelectedStage();
  if (stage) downloadStageGpx(stage);
}

function formatTransferLine(t) {
  return `${t.label}${t.arrivalTime || t.departureTime ? ` (${t.arrivalTime || '-'} / ${t.departureTime || '-'})` : ''}`;
}

function buildZipReadmeText() {
  const hotels = APP.state.stops.filter(s => s.type === 'overnight');
  const start = APP.state.stops.find(s => s.type === 'start');
  const end = APP.state.stops.find(s => s.type === 'end');
  const files = [buildFullRouteFilename(), ...APP.state.stages.map(stage => buildStageFilename(stage))];
  const lines = [
    `Route: ${APP.state.routeLabel || APP.state.routeName || 'Tour'}`,
    `Erstellt: ${todayStamp()}`,
    `Anzahl Etappen: ${APP.state.stages.length}`,
    '',
    'Beschreibung & Klassifizierung',
    `Offizieller Radwegelink: ${APP.state.activeRouteMeta?.officialDescriptionUrl || 'kein Link hinterlegt'}`,
    `ADFC-Sterne: ${APP.state.activeRouteMeta?.adfcStars ?? 'kein Wert hinterlegt'}`,
    `ADFC-Tour-Link: ${APP.state.activeRouteMeta?.adfcTourUrl || 'kein Link hinterlegt'}`,
    '',
    'Anreise',
    start ? `${start.name} | Treffpunkt: ${start.meetingPoint || '-'} | Abfahrt: ${start.departureTime || '-'} | Ankunft: ${start.arrivalTime || '-'}` : 'kein Start hinterlegt',
    ...(start?.transfers?.length ? ['Umstiege:', ...start.transfers.map(t => `- ${formatTransferLine(t)}`)] : []),
    ...(start?.reservedSeats?.length ? [`Sitzplätze: ${start.reservedSeats.join(', ')}`] : []),
    ...(start?.reservedBikeSpots?.length ? [`Radplätze: ${start.reservedBikeSpots.join(', ')}`] : []),
    '',
    'Hotels',
    ...(hotels.length ? hotels.map(h => `${h.name}${h.hotelUrl ? ` | ${h.hotelUrl}` : ''}`) : ['keine Hotels hinterlegt']),
    '',
    'Rückreise',
    end ? `${end.name} | Treffpunkt: ${end.meetingPoint || '-'} | Abfahrt: ${end.departureTime || '-'} | Ankunft: ${end.arrivalTime || '-'}` : 'kein Ziel hinterlegt',
    ...(end?.transfers?.length ? ['Umstiege:', ...end.transfers.map(t => `- ${formatTransferLine(t)}`)] : []),
    ...(end?.reservedSeats?.length ? [`Sitzplätze: ${end.reservedSeats.join(', ')}`] : []),
    ...(end?.reservedBikeSpots?.length ? [`Radplätze: ${end.reservedBikeSpots.join(', ')}`] : []),
    '',
    'Enthaltene GPX-Dateien',
    ...files.map(name => `- ${name}`),
    '',
    'Dateinamen und interne GPX-Tracknamen sind für Garmin/Komoot kompatibel vereinfacht.'
  ];
  return lines.join('\n');
}

async function downloadAllStagesZip() {
  if (typeof JSZip === 'undefined') {
    setStatus('ZIP-Download ist aktuell nicht verfügbar.');
    return;
  }
  setStatus('Erzeuge ZIP mit Gesamtstrecke und Etappen ...');
  const zip = new JSZip();
  zip.file(buildFullRouteFilename(), APP.state.rawGpxText || '');
  APP.state.stages.forEach(stage => zip.file(buildStageFilename(stage), gpxFromPoints(stage.seg, buildCompatibleStageBase(stage))));
  zip.file('README.txt', buildZipReadmeText());
  zip.file(`${getRouteFileBase()}-tour-steckbrief.txt`, buildTourBriefText());
  const blob = await zip.generateAsync({ type: 'blob' });
  triggerBlobDownload(blob, `${getRouteFileBase()}-gesamt-und-etappen.zip`);
  setStatus('ZIP-Download gestartet');
}

function updateTopMetaBar(routeMeta) {
  const tourismCard = document.getElementById('tourismMetaCard');
  const tourismContent = document.getElementById('tourismMetaContent');
  const tourismTitle = tourismCard?.querySelector('.title');
  const adfcCard = document.getElementById('adfcMetaCard');
  const adfcLink = document.getElementById('adfcTourLinkInline');
  const adfcStarsEl = document.getElementById('adfcStarsInline');
  const adfcTitle = adfcCard?.querySelector('.title');
  const hasTourism = !!routeMeta?.officialDescriptionUrl;
  tourismCard.classList.toggle('hidden', !hasTourism);
  if (tourismTitle) tourismTitle.innerHTML = hasTourism ? `<a class="meta-title-link" href="${routeMeta.officialDescriptionUrl}" target="_blank" rel="noopener noreferrer">🔗 Offizielle Beschreibung</a>` : '🔗 Offizielle Beschreibung';
  if (tourismContent) tourismContent.innerHTML = '';
  const hasValidStars = Number.isInteger(routeMeta?.adfcStars) && routeMeta.adfcStars >= 1 && routeMeta.adfcStars <= 5;
  const stars = hasValidStars ? `${'★'.repeat(routeMeta.adfcStars)}${'☆'.repeat(5 - routeMeta.adfcStars)}` : '';
  const hasAdfcInfo = (!!routeMeta?.adfcTourUrl) || hasValidStars;
  adfcCard.classList.toggle('hidden', !hasAdfcInfo);
  if (adfcTitle) {
    const label = `${stars ? `<span class="star-row">${stars}</span> ` : ''}ADFC`;
    adfcTitle.innerHTML = routeMeta?.adfcTourUrl ? `<a class="meta-title-link" href="${routeMeta.adfcTourUrl}" target="_blank" rel="noopener noreferrer">${label}</a>` : label;
  }
  if (adfcStarsEl) adfcStarsEl.innerHTML = '';
  if (adfcLink) { adfcLink.classList.add('hidden'); adfcLink.removeAttribute('href'); }
}

function setupMapMaximizeControl() {
  const MaximizeControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd() {
      const container = L.DomUtil.create('div', 'leaflet-control map-maximize-control');
      const button = L.DomUtil.create('button', 'map-maximize-btn', container);
      button.type = 'button';
      button.title = 'Karte maximieren';
      button.setAttribute('aria-label', 'Karte maximieren');
      button.innerHTML = '⛶';
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      L.DomEvent.on(button, 'click', () => toggleMapMaximized(button));
      return container;
    }
  });
  APP.map.addControl(new MaximizeControl());
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.getElementById('map')?.classList.contains('map-maximized')) {
      toggleMapMaximized(document.querySelector('.map-maximize-btn'), false);
    }
  });
}

function toggleMapMaximized(button, forceState) {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  const shouldMaximize = typeof forceState === 'boolean' ? forceState : !mapEl.classList.contains('map-maximized');
  mapEl.classList.toggle('map-maximized', shouldMaximize);
  document.body.classList.toggle('map-is-maximized', shouldMaximize);
  if (button) {
    button.innerHTML = shouldMaximize ? '×' : '⛶';
    button.title = shouldMaximize ? 'Karte schließen' : 'Karte maximieren';
    button.setAttribute('aria-label', shouldMaximize ? 'Karte schließen' : 'Karte maximieren');
  }
  setTimeout(() => APP.map?.invalidateSize(), 150);
}

async function initializeApp() {
  APP.state.config = await loadJSON('data/config.json');
  APP.colors = APP.state.config.visuals?.stageColors || APP.colors;
  const logisticsColor = APP.state.config.visuals?.logisticsMarkerColor;
  if (logisticsColor) document.documentElement.style.setProperty('--logistics-marker', logisticsColor);
  setupMapStyleOverlay(APP.state.config.mapView?.availableBaseMaps || ['Standard', 'Humanitarian', 'Topografisch'], APP.state.config.mapView?.defaultBaseMap || 'Humanitarian');
  await loadRoutesManifest();
  setStatus('Anwendung bereit');
  await loadTour();
}

function setupMapStyleOverlay(styles, defaultStyle) {
  const MapStyleControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd() {
      const container = L.DomUtil.create('div', 'map-style-control leaflet-control');
      container.innerHTML = '<button class="map-style-toggle" type="button" aria-expanded="false">🗺 Kartenansicht</button><div class="map-style-menu" aria-hidden="true"></div>';
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      const toggle = container.querySelector('.map-style-toggle');
      const menu = container.querySelector('.map-style-menu');
      styles.forEach(style => {
        if (!APP.baseLayers[style]) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'map-style-item';
        btn.textContent = style;
        btn.dataset.styleName = style;
        btn.addEventListener('click', () => {
          switchBaseMap(style);
          menu.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
          menu.setAttribute('aria-hidden', 'true');
        });
        menu.appendChild(btn);
      });
      toggle.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        menu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      });
      APP.mapStyleControl = container;
      return container;
    }
  });
  APP.map.addControl(new MapStyleControl());
  switchBaseMap(defaultStyle);
}

function switchBaseMap(styleName) {
  if (!APP.baseLayers[styleName]) return;
  if (APP.currentBaseLayer) APP.map.removeLayer(APP.currentBaseLayer);
  APP.currentBaseLayer = APP.baseLayers[styleName];
  APP.currentBaseLayer.addTo(APP.map);
  if (!APP.mapStyleControl) return;
  APP.mapStyleControl.querySelectorAll('.map-style-item').forEach(item => item.classList.toggle('active', item.dataset.styleName === styleName));
}

async function loadRoutesManifest() {
  APP.state.routesManifest = (await loadJSON('data/routes.json')).filter(r => r.hasStopsFile !== false);
  const select = document.getElementById('routeSelect');
  select.innerHTML = '';
  APP.state.routesManifest.forEach(route => {
    const option = document.createElement('option');
    option.value = route.id;
    option.textContent = route.label;
    select.appendChild(option);
  });
}

async function loadGPX(routeName) {
  const routeMeta = APP.state.routesManifest.find(r => r.id === routeName) || {};
  const text = await loadText(`gpx/${routeMeta.gpxFile || `${routeName}.gpx`}`);
  APP.state.rawGpxText = text;
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  const ns = 'http://www.topografix.com/GPX/1/1';
  const points = Array.from(xml.getElementsByTagNameNS(ns, 'trkpt')).map(pt => ({ lat: parseFloat(pt.getAttribute('lat')), lon: parseFloat(pt.getAttribute('lon')), ele: parseFloat(pt.getElementsByTagNameNS(ns, 'ele')[0]?.textContent || '0') }));
  APP.state.gpxTrackPoints = points;
  APP.state.gpxWaypoints = Array.from(xml.getElementsByTagNameNS(ns, 'wpt')).map(wpt => ({ name: wpt.getElementsByTagNameNS(ns, 'name')[0]?.textContent?.trim() || '', sym: wpt.getElementsByTagNameNS(ns, 'sym')[0]?.textContent?.trim() || '', lat: parseFloat(wpt.getAttribute('lat')), lon: parseFloat(wpt.getAttribute('lon')) })).filter(wpt => Number.isFinite(wpt.lat) && Number.isFinite(wpt.lon));
  return points;
}

function haversine(a, b) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function isValidLatLon(lat, lon) { return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180; }
function parseGoogleMapsCoordinates(url) {
  if (!url || typeof url !== 'string') return null;
  const variants = [url]; try { variants.push(decodeURIComponent(url)); } catch (e) {}
  for (const text of variants) {
    const patterns = [/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)(?:[,/z?&]|$)/i, /[?&](?:query|q|ll|center)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)(?:[&]|$)/i, /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/i, /!2d(-?\d+(?:\.\d+)?)!3d(-?\d+(?:\.\d+)?)/i];
    for (const pattern of patterns) { const match = text.match(pattern); if (!match) continue; let lat, lon; if (pattern.source.startsWith('!2d')) { lon = parseFloat(match[1]); lat = parseFloat(match[2]); } else { lat = parseFloat(match[1]); lon = parseFloat(match[2]); } if (isValidLatLon(lat, lon)) return { lat, lon }; }
  }
  return null;
}
function normalizeMatchName(value) { return String(value || '').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/(hotel|gasthof|landhotel|bahnhof|hbf|restaurant|pension|hostel|garni|am|an|der|die|das|zum|zur)/g,' ').replace(/[^a-z0-9]+/g,' ').trim(); }
function levenshteinDistance(a, b) { const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0)); for (let i=0;i<=a.length;i++) dp[i][0]=i; for (let j=0;j<=b.length;j++) dp[0][j]=j; for (let i=1;i<=a.length;i++) for (let j=1;j<=b.length;j++) { const cost=a[i-1]===b[j-1]?0:1; dp[i][j]=Math.min(dp[i-1][j]+1, dp[i][j-1]+1, dp[i-1][j-1]+cost); } return dp[a.length][b.length]; }
function waypointSimilarity(a, b) { const na=normalizeMatchName(a); const nb=normalizeMatchName(b); if (!na || !nb) return 0; if (na===nb) return 1; if (na.includes(nb) || nb.includes(na)) return 0.92; return 1 - levenshteinDistance(na, nb) / Math.max(na.length, nb.length); }
function findBestWaypointMatch(stop, waypoints) { const wanted = stop.matchName || stop.waypointName || stop.name; let best = null; for (const waypoint of waypoints || []) { const score = waypointSimilarity(wanted, waypoint.name); if (!best || score > best.score) best = { waypoint, score }; } const threshold = typeof stop.matchThreshold === 'number' ? stop.matchThreshold : 0.82; return best && best.score >= threshold ? best : null; }
async function resolveStopCoordinates(stop) {
  if (typeof stop.lat === 'number' && typeof stop.lon === 'number') return { lat: stop.lat, lon: stop.lon, source: 'json' };
  const parsed = parseGoogleMapsCoordinates(stop.googleMapsUrl || stop.googleUrl || stop.mapsUrl || stop.googleMapsLink); if (parsed) return { ...parsed, source: 'googleMapsUrl' };
  const match = findBestWaypointMatch(stop, APP.state.gpxWaypoints || []); if (match) { console.info(`Waypoint-Match: ${stop.name} → ${match.waypoint.name} (${Math.round(match.score * 100)}%)`); return { lat: match.waypoint.lat, lon: match.waypoint.lon, source: 'gpxWaypoint', waypointName: match.waypoint.name, matchScore: match.score }; }
  if (stop.type === 'start' && APP.state.gpxTrackPoints?.length) { const first = APP.state.gpxTrackPoints[0]; return { lat: first.lat, lon: first.lon, source: 'firstTrackPoint' }; }
  if (stop.type === 'end' && APP.state.gpxTrackPoints?.length) { const last = APP.state.gpxTrackPoints[APP.state.gpxTrackPoints.length - 1]; return { lat: last.lat, lon: last.lon, source: 'lastTrackPoint' }; }
  return null;
}

function findNearestTrackPoint(stopCoords, points) {
  let minDistance = Infinity, minIndex = 0;
  points.forEach((p, i) => {
    const d = haversine(stopCoords, p);
    if (d < minDistance) { minDistance = d; minIndex = i; }
  });
  return { index: minIndex, distanceToRouteKm: minDistance };
}

function getPlausibilityLevel(distanceKm, cfg) {
  if (distanceKm >= cfg.distanceFromRouteCriticalThresholdKm) return 'critical';
  if (distanceKm >= cfg.distanceFromRouteWarningThresholdKm) return 'warning';
  if (distanceKm >= cfg.distanceFromRouteInfoThresholdKm) return 'info';
  return null;
}

function getPlausibilityMessage(distanceKm, level) {
  const rounded = distanceKm.toFixed(1);
  if (level === 'critical') return `Kritisch: Unterkunft liegt nicht plausibel auf der geplanten Route (ca. ${rounded} km).`;
  if (level === 'warning') return `Warnung: Unterkunft liegt deutlich neben der Route (ca. ${rounded} km).`;
  if (level === 'info') return `Hinweis: Unterkunft liegt etwa ${rounded} km neben der Route.`;
  return '';
}

function midpointOfSegment(seg) {
  if (!seg?.length) return null;
  const p = seg[Math.floor(seg.length / 2)];
  return [p.lat, p.lon];
}

function cleanStagePlaceName(value) { if (!value) return ''; return String(value).replace(/(Hotel|Gasthof|Landhotel|Pension|Hostel|Garni|Bahnhof|Hbf)/gi, '').replace(/\s+/g, ' ').trim(); }
function getStopStagePlace(stop) { if (!stop) return ''; if (stop.stagePlace) return stop.stagePlace; if (stop.place) return stop.place; if (stop.city) return stop.city; if (stop.town) return stop.town; if (stop.type === 'overnight') { const address = String(stop.address || '').trim(); if (address) return address.split(',')[0].trim(); const cleaned = cleanStagePlaceName(stop.name); if (cleaned) return cleaned; } return stop.name; }

function buildStages(points, stops, config) {
  const steepThreshold = config.profileView?.steepSectionThresholdPercent ?? 8;
  const stages = [];
  for (let i = 0; i < stops.length - 1; i++) {
    let startIndex = stops[i].trackIndex;
    let endIndex = stops[i + 1].trackIndex;
    if (endIndex <= startIndex) endIndex = Math.min(startIndex + 1, points.length - 1);
    const seg = points.slice(startIndex, endIndex + 1);
    let dist = 0, up = 0, down = 0;
    const profilePoints = [{ distanceKm: 0, upMeters: 0, netRideTimeHours: 0, elevation: seg[0]?.ele ?? 0, gradePct: 0 }];
    const steepPoints = [];
    let cumulativeDist = 0, cumulativeUp = 0;
    for (let j = 1; j < seg.length; j++) {
      const stepDist = haversine(seg[j - 1], seg[j]);
      dist += stepDist;
      cumulativeDist += stepDist;
      const diff = seg[j].ele - seg[j - 1].ele;
      if (diff > 0) { up += diff; cumulativeUp += diff; } else down += Math.abs(diff);
      const gradePct = stepDist > 0 ? (diff / (stepDist * 1000)) * 100 : 0;
      profilePoints.push({ distanceKm: cumulativeDist, upMeters: cumulativeUp, netRideTimeHours: 0, elevation: seg[j].ele, gradePct });
    }
    const timing = config.timing;
    const avgSpeed = Math.max(timing.minimumCyclingSpeedKmh, timing.baseCyclingSpeedKmh - (up / 1000) * timing.climbSpeedReductionPer1000mKmh);
    for (let j = 1; j < profilePoints.length; j++) {
      profilePoints[j].netRideTimeHours = profilePoints[j].distanceKm / avgSpeed;
      if (Math.abs(profilePoints[j].gradePct) >= steepThreshold) steepPoints.push({ x: profilePoints[j].distanceKm, y: profilePoints[j].elevation });
    }
    const netRideTimeHours = dist / avgSpeed;
    const shortBreakMinutes = netRideTimeHours * timing.shortBreakMinutesPerHour;
    const totalPauseMinutes = shortBreakMinutes + timing.longBreakMinutesPerStage;
    const grossRideTimeHours = netRideTimeHours + totalPauseMinutes / 60;
    let difficulty = 'Schwer';
    if (dist < 60 && up < 800) difficulty = 'Leicht';
    else if (dist < 100 && up < 1500) difficulty = 'Mittel';
    const color = APP.colors[i % APP.colors.length];
    const hotel = stops[i + 1].type === 'overnight' ? stops[i + 1] : null;
    const plausibilityLevel = hotel ? getPlausibilityLevel(hotel.distanceToRouteKm, config.routePlausibilityCheck) : null;
    const plausibilityMessage = hotel ? getPlausibilityMessage(hotel.distanceToRouteKm, plausibilityLevel) : '';
    stages.push({ id: i + 1, name: `${getStopStagePlace(stops[i])} → ${getStopStagePlace(stops[i + 1])}`, seg, dist, up, down, netRideTimeHours, grossRideTimeHours, totalPauseMinutes, difficulty, color, hotel, plausibilityLevel, plausibilityMessage, profilePoints, steepPoints, midpointLatLng: midpointOfSegment(seg), polyline: null, bounds: null, marker: null, element: null, remainingTotalHours: netRideTimeHours, remainingTotalDistanceKm: dist });
  }
  return stages;
}

function getDifficultyBadgeClass(difficulty) {
  if (difficulty === 'Leicht') return 'badge-ski-blue';
  if (difficulty === 'Mittel') return 'badge-ski-red';
  return 'badge-ski-black';
}

function destroyCharts() {
  APP.charts.forEach(ch => { try { ch.destroy(); } catch (e) {} });
  APP.charts = [];
}

function ensureProfileTooltip(wrapper) {
  let tooltip = wrapper.querySelector('.chart-hover-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'chart-hover-tooltip hidden';
    wrapper.appendChild(tooltip);
  }
  return tooltip;
}

function renderChart(canvasId, stage) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const wrapper = canvas.parentElement;
  const tooltipEl = ensureProfileTooltip(wrapper);
  const maxKm = stage.profilePoints.length ? stage.profilePoints[stage.profilePoints.length - 1].distanceKm : 0;
  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [
        { data: stage.profilePoints.map(p => ({ x: p.distanceKm, y: p.elevation })), borderColor: stage.color, backgroundColor: `${stage.color}33`, fill: true, tension: 0.25, pointRadius: 0, pointHoverRadius: 5, pointHoverBackgroundColor: stage.color, pointHoverBorderColor: '#ffffff', pointHoverBorderWidth: 2, borderWidth: 2 },
        { type: 'scatter', data: stage.steepPoints, showLine: false, pointRadius: 3, pointHoverRadius: 4, pointBackgroundColor: '#b91c1c', pointBorderColor: '#ffffff', pointBorderWidth: 1.5 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      interaction: { mode: 'nearest', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external(context) {
            const tooltipModel = context.tooltip;
            if (!tooltipModel || tooltipModel.opacity === 0 || !tooltipModel.dataPoints?.length) { tooltipEl.classList.add('hidden'); return; }
            const idx = tooltipModel.dataPoints[0].dataIndex;
            const p = stage.profilePoints[idx];
            const remainingKm = Math.max(0, stage.remainingTotalDistanceKm - p.distanceKm);
            const remainingHours = Math.max(0, stage.remainingTotalHours - p.netRideTimeHours);
            tooltipEl.innerHTML = `<div><strong>${p.distanceKm.toFixed(1)} km</strong></div><div>Dauer: ${formatDurationWithUnit(p.netRideTimeHours)}</div><div>Rest: ${remainingKm.toFixed(1)} km</div><div>Restzeit: ${formatDurationWithUnit(remainingHours)}</div><div>bergauf: ${Math.round(p.upMeters)} m</div><div>Höhe: ${Math.round(p.elevation)} m</div>`;
            tooltipEl.classList.remove('hidden');
            tooltipEl.style.left = `${tooltipModel.caretX}px`;
            tooltipEl.style.top = `${tooltipModel.caretY}px`;
          }
        }
      },
      scales: {
        x: { type: 'linear', title: { display: true, text: 'Distanz (km)' }, min: 0, max: maxKm, ticks: { callback: value => `${Number(value).toFixed(0)} km` } },
        y: { title: { display: true, text: 'Höhe (m)' } }
      }
    }
  });
  APP.charts.push(chart);
}

function renderSummary(stages, routeLabel) {
  const totalDistance = stages.reduce((a, s) => a + s.dist, 0);
  const totalUp = stages.reduce((a, s) => a + s.up, 0);
  const totalDown = stages.reduce((a, s) => a + s.down, 0);
  const totalNet = stages.reduce((a, s) => a + s.netRideTimeHours, 0);
  const totalGross = stages.reduce((a, s) => a + s.grossRideTimeHours, 0);
  document.getElementById('summary').innerHTML = `<div class="summary-card"><div class="label">Route</div><div class="value">${routeLabel}</div></div><div class="summary-card"><div class="label">Etappen</div><div class="value">${stages.length}</div></div><div class="summary-card"><div class="label">Gesamtdistanz</div><div class="value">${totalDistance.toFixed(1)} km</div></div><div class="summary-card"><div class="label">Höhenmeter</div><div class="value">↑ ${Math.round(totalUp)} / ↓ ${Math.round(totalDown)}</div></div><div class="summary-card"><div class="label">Netto-Fahrzeit</div><div class="value">${formatDurationWithUnit(totalNet)}</div></div><div class="summary-card"><div class="label">Brutto-Fahrzeit</div><div class="value">${formatDurationWithUnit(totalGross)}</div></div>`;
}

function formatTransfers(transfers) {
  if (!Array.isArray(transfers) || !transfers.length) return '';
  return `<div><strong>Umstiege:</strong></div><ul>${transfers.slice(0, 3).map(t => `<li>${t.label}${t.arrivalTime || t.departureTime ? ` (${t.arrivalTime || '-'} / ${t.departureTime || '-'})` : ''}</li>`).join('')}</ul>`;
}

function formatReservationPills(values) {
  if (!Array.isArray(values) || !values.length) return '';
  return `<div class="pill-list">${values.slice(0, 10).map(v => `<span class="pill">${v}</span>`).join('')}</div>`;
}

function renderStationBox(stops) { const mount = document.getElementById('stationBox'); if (mount) mount.innerHTML = ''; }
function renderHotelCard(hotel) { if (!hotel) return ''; return `<aside class="hotel-between-stages" data-stop-name="${hotel.name}"><div class="overview-card hotel-stage-card compact-logistics-card"><div class="compact-card-head"><div class="title">🏨 Übernachtung: ${hotel.name}</div>${hotel.hotelUrl ? `<a class="hotel-link" href="${hotel.hotelUrl}" target="_blank" rel="noopener noreferrer">Hotel öffnen</a>` : ''}${hotel.googleMapsUrl ? `<a class="hotel-link" href="${hotel.googleMapsUrl}" target="_blank" rel="noopener noreferrer">Maps</a>` : ''}</div><div class="overview-list compact-info-line">${hotel.address ? `<span>${hotel.address}</span>` : ''}${hotel.notes ? `<span class="muted">${hotel.notes}</span>` : ''}</div></div></aside>`; }
function renderTransferDetails(stop) { if (!Array.isArray(stop.transfers) || !stop.transfers.length) return ''; return `<details class="compact-details transfer-details"><summary>↔ Umstiege (${stop.transfers.length})</summary><ul>${stop.transfers.map(t => `<li>${t.label}${t.arrivalTime || t.departureTime ? ` (${t.arrivalTime || '-'} / ${t.departureTime || '-'})` : ''}</li>`).join('')}</ul></details>`; }
function renderReservationInline(stop) { const rows = []; if (Array.isArray(stop.reservedSeats) && stop.reservedSeats.length) rows.push(`<span class="reservation-group"><strong>Sitz:</strong>${formatReservationPills(stop.reservedSeats)}</span>`); if (Array.isArray(stop.reservedBikeSpots) && stop.reservedBikeSpots.length) rows.push(`<span class="reservation-group"><strong>Rad:</strong>${formatReservationPills(stop.reservedBikeSpots)}</span>`); return rows.length ? `<div class="reservation-inline">${rows.join('')}</div>` : ''; }
function renderStationInlineCard(stop, mode) { if (!stop) return null; const wrapper = document.createElement('aside'); const icon = mode === 'start' ? '🚉' : '🏁'; const label = mode === 'start' ? 'Start' : 'Ziel'; wrapper.className = `station-inline-card station-inline-card-${mode}`; wrapper.dataset.stopName = stop.name; wrapper.innerHTML = `<div class="overview-card compact-logistics-card ${mode === 'start' ? 'start-card' : 'end-card'}"><div class="compact-card-head"><div class="title station-title"><span class="station-title-icon">${icon}</span><span>${label}: ${stop.name}</span></div><div class="station-head-tools">${stop.carriageNumber ? `<span class="badge station-wagon-badge">${stop.carriageNumber}</span>` : ''}${stop.googleMapsUrl ? `<a class="inline-link" href="${stop.googleMapsUrl}" target="_blank" rel="noopener noreferrer">Maps</a>` : ''}</div></div><div class="compact-info-line">${stop.meetingPoint ? `<span><strong>Treffpunkt:</strong> ${stop.meetingPoint}</span>` : ''}${(stop.departureTime || stop.arrivalTime) ? `<span><strong>Abfahrt / Ankunft:</strong> ${stop.departureTime || '-'} / ${stop.arrivalTime || '-'}</span>` : ''}${stop.connection ? `<span><strong>Verbindung:</strong> ${stop.connection}</span>` : ''}${renderTransferDetails(stop)}${stop.address ? `<span class="muted">${stop.address}</span>` : ''}</div>${renderReservationInline(stop)}</div>`; stop.element = wrapper; return wrapper; }
function focusStop(stop) { if (!stop) return; if (stop.element) { stop.element.scrollIntoView({ behavior: 'smooth', block: 'center' }); stop.element.classList.add('is-stop-focused'); setTimeout(() => stop.element?.classList.remove('is-stop-focused'), 1600); } }

function renderHotelBox(stops) { const mount = document.getElementById('hotelBox'); if (mount) mount.innerHTML = ''; }

function highlightStage(stage) { if (stage?.polyline) { stage.polyline.setStyle({ weight: 7, opacity: 1.0 }); stage.polyline.bringToFront(); } }
function resetStageHighlight(stage) { if (stage?.polyline) stage.polyline.setStyle({ weight: 4, opacity: 0.95 }); }

function applySelectionStyles() {
  APP.state.stages.forEach(stage => {
    if (!stage.element) return;
    const isSelected = APP.state.selectedStageId === stage.id;
    const hasSelection = APP.state.selectedStageId != null;
    stage.element.classList.toggle('is-selected', isSelected);
    stage.element.classList.toggle('is-dimmed', hasSelection && !isSelected);
    if (isSelected) highlightStage(stage); else resetStageHighlight(stage);
  });
}

function updateFocusControls() {
  const hasSelection = APP.state.selectedStageId != null;
  ['resetStageFocusBtn', 'prevStageBtn', 'nextStageBtn', 'downloadActiveStageBtn'].forEach(id => document.getElementById(id).classList.toggle('hidden', !hasSelection));
  if (!hasSelection) return;
  const idx = APP.state.stages.findIndex(s => s.id === APP.state.selectedStageId);
  document.getElementById('prevStageBtn').disabled = idx <= 0;
  document.getElementById('nextStageBtn').disabled = idx >= APP.state.stages.length - 1;
}

function resetStageFocus() {
  APP.state.selectedStageId = null;
  applySelectionStyles();
  updateFocusControls();
  if (APP.routeLayerGroup.getLayers().length > 0) APP.map.fitBounds(APP.routeLayerGroup.getBounds(), { padding: [20, 20] });
}

function focusStage(stage) {
  APP.state.selectedStageId = stage.id;
  applySelectionStyles();
  updateFocusControls();
  if (stage.bounds && stage.bounds.isValid()) APP.map.fitBounds(stage.bounds.pad(0.15), { padding: [30, 30], maxZoom: 13, animate: false });
  if (stage.element) stage.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function moveStageFocus(delta) {
  if (APP.state.selectedStageId == null) return;
  const idx = APP.state.stages.findIndex(s => s.id === APP.state.selectedStageId);
  const next = APP.state.stages[idx + delta];
  if (next) focusStage(next);
}

function createStopMarker(stop) {
  const htmlIcon = stop.type === 'overnight' ? '🏨' : (stop.type === 'start' ? '🚉' : '🏁');
  const icon = L.divIcon({ className: '', html: `<div class="logistics-label-marker">${htmlIcon}</div>`, iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -10] });
  return L.marker([stop.lat, stop.lon], { icon });
}

function createStageNumberMarker(stage) {
  if (!stage.midpointLatLng) return null;
  const icon = L.divIcon({ className: '', html: `<div class="stage-line-number-marker" style="background:${stage.color}">${stage.id}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
  return L.marker(stage.midpointLatLng, { icon });
}

function renderStages(stages) {
  const mount = document.getElementById('stages');
  mount.innerHTML = '';
  const startStop = APP.state.stops.find(stop => stop.type === 'start');
  const endStop = [...APP.state.stops].reverse().find(stop => stop.type === 'end');
  const startCard = renderStationInlineCard(startStop, 'start');
  if (startCard) mount.appendChild(startCard);
  stages.forEach((stage, idx) => {
    const el = document.createElement('section');
    stage.element = el;
    el.className = 'stage';
    el.innerHTML = `<div class="stage-color" style="background:${stage.color}"></div><div class="stage-body"><div class="stage-head"><div class="stage-title"><span class="stage-title-number" style="background:${stage.color}">${stage.id}</span><span class="stage-title-text">${stage.name}</span></div><div class="stage-tools"><button class="stage-download-btn" type="button">Etappen-GPX herunterladen</button><div class="badge ${getDifficultyBadgeClass(stage.difficulty)}">${stage.difficulty}</div></div></div><div class="meta"><div class="meta-item"><div class="label">Distanz</div><div class="value">${stage.dist.toFixed(1)} km</div></div><div class="meta-item"><div class="label">Höhenmeter</div><div class="value">↑ ${Math.round(stage.up)} m</div></div><div class="meta-item"><div class="label">Höhenmeter</div><div class="value">↓ ${Math.round(stage.down)} m</div></div><div class="meta-item"><div class="label">Netto-Fahrzeit</div><div class="value">${formatDurationWithUnit(stage.netRideTimeHours)}</div></div><div class="meta-item"><div class="label">Brutto inkl. Pausen</div><div class="value">${formatDurationWithUnit(stage.grossRideTimeHours)} <span class="inline-pause">(Pausen ${formatDurationWithUnit(stage.totalPauseMinutes / 60)})</span></div></div></div><div class="canvas-wrap" style="height:180px"><canvas id="chart-${idx}"></canvas></div>${stage.plausibilityLevel ? `<div class="small-note">${stage.plausibilityMessage}</div>` : ''}</div>`;
    el.addEventListener('mouseenter', () => { el.classList.add('is-hovered'); highlightStage(stage); });
    el.addEventListener('mouseleave', () => { el.classList.remove('is-hovered'); if (APP.state.selectedStageId !== stage.id) resetStageHighlight(stage); });
    el.addEventListener('click', () => focusStage(stage));
    el.querySelector('.stage-download-btn').addEventListener('click', ev => { ev.stopPropagation(); downloadStageGpx(stage); });
    mount.appendChild(el);
    if (stage.hotel) { const hotelWrap = document.createElement('div'); hotelWrap.innerHTML = renderHotelCard(stage.hotel); const hotelElement = hotelWrap.firstElementChild; stage.hotel.element = hotelElement; mount.appendChild(hotelElement); }
    renderChart(`chart-${idx}`, stage);
  });
  const endCard = renderStationInlineCard(endStop, 'end');
  if (endCard) mount.appendChild(endCard);
  applySelectionStyles();
}

function renderMap(stages, stops) {
  APP.routeLayerGroup.clearLayers();
  APP.stageNumberMarkers.forEach(m => { try { APP.map.removeLayer(m); } catch (e) {} });
  APP.stageNumberMarkers = [];
  stages.forEach(stage => {
    const polyline = L.polyline(stage.seg.map(p => [p.lat, p.lon]), { color: stage.color, weight: 4, opacity: 0.95 }).addTo(APP.routeLayerGroup);
    stage.polyline = polyline;
    stage.bounds = polyline.getBounds();
    const marker = createStageNumberMarker(stage);
    if (marker) {
      marker.on('click', () => focusStage(stage));
      marker.addTo(APP.map);
      stage.marker = marker;
      APP.stageNumberMarkers.push(marker);
    }
  });
  stops.forEach(stop => {
    const marker = createStopMarker(stop).addTo(APP.routeLayerGroup);
    let popupHtml = `<strong>${stop.name}</strong>`;
    if (stop.type === 'start' || stop.type === 'end') {
      if (stop.connection) popupHtml += `<br>${stop.connection}`;
      if (stop.departureTime || stop.arrivalTime) popupHtml += `<br>${stop.departureTime || '-'} / ${stop.arrivalTime || '-'}`;
    }
    if (stop.type === 'overnight' && stop.hotelUrl) popupHtml += `<br><a href="${stop.hotelUrl}" target="_blank" rel="noopener noreferrer">Hotel-Link öffnen</a>`;
    marker.bindPopup(popupHtml);
    marker.on('click', () => focusStop(stop));
  });
  if (APP.routeLayerGroup.getLayers().length > 0) APP.map.fitBounds(APP.routeLayerGroup.getBounds(), { padding: [20, 20] });
}

async function loadTour() {
  destroyCharts();
  APP.state.selectedStageId = null;
  setStatus('Lade Tour …');
  const routeName = document.getElementById('routeSelect').value;
  const routeMeta = APP.state.routesManifest.find(r => r.id === routeName) || { label: routeName };
  APP.state.routeName = routeName;
  APP.state.routeLabel = routeMeta.label;
  APP.state.activeRouteMeta = routeMeta;
  updateTopMetaBar(routeMeta);
  const stopsFile = routeMeta.stopsFile || `${routeName}-stops.json`;
  const [rawStops, points] = await Promise.all([loadJSON(`data/${stopsFile}`), loadGPX(routeName)]);
  const preparedStops = [];
  for (const stop of rawStops) {
    const coords = await resolveStopCoordinates(stop);
    if (!coords) { console.warn('Koordinaten konnten nicht automatisch ermittelt werden:', stop.name, stop.googleMapsUrl || stop.address || ''); continue; }
    const nearest = findNearestTrackPoint(coords, points);
    preparedStops.push({ ...stop, lat: coords.lat, lon: coords.lon, trackIndex: nearest.index, distanceToRouteKm: nearest.distanceToRouteKm });
  }
  preparedStops.sort((a, b) => a.trackIndex - b.trackIndex);
  APP.state.stops = preparedStops;
  APP.state.stages = buildStages(points, preparedStops, APP.state.config);
  renderSummary(APP.state.stages, routeMeta.label);
  renderStationBox(preparedStops);
  renderStages(APP.state.stages);
  renderHotelBox(preparedStops);
  renderMap(APP.state.stages, preparedStops);
  updateFocusControls();
  setStatus(`${APP.state.stages.length} Tagesabschnitt(e) geladen`);
}
