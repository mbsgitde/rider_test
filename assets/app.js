const APP = {
  map: null,
  routeLayerGroup: null,
  charts: [],
  colors: ['#ef4444','#2563eb','#16a34a','#f59e0b','#8b5cf6','#06b6d4','#ec4899'],
  state: { config: null, stages: [], stops: [], routeName: null, routesManifest: [], selectedStageId: null },
  baseLayers: {},
  currentBaseLayer: null,
  mapStyleControl: null,
  stageNumberMarkers: []
};

document.addEventListener('DOMContentLoaded', async () => {
  APP.map = L.map('map').setView([47.7,11.5], 7);
  APP.baseLayers = {
    'Standard': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap-Mitwirkende' }),
    'Humanitarian': L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap-Mitwirkende, HOT' }),
    'Topografisch': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap-Mitwirkende, OpenTopoMap' })
  };
  APP.currentBaseLayer = APP.baseLayers['Standard'];
  APP.currentBaseLayer.addTo(APP.map);
  APP.routeLayerGroup = L.featureGroup().addTo(APP.map);
  document.getElementById('loadBtn').addEventListener('click', loadTour);
  document.getElementById('resetStageFocusBtn').addEventListener('click', resetStageFocus);
  await initializeApp();
});

function setStatus(text) { const el = document.getElementById('status'); if (el) el.textContent = text; }
async function loadJSON(path) { const res = await fetch(path, { cache: 'no-store' }); if (!res.ok) throw new Error(`Fehler beim Laden von ${path}: ${res.status}`); return res.json(); }
async function loadText(path) { const res = await fetch(path, { cache: 'no-store' }); if (!res.ok) throw new Error(`Fehler beim Laden von ${path}: ${res.status}`); return res.text(); }

