const APP = {
  map: null,
  routeLayerGroup: null,
  charts: [],
  colors: ['#14b8a6', '#f59e0b', '#8b5cf6', '#84cc16', '#ec4899', '#06b6d4', '#f97316'],
  state: { config: null, stages: [], stops: [], routeName: null, routeLabel: null, routesManifest: [], selectedStageId: null, rawGpxText: '' },
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
  APP.map = L.map('map').setView([47.7, 11.5], 7);
  APP.baseLayers = {
    Standard: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap-Mitwirkende' }),
    Humanitarian: L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap-Mitwirkende, HOT' }),
    Topografisch: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap-Mitwirkende, OpenTopoMap' })
  };
  APP.currentBaseLayer = APP.baseLayers.Humanitarian;
  APP.currentBaseLayer.addTo(APP.map);
  APP.routeLayerGroup = L.featureGroup().addTo(APP.map);
  document.getElementById('loadBtn').addEventListener('click', loadTour);
  document.getElementById('downloadFullGpxBtn').addEventListener('click', downloadFullGpx);
  document.getElementById('downloadAllStagesZipBtn').addEventListener('click', downloadAllStagesZip);
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

function todayStamp() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
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

function getStageById(id) {
  return APP.state.stages.find(stage => stage.id === id) || null;
}

function getSelectedStage() {
  return getStageById(APP.state.selectedStageId);
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
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="M365 Copilot" xmlns="http://www.topografix.com/GPX/1/1">',
    `<trk><name>${escapeXml(name)}</name><trkseg>`
  ];
  points.forEach(p => {
    lines.push(`<trkpt lat="${Number(p.lat).toFixed(6)}" lon="${Number(p.lon).toFixed(6)}"><ele>${Number(p.ele || 0).toFixed(1)}</ele></trkpt>`);
  });
  lines.push('</trkseg></trk>', '</gpx>');
  return lines.join('\n');
}

function downloadText(content, filename, mimeType = 'application/gpx+xml;charset=utf-8') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadFullGpx() {
  if (!APP.state.rawGpxText || !APP.state.routeName) return;
  downloadText(APP.state.rawGpxText, `${getRouteFileBase()}-gesamt.gpx`);
}

function buildStageFilename(stage) {
  const routeBase = getRouteFileBase();
  const stageNo = String(stage.id).padStart(2, '0');
  return `${routeBase}-etappe-${stageNo}.gpx`;
}

function downloadStageGpx(stage) {
  const fileName = buildStageFilename(stage);
  const name = `${APP.state.routeLabel || APP.state.routeName || 'Tour'} - Etappe ${stage.id}`;
  downloadText(gpxFromPoints(stage.seg, name), fileName);
}

function downloadActiveStage() {
  const stage = getSelectedStage();
  if (!stage) return;
  downloadStageGpx(stage);
}

async function downloadAllStagesZip() {
  if (typeof JSZip === 'undefined') {
    setStatus('ZIP-Download ist aktuell nicht verfügbar.');
    return;
  }
  const zip = new JSZip();
  APP.state.stages.forEach(stage => {
    const fileName = buildStageFilename(stage);
    const name = `${APP.state.routeLabel || APP.state.routeName || 'Tour'} - Etappe ${stage.id}`;
    zip.file(fileName, gpxFromPoints(stage.seg, name));
  });
  const readme = [
    `Route: ${APP.state.routeLabel || APP.state.routeName || 'Tour'}`,
    `Erstellt: ${todayStamp()}`,
    `Anzahl Etappen: ${APP.state.stages.length}`
  ].join('\n');
  zip.file('README.txt', readme);
  setStatus('Erzeuge ZIP mit Etappen ...');
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadText(blob, `${getRouteFileBase()}-alle-etappen.zip`, 'application/zip');
  setStatus('ZIP-Download gestartet');
}

async function initializeApp() {
  try {
    setStatus('Initialisiere Anwendung …');
    APP.state.config = await loadJSON('data/config.json');
    APP.colors = APP.state.config.visuals?.stageColors || APP.colors;
    setupMapStyleOverlay(APP.state.config.mapView?.availableBaseMaps || ['Standard', 'Humanitarian', 'Topografisch'], APP.state.config.mapView?.defaultBaseMap || 'Humanitarian');
    await loadRoutesManifest();
    setStatus('Anwendung bereit');
    await loadTour();
  } catch (err) {
    console.error(err);
    setStatus(`Initialisierungsfehler: ${err.message}`);
  }
}