function formatHoursHm(hours) {
  const totalMinutes = Math.max(0, Math.round(hours * 60));
  const hh = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
  const mm = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hh}:${mm}`;
}

async function initializeApp() {
  try {
    setStatus('Initialisiere Anwendung …');
    APP.state.config = await loadJSON('data/config.json');
    setupMapStyleOverlay(APP.state.config.mapView?.availableBaseMaps || ['Standard','Humanitarian','Topografisch'], APP.state.config.mapView?.defaultBaseMap || 'Standard');
    await loadRoutesManifest();
    setStatus('Anwendung bereit');
    await loadTour();
  } catch (err) {
    console.error(err); setStatus(`Initialisierungsfehler: ${err.message}`);
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
    onAdd: function() {
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
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  const ns = 'http://www.topografix.com/GPX/1/1';
  return Array.from(xml.getElementsByTagNameNS(ns, 'trkpt')).map(pt => ({
    lat: parseFloat(pt.getAttribute('lat')),
    lon: parseFloat(pt.getAttribute('lon')),
    ele: parseFloat(pt.getElementsByTagNameNS(ns,'ele')[0]?.textContent || '0')
  }));
}

function haversine(a,b) {
  const R = 6371; const toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
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
  if (stop.url) { const coords = parseGoogleUrl(stop.url); if (coords) return { ...coords, source: 'url' }; }
  if (stop.address) { const coords = await geocodeAddress(stop.address); if (coords) return { ...coords, source: 'geocode' }; }
  return null;
}

function findNearestTrackPoint(stopCoords, points) {
  let minDistance = Infinity, minIndex = 0;
  points.forEach((p, i) => { const d = haversine(stopCoords, p); if (d < minDistance) { minDistance = d; minIndex = i; } });
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
  for (let i = 0; i < stops.length - 1; i++) {
    let startIndex = stops[i].trackIndex, endIndex = stops[i+1].trackIndex;
    if (endIndex <= startIndex) endIndex = Math.min(startIndex + 1, points.length - 1);
    const seg = points.slice(startIndex, endIndex + 1);
    let dist = 0, up = 0, down = 0;
    for (let j = 1; j < seg.length; j++) {
      dist += haversine(seg[j-1], seg[j]);
      const diff = seg[j].ele - seg[j-1].ele;
      if (diff > 0) up += diff; else down += Math.abs(diff);
    }
    const timing = config.timing;
    const avgSpeed = Math.max(timing.minimumCyclingSpeedKmh, timing.baseCyclingSpeedKmh - (up / 1000) * timing.climbSpeedReductionPer1000mKmh);
    const netRideTimeHours = dist / avgSpeed;
    const shortBreakMinutes = netRideTimeHours * timing.shortBreakMinutesPerHour;
    const totalPauseMinutes = shortBreakMinutes + timing.longBreakMinutesPerStage;
    const grossRideTimeHours = netRideTimeHours + totalPauseMinutes / 60;
    let difficulty = 'Schwer';
    if (dist < 60 && up < 800) difficulty = 'Leicht'; else if (dist < 100 && up < 1500) difficulty = 'Mittel';
    const color = APP.colors[i % APP.colors.length];
    const hotel = stops[i+1].type === 'overnight' ? stops[i+1] : null;
    const plausibilityLevel = hotel ? getPlausibilityLevel(hotel.distanceToRouteKm, config.routePlausibilityCheck) : null;
    const plausibilityMessage = hotel ? getPlausibilityMessage(hotel.distanceToRouteKm, plausibilityLevel) : '';

    const profilePoints = [];
    let cumulativeDist = 0, cumulativeUp = 0;
    profilePoints.push({ distanceKm: 0, upMeters: 0, netRideTimeHours: 0, elevation: seg[0]?.ele ?? 0 });
    for (let j = 1; j < seg.length; j++) {
      cumulativeDist += haversine(seg[j-1], seg[j]);
      const diff = seg[j].ele - seg[j-1].ele;
      if (diff > 0) cumulativeUp += diff;
      profilePoints.push({ distanceKm: cumulativeDist, upMeters: cumulativeUp, netRideTimeHours: cumulativeDist / avgSpeed, elevation: seg[j].ele });
    }

    stages.push({ id: i + 1, name: `${stops[i].name} → ${stops[i+1].name}`, seg, ele: seg.map(p => p.ele), dist, up, down, netRideTimeHours, grossRideTimeHours, totalPauseMinutes, difficulty, color, hotel, plausibilityLevel, plausibilityMessage, polyline: null, bounds: null, profilePoints, midpointLatLng: midpointOfSegment(seg) });
  }
  return stages;
}

function getDifficultyBadgeClass(difficulty) {
  if (difficulty === 'Leicht') return 'badge-ski-blue';
  if (difficulty === 'Mittel') return 'badge-ski-red';
  return 'badge-ski-black';
}

function destroyCharts() { APP.charts.forEach(ch => { try { ch.destroy(); } catch (e) {} }); APP.charts = []; }

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
  const chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: stage.profilePoints.map((_, i) => i + 1),
      datasets: [{
        data: stage.profilePoints.map(p => p.elevation),
        borderColor: stage.color,
        backgroundColor: `${stage.color}33`,
        fill: true,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: false,
          external: function(context) {
            const tooltipModel = context.tooltip;
            if (!tooltipModel || tooltipModel.opacity === 0 || !tooltipModel.dataPoints?.length) {
              tooltipEl.classList.add('hidden');
              return;
            }
            const idx = tooltipModel.dataPoints[0].dataIndex;
            const p = stage.profilePoints[idx];
            tooltipEl.innerHTML = `
              <div><strong>${p.distanceKm.toFixed(1)} km</strong></div>
              <div>Dauer: ${formatHoursHm(p.netRideTimeHours)}</div>
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
        x: { display: false },
        y: { title: { display: true, text: 'Höhe (m)' } }
      }
    }
  });
  APP.charts.push(chart);
}

function renderSummary(stages, routeLabel) {
  const totalDistance = stages.reduce((a,s) => a + s.dist, 0), totalUp = stages.reduce((a,s) => a + s.up, 0), totalDown = stages.reduce((a,s) => a + s.down, 0), totalNet = stages.reduce((a,s) => a + s.netRideTimeHours, 0), totalGross = stages.reduce((a,s) => a + s.grossRideTimeHours, 0);
  document.getElementById('summary').innerHTML = `<div class="summary-card"><div class="label">Route</div><div class="value">${routeLabel}</div></div><div class="summary-card"><div class="label">Etappen</div><div class="value">${stages.length}</div></div><div class="summary-card"><div class="label">Gesamtdistanz</div><div class="value">${totalDistance.toFixed(1)} km</div></div><div class="summary-card"><div class="label">Höhenmeter</div><div class="value">↑ ${Math.round(totalUp)} / ↓ ${Math.round(totalDown)}</div></div><div class="summary-card"><div class="label">Netto-Fahrzeit</div><div class="value">${formatHoursHm(totalNet)}</div></div><div class="summary-card"><div class="label">Brutto-Fahrzeit</div><div class="value">${formatHoursHm(totalGross)}</div></div>`;
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
  const icon = L.divIcon({ className: '', html: `<div class="${htmlClass}">${htmlIcon}</div>`, iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -10] });
  return L.marker([stop.lat, stop.lon], { icon });
}