function switchBaseMap(styleName) {
  if (!APP.baseLayers[styleName]) return;
  if (APP.currentBaseLayer) APP.map.removeLayer(APP.currentBaseLayer);
  APP.currentBaseLayer = APP.baseLayers[styleName];
  APP.currentBaseLayer.addTo(APP.map);
  updateMapStyleOverlaySelection(styleName);
}

function setupMapStyleOverlay(styles, defaultStyle) {
  const MapStyleControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd() {
      const container = L.DomUtil.create('div', 'map-style-control leaflet-control');
      container.innerHTML = `
        <button class="map-style-toggle" type="button" aria-expanded="false">🗺 Kartenansicht</button>
        <div class="map-style-menu" aria-hidden="true"></div>
      `;
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

function updateMapStyleOverlaySelection(activeStyle) {
  if (!APP.mapStyleControl) return;
  APP.mapStyleControl.querySelectorAll('.map-style-item').forEach(item => {
    item.classList.toggle('active', item.dataset.styleName === activeStyle);
  });
}

async function loadRoutesManifest() {
  const routes = await loadJSON('data/routes.json');
  APP.state.routesManifest = routes.filter(r => r.hasStopsFile !== false);
  const select = document.getElementById('routeSelect');
  select.innerHTML = '';
  APP.state.routesManifest.forEach(route => {
    const option = document.createElement('option');
    option.value = route.id;
    option.textContent = route.label;
    select.appendChild(option);
  });
  if (APP.state.routesManifest.length === 0) throw new Error('Keine Routen in data/routes.json gefunden');
}

async function loadGPX(routeName) {
  const text = await loadText(`gpx/${routeName}.gpx`);
  APP.state.rawGpxText = text;
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  const ns = 'http://www.topografix.com/GPX/1/1';
  return Array.from(xml.getElementsByTagNameNS(ns, 'trkpt')).map(pt => ({
    lat: parseFloat(pt.getAttribute('lat')),
    lon: parseFloat(pt.getAttribute('lon')),
    ele: parseFloat(pt.getElementsByTagNameNS(ns, 'ele')[0]?.textContent || '0')
  }));
}

function haversine(a, b) {
  const R = 6371;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

function parseGoogleUrl(url) {
  const match = url?.match(/q=([0-9.\-]+),([0-9.\-]+)/);
  return match ? { lat: parseFloat(match[1]), lon: parseFloat(match[2]) } : null;
}

async function resolveStopCoordinates(stop) {
  if (typeof stop.lat === 'number' && typeof stop.lon === 'number') return { lat: stop.lat, lon: stop.lon, source: 'direct' };
  if (stop.url) {
    const coords = parseGoogleUrl(stop.url);
    if (coords) return { ...coords, source: 'url' };
  }
  if (stop.address) {
    const coords = await geocodeAddress(stop.address);
    if (coords) return { ...coords, source: 'geocode' };
  }
  return null;
}

function findNearestTrackPoint(stopCoords, points) {
  let minDistance = Infinity;
  let minIndex = 0;
  points.forEach((p, i) => {
    const d = haversine(stopCoords, p);
    if (d < minDistance) {
      minDistance = d;
      minIndex = i;
    }
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
  const midIdx = Math.floor(seg.length / 2);
  const p = seg[midIdx];
  return [p.lat, p.lon];
}

function buildStages(points, stops, config) {
  const stages = [];
  const steepThreshold = config.profileView?.steepSectionThresholdPercent ?? 8;
  for (let i = 0; i < stops.length - 1; i++) {
    let startIndex = stops[i].trackIndex;
    let endIndex = stops[i + 1].trackIndex;
    if (endIndex <= startIndex) endIndex = Math.min(startIndex + 1, points.length - 1);
    const seg = points.slice(startIndex, endIndex + 1);
    let dist = 0, up = 0, down = 0;
    const profilePoints = [];
    const steepPoints = [];
    let cumulativeDist = 0, cumulativeUp = 0;
    profilePoints.push({ distanceKm: 0, upMeters: 0, netRideTimeHours: 0, elevation: seg[0]?.ele ?? 0, gradePct: 0 });
    for (let j = 1; j < seg.length; j++) {
      const stepDist = haversine(seg[j - 1], seg[j]);
      dist += stepDist;
      cumulativeDist += stepDist;
      const diff = seg[j].ele - seg[j - 1].ele;
      if (diff > 0) {
        up += diff;
        cumulativeUp += diff;
      } else {
        down += Math.abs(diff);
      }
      const gradePct = stepDist > 0 ? (diff / (stepDist * 1000)) * 100 : 0;
      profilePoints.push({ distanceKm: cumulativeDist, upMeters: cumulativeUp, netRideTimeHours: 0, elevation: seg[j].ele, gradePct });
    }
    const timing = config.timing;
    const avgSpeed = Math.max(timing.minimumCyclingSpeedKmh, timing.baseCyclingSpeedKmh - (up / 1000) * timing.climbSpeedReductionPer1000mKmh);
    for (let j = 1; j < profilePoints.length; j++) {
      profilePoints[j].netRideTimeHours = profilePoints[j].distanceKm / avgSpeed;
      if (Math.abs(profilePoints[j].gradePct) >= steepThreshold) {
        steepPoints.push({ x: profilePoints[j].distanceKm, y: profilePoints[j].elevation });
      }
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
    stages.push({
      id: i + 1,
      name: `${stops[i].name} → ${stops[i + 1].name}`,
      seg,
      dist,
      up,
      down,
      netRideTimeHours,
      grossRideTimeHours,
      totalPauseMinutes,
      difficulty,
      color,
      hotel,
      plausibilityLevel,
      plausibilityMessage,
      polyline: null,
      bounds: null,
      profilePoints,
      steepPoints,
      midpointLatLng: midpointOfSegment(seg),
      marker: null,
      element: null,
      remainingTotalHours: netRideTimeHours,
      remainingTotalDistanceKm: dist
    });
  }
  return stages;
}

function getDifficultyBadgeClass(difficulty) {
  if (difficulty === 'Leicht') return 'badge-ski-blue';
  if (difficulty === 'Mittel') return 'badge-ski-red';
  return 'badge-ski-black';
}

function destroyCharts() {
  APP.charts.forEach(ch => {
    try { ch.destroy(); } catch (e) { /* ignore */ }
  });
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
        {
          data: stage.profilePoints.map(p => ({ x: p.distanceKm, y: p.elevation })),
          borderColor: stage.color,
          backgroundColor: `${stage.color}33`,
          fill: true,
          tension: 0.25,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: stage.color,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
          borderWidth: 2
        },
        {
          type: 'scatter',
          data: stage.steepPoints,
          showLine: false,
          pointRadius: 3,
          pointHoverRadius: 4,
          pointBackgroundColor: '#b91c1c',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5
        }
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
            if (!tooltipModel || tooltipModel.opacity === 0 || !tooltipModel.dataPoints?.length) {
              tooltipEl.classList.add('hidden');
              return;
            }
            const idx = tooltipModel.dataPoints[0].dataIndex;
            const p = stage.profilePoints[idx];
            const remainingKm = Math.max(0, stage.remainingTotalDistanceKm - p.distanceKm);
            const remainingHours = Math.max(0, stage.remainingTotalHours - p.netRideTimeHours);
            tooltipEl.innerHTML = `
              <div><strong>${p.distanceKm.toFixed(1)} km</strong></div>
              <div>Dauer: ${formatHoursHm(p.netRideTimeHours)}</div>
              <div>Rest: ${remainingKm.toFixed(1)} km</div>
              <div>Restzeit: ${formatHoursHm(remainingHours)}</div>
              <div>bergauf: ${Math.round(p.upMeters)} m</div>
              <div>Höhe: ${Math.round(p.elevation)} m</div>
            `;
            tooltipEl.classList.remove('hidden');
            tooltipEl.style.left = `${tooltipModel.caretX}px`;
            tooltipEl.style.top = `${tooltipModel.caretY}px`;
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: { display: true, text: 'Distanz (km)' },
          min: 0,
          max: maxKm,
          ticks: { callback: value => `${Number(value).toFixed(0)} km` }
        },
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
  document.getElementById('summary').innerHTML = `
    <div class="summary-card"><div class="label">Route</div><div class="value">${routeLabel}</div></div>
    <div class="summary-card"><div class="label">Etappen</div><div class="value">${stages.length}</div></div>
    <div class="summary-card"><div class="label">Gesamtdistanz</div><div class="value">${totalDistance.toFixed(1)} km</div></div>
    <div class="summary-card"><div class="label">Höhenmeter</div><div class="value">↑ ${Math.round(totalUp)} / ↓ ${Math.round(totalDown)}</div></div>
    <div class="summary-card"><div class="label">Netto-Fahrzeit</div><div class="value">${formatHoursHm(totalNet)}</div></div>
    <div class="summary-card"><div class="label">Brutto-Fahrzeit</div><div class="value">${formatHoursHm(totalGross)}</div></div>`;
}

function highlightStage(stage) {
  if (!stage?.polyline) return;
  stage.polyline.setStyle({ weight: 7, opacity: 1.0 });
  stage.polyline.bringToFront();
}

function resetStageHighlight(stage) {
  if (!stage?.polyline) return;
  stage.polyline.setStyle({ weight: 4, opacity: 0.95 });
}

function createStopMarker(stop) {
  const isHotel = stop.type === 'overnight';
  const htmlClass = isHotel ? 'hotel-label-marker' : 'stop-label-marker';
  const htmlIcon = isHotel ? '🏨' : (stop.type === 'start' ? 'S' : 'Z');
  const icon = L.divIcon({ className: '', html: `<div class="${htmlClass}">${htmlIcon}</div>`, iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -10] });
  return L.marker([stop.lat, stop.lon], { icon });
}

function createStageNumberMarker(stage) {
  if (!stage.midpointLatLng) return null;
  const icon = L.divIcon({ className: '', html: `<div class="stage-line-number-marker" style="background:${stage.color}">${stage.id}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
  return L.marker(stage.midpointLatLng, { icon });
}

function buildMarkerPopupHtml(stop, warningHtml) {
  let html = `<strong>${stop.name}</strong>`;
  if (stop.type === 'overnight' && stop.hotelUrl) html += `<br><a href="${stop.hotelUrl}" target="_blank" rel="noopener noreferrer">Hotel-Link öffnen</a>`;
  if (warningHtml) html += warningHtml;
  return html;
}

function updateFocusControls() {
  const hasSelection = APP.state.selectedStageId != null;
  const resetBtn = document.getElementById('resetStageFocusBtn');
  const prevBtn = document.getElementById('prevStageBtn');
  const nextBtn = document.getElementById('nextStageBtn');
  const activeBtn = document.getElementById('downloadActiveStageBtn');
  resetBtn.classList.toggle('hidden', !hasSelection);
  prevBtn.classList.toggle('hidden', !hasSelection);
  nextBtn.classList.toggle('hidden', !hasSelection);
  activeBtn.classList.toggle('hidden', !hasSelection);
  if (!hasSelection) return;
  const idx = APP.state.stages.findIndex(s => s.id === APP.state.selectedStageId);
  prevBtn.disabled = idx <= 0;
  nextBtn.disabled = idx >= APP.state.stages.length - 1;
}

function applyStageSelectionStyles() {
  APP.state.stages.forEach(stage => {
    if (!stage.element) return;
    const isSelected = APP.state.selectedStageId === stage.id;
    const hasSelection = APP.state.selectedStageId != null;
    stage.element.classList.toggle('is-selected', isSelected);
    stage.element.classList.toggle('is-dimmed', hasSelection && !isSelected);
    if (!isSelected) resetStageHighlight(stage);
    else highlightStage(stage);
  });
}

function resetStageFocus() {
  APP.state.selectedStageId = null;
  applyStageSelectionStyles();
  updateFocusControls();
  if (APP.routeLayerGroup.getLayers().length > 0) APP.map.fitBounds(APP.routeLayerGroup.getBounds(), { padding: [20, 20] });
}

function focusStage(stage) {
  APP.state.selectedStageId = stage.id;
  applyStageSelectionStyles();
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

function renderStages(stages) {
  const mount = document.getElementById('stages');
  mount.innerHTML = '';
  stages.forEach((stage, idx) => {
    const stageEl = document.createElement('section');
    stageEl.className = 'stage';
    stage.element = stageEl;
    stageEl.innerHTML = `
      <div class="stage-color" style="background:${stage.color}"></div>
      <div class="stage-body">
        <div class="stage-head">
          <div class="stage-title">Etappe ${stage.id}: ${stage.name}</div>
          <div class="stage-tools">
            <button class="stage-download-btn" type="button">Etappen-GPX herunterladen</button>
            <div class="badge ${getDifficultyBadgeClass(stage.difficulty)}">${stage.difficulty}</div>
          </div>
        </div>
        <div class="meta">
          <div class="meta-item"><div class="label">Distanz</div><div class="value">${stage.dist.toFixed(1)} km</div></div>
          <div class="meta-item"><div class="label">Höhenmeter</div><div class="value">↑ ${Math.round(stage.up)} m</div></div>
          <div class="meta-item"><div class="label">Höhenmeter</div><div class="value">↓ ${Math.round(stage.down)} m</div></div>
          <div class="meta-item"><div class="label">Netto-Fahrzeit</div><div class="value">${formatHoursHm(stage.netRideTimeHours)}</div></div>
          <div class="meta-item"><div class="label">Brutto inkl. Pausen</div><div class="value">${formatHoursHm(stage.grossRideTimeHours)}<span class="subline">Pausen: ${formatHoursHm(stage.totalPauseMinutes / 60)}</span></div></div>
        </div>
        <div class="canvas-wrap" style="height:220px"><canvas id="chart-${idx}"></canvas></div>
        ${stage.hotel ? `<div class="hotel"><strong>🏨 Unterkunft</strong><br>${stage.hotel.name}<br>${stage.hotel.hotelUrl ? `<a href="${stage.hotel.hotelUrl}" target="_blank" rel="noopener noreferrer">Hotel-Link öffnen</a>` : ''}${stage.hotel.distanceToRouteKm != null ? `<div class="small-note">Abstand zur Route: ${stage.hotel.distanceToRouteKm.toFixed(1)} km</div>` : ''}</div>` : ''}
        ${stage.plausibilityLevel ? `<div class="warnings"><div class="warning ${stage.plausibilityLevel}">${stage.plausibilityMessage}</div></div>` : ''}
      </div>`;
    stageEl.addEventListener('mouseenter', () => { stageEl.classList.add('is-hovered'); highlightStage(stage); });
    stageEl.addEventListener('mouseleave', () => { stageEl.classList.remove('is-hovered'); if (APP.state.selectedStageId !== stage.id) resetStageHighlight(stage); });
    stageEl.addEventListener('click', () => focusStage(stage));
    mount.appendChild(stageEl);
    stageEl.querySelector('.stage-download-btn').addEventListener('click', ev => {
      ev.stopPropagation();
      downloadStageGpx(stage);
    });
    renderChart(`chart-${idx}`, stage);
  });
  applyStageSelectionStyles();
}

function renderMap(stages, stops) {
  APP.routeLayerGroup.clearLayers();
  APP.stageNumberMarkers.forEach(m => { try { APP.map.removeLayer(m); } catch (e) { /* ignore */ } });
  APP.stageNumberMarkers = [];
  stages.forEach(stage => {
    const polyline = L.polyline(stage.seg.map(p => [p.lat, p.lon]), { color: stage.color, weight: 4, opacity: 0.95 }).addTo(APP.routeLayerGroup);
    stage.polyline = polyline;
    stage.bounds = polyline.getBounds();
    const numberMarker = createStageNumberMarker(stage);
    if (numberMarker) {
      numberMarker.on('click', () => focusStage(stage));
      numberMarker.addTo(APP.map);
      APP.stageNumberMarkers.push(numberMarker);
      stage.marker = numberMarker;
    }
  });
  stops.forEach(stop => {
    const level = getPlausibilityLevel(stop.distanceToRouteKm ?? 0, APP.state.config.routePlausibilityCheck);
    const marker = createStopMarker(stop).addTo(APP.routeLayerGroup);
    const note = level ? `<br><strong>Achtung:</strong> ${getPlausibilityMessage(stop.distanceToRouteKm, level)}` : '';
    marker.bindPopup(buildMarkerPopupHtml(stop, note));
  });
  if (APP.routeLayerGroup.getLayers().length > 0) APP.map.fitBounds(APP.routeLayerGroup.getBounds(), { padding: [20, 20] });
}

async function loadTour() {
  try {
    destroyCharts();
    APP.state.selectedStageId = null;
    setStatus('Lade Tour …');
    const routeName = document.getElementById('routeSelect').value;
    const routeMeta = APP.state.routesManifest.find(r => r.id === routeName) || { label: routeName };
    APP.state.routeName = routeName;
    APP.state.routeLabel = routeMeta.label;
    const [rawStops, points] = await Promise.all([loadJSON(`data/${routeName}-stops.json`), loadGPX(routeName)]);
    const preparedStops = [];
    for (const stop of rawStops) {
      const coords = await resolveStopCoordinates(stop);
      if (!coords) continue;
      const nearest = findNearestTrackPoint(coords, points);
      preparedStops.push({ ...stop, lat: coords.lat, lon: coords.lon, coordinateSource: coords.source, trackIndex: nearest.index, distanceToRouteKm: nearest.distanceToRouteKm });
    }
    preparedStops.sort((a, b) => a.trackIndex - b.trackIndex);
    APP.state.stops = preparedStops;
    APP.state.stages = buildStages(points, preparedStops, APP.state.config);
    renderSummary(APP.state.stages, routeMeta.label);
    renderStages(APP.state.stages);
    renderMap(APP.state.stages, preparedStops);
    updateFocusControls();
    setStatus(`${APP.state.stages.length} Tagesabschnitt(e) geladen`);
  } catch (err) {
    console.error(err);
    setStatus('Fehler beim Laden der Tour');
    document.getElementById('stages').innerHTML = `<section class="stage"><div class="stage-color" style="background:#dc2626"></div><div class="stage-body"><div class="stage-title">Fehler</div><p>${err.message}</p></div></section>`;
  }
}