function createStageNumberMarker(stage) {
  if (!stage.midpointLatLng) return null;
  const icon = L.divIcon({
    className: '',
    html: `<div class="stage-line-number-marker" style="background:${stage.color}">${stage.id}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
  return L.marker(stage.midpointLatLng, { icon, interactive: false, keyboard: false });
}

function buildMarkerPopupHtml(stop, warningHtml) {
  let html = `<strong>${stop.name}</strong>`;
  if (stop.type === 'overnight' && stop.hotelUrl) {
    html += `<br><a href="${stop.hotelUrl}" target="_blank" rel="noopener noreferrer">Hotel-Link öffnen</a>`;
  }
  if (warningHtml) html += warningHtml;
  return html;
}

function resetStageFocus() {
  APP.state.selectedStageId = null;
  document.getElementById('resetStageFocusBtn').classList.add('hidden');
  document.querySelectorAll('.stage').forEach(el => el.classList.remove('is-selected','is-hidden-temp'));
  APP.state.stages.forEach(stage => resetStageHighlight(stage));
  if (APP.routeLayerGroup.getLayers().length > 0) APP.map.fitBounds(APP.routeLayerGroup.getBounds(), { padding: [20, 20] });
}

function focusStage(stage, stageEl) {
  APP.state.selectedStageId = stage.id;
  document.getElementById('resetStageFocusBtn').classList.remove('hidden');
  document.querySelectorAll('.stage').forEach(el => {
    const isSame = el === stageEl;
    el.classList.toggle('is-selected', isSame);
    el.classList.toggle('is-hidden-temp', !isSame);
  });
  if (stage.bounds && stage.bounds.isValid()) {
    APP.map.fitBounds(stage.bounds.pad(0.15), { padding: [30, 30], maxZoom: 13, animate: false });
  }
  stageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderStages(stages) {
  const mount = document.getElementById('stages');
  mount.innerHTML = '';
  stages.forEach((stage, idx) => {
    const stageEl = document.createElement('section');
    stageEl.className = 'stage';
    stageEl.innerHTML = `<div class="stage-color" style="background:${stage.color}"></div><div class="stage-body"><div class="stage-head"><div class="stage-title">Etappe ${stage.id}: ${stage.name}</div><div class="badge ${getDifficultyBadgeClass(stage.difficulty)}">${stage.difficulty}</div></div><div class="meta"><div class="meta-item"><div class="label">Distanz</div><div class="value">${stage.dist.toFixed(1)} km</div></div><div class="meta-item"><div class="label">Höhenmeter</div><div class="value">↑ ${Math.round(stage.up)} m</div></div><div class="meta-item"><div class="label">Höhenmeter</div><div class="value">↓ ${Math.round(stage.down)} m</div></div><div class="meta-item"><div class="label">Netto-Fahrzeit</div><div class="value">${formatHoursHm(stage.netRideTimeHours)}</div></div><div class="meta-item"><div class="label">Brutto-Fahrzeit</div><div class="value">${formatHoursHm(stage.grossRideTimeHours)}</div></div><div class="meta-item"><div class="label">Pausen</div><div class="value">${Math.round(stage.totalPauseMinutes)} min</div></div></div><div class="canvas-wrap" style="height:220px"><canvas id="chart-${idx}"></canvas></div>${stage.hotel ? `<div class="hotel"><strong>🏨 Unterkunft</strong><br>${stage.hotel.name}<br>${stage.hotel.hotelUrl ? `<a href="${stage.hotel.hotelUrl}" target="_blank" rel="noopener noreferrer">Hotel-Link öffnen</a>` : ''}${stage.hotel.distanceToRouteKm != null ? `<div class="small-note">Abstand zur Route: ${stage.hotel.distanceToRouteKm.toFixed(1)} km</div>` : ''}</div>` : ''}${stage.plausibilityLevel ? `<div class="warnings"><div class="warning ${stage.plausibilityLevel}">${stage.plausibilityMessage}</div></div>` : ''}</div>`;
    stageEl.addEventListener('mouseenter', () => { stageEl.classList.add('is-hovered'); highlightStage(stage); });
    stageEl.addEventListener('mouseleave', () => { stageEl.classList.remove('is-hovered'); if (APP.state.selectedStageId !== stage.id) resetStageHighlight(stage); });
    stageEl.addEventListener('click', () => focusStage(stage, stageEl));
    mount.appendChild(stageEl);
    renderChart(`chart-${idx}`, stage);
  });
}

function renderMap(stages, stops) {
  APP.routeLayerGroup.clearLayers();
  APP.stageNumberMarkers.forEach(m => { try { APP.map.removeLayer(m); } catch(e) {} });
  APP.stageNumberMarkers = [];

  stages.forEach(stage => {
    const coords = stage.seg.map(p => [p.lat, p.lon]);
    const polyline = L.polyline(coords, { color: stage.color, weight: 4, opacity: 0.95 }).addTo(APP.routeLayerGroup);
    stage.polyline = polyline;
    stage.bounds = polyline.getBounds();
    const numberMarker = createStageNumberMarker(stage);
    if (numberMarker) {
      numberMarker.addTo(APP.map);
      APP.stageNumberMarkers.push(numberMarker);
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
    resetStageFocus();
    setStatus('Lade Tour …');
    const routeName = document.getElementById('routeSelect').value;
    const routeMeta = APP.state.routesManifest.find(r => r.id === routeName) || { label: routeName };
    const [rawStops, points] = await Promise.all([loadJSON(`data/${routeName}-stops.json`), loadGPX(routeName)]);
    const preparedStops = [];
    for (const stop of rawStops) {
      const coords = await resolveStopCoordinates(stop);
      if (!coords) continue;
      const nearest = findNearestTrackPoint(coords, points);
      preparedStops.push({ ...stop, lat: coords.lat, lon: coords.lon, coordinateSource: coords.source, trackIndex: nearest.index, distanceToRouteKm: nearest.distanceToRouteKm });
    }
    preparedStops.sort((a,b) => a.trackIndex - b.trackIndex);
    const stages = buildStages(points, preparedStops, APP.state.config);
    APP.state.routeName = routeName; APP.state.stops = preparedStops; APP.state.stages = stages; APP.state.selectedStageId = null;
    renderSummary(stages, routeMeta.label); renderStages(stages); renderMap(stages, preparedStops);
    setStatus(`${stages.length} Tagesabschnitt(e) geladen`);
  } catch (err) {
    console.error(err); setStatus('Fehler beim Laden der Tour');
    document.getElementById('stages').innerHTML = `<section class="stage"><div class="stage-color" style="background:#dc2626"></div><div class="stage-body"><div class="stage-title">Fehler</div><p>${err.message}</p></div></section>`;
  }
}
