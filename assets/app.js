const APP = {
  map: null,
  layerGroup: null,
  charts: [],
  colors: ['#ef4444', '#2563eb', '#16a34a', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899'],
  state: { config: null, stages: [], stops: [], routeName: null }
};

document.addEventListener('DOMContentLoaded', async () => {
  APP.map = L.map('map').setView([47.7, 11.5], 7);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap-Mitwirkende'
  }).addTo(APP.map);
  APP.layerGroup = L.layerGroup().addTo(APP.map);
  document.getElementById('loadBtn').addEventListener('click', loadTour);
  await loadTour();
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

async function loadGPX(routeName) {
  const text = await loadText(`gpx/${routeName}.gpx`);
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  const ns = 'http://www.topografix.com/GPX/1/1';
  const trkpts = Array.from(xml.getElementsByTagNameNS(ns, 'trkpt'));
  return trkpts.map(pt => ({
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

function buildStages(points, stops, config) {
  const stages = [];
  for (let i = 0; i < stops.length - 1; i++) {
    let startIndex = stops[i].trackIndex;
    let endIndex = stops[i + 1].trackIndex;
    if (endIndex <= startIndex) endIndex = Math.min(startIndex + 1, points.length - 1);
    const seg = points.slice(startIndex, endIndex + 1);
    let dist = 0, up = 0, down = 0;
    for (let j = 1; j < seg.length; j++) {
      dist += haversine(seg[j - 1], seg[j]);
      const diff = seg[j].ele - seg[j - 1].ele;
      if (diff > 0) up += diff; else down += Math.abs(diff);
    }
    const timing = config.timing;
    const avgSpeed = Math.max(
      timing.minimumCyclingSpeedKmh,
      timing.baseCyclingSpeedKmh - (up / 1000) * timing.climbSpeedReductionPer1000mKmh
    );
    const netRideTimeHours = dist / avgSpeed;
    const shortBreakMinutes = netRideTimeHours * timing.shortBreakMinutesPerHour;
    const grossRideTimeHours = netRideTimeHours + shortBreakMinutes / 60 + timing.longBreakMinutesPerStage / 60;
    let difficulty = 'Schwer';
    if (dist < 60 && up < 800) difficulty = 'Leicht';
    else if (dist < 100 && up < 1500) difficulty = 'Mittel';
    const stageColor = APP.colors[i % APP.colors.length];
    const hotel = stops[i + 1].type === 'overnight' ? stops[i + 1] : null;
    const plausibilityLevel = hotel ? getPlausibilityLevel(hotel.distanceToRouteKm, config.routePlausibilityCheck) : null;
    const plausibilityMessage = hotel ? getPlausibilityMessage(hotel.distanceToRouteKm, plausibilityLevel) : '';
    stages.push({
      id: i + 1,
      name: `${stops[i].name} → ${stops[i + 1].name}`,
      seg,
      ele: seg.map(p => p.ele),
      dist,
      up,
      down,
      netRideTimeHours,
      grossRideTimeHours,
      shortBreakMinutes,
      difficulty,
      color: stageColor,
      hotel,
      plausibilityLevel,
      plausibilityMessage
    });
  }
  return stages;
}

function destroyCharts() {
  APP.charts.forEach(ch => { try { ch.destroy(); } catch (e) {} });
  APP.charts = [];
}

function renderChart(canvasId, elevationValues, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: elevationValues.map((_, i) => i + 1),
      datasets: [{
        data: elevationValues,
        borderColor: color,
        backgroundColor: `${color}33`,
        fill: true,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { title: { display: true, text: 'Höhe (m)' } } }
    }
  });
  APP.charts.push(chart);
}

function renderSummary(stages, routeName) {
  const totalDistance = stages.reduce((a, s) => a + s.dist, 0);
  const totalUp = stages.reduce((a, s) => a + s.up, 0);
  const totalDown = stages.reduce((a, s) => a + s.down, 0);
  const totalNet = stages.reduce((a, s) => a + s.netRideTimeHours, 0);
  const totalGross = stages.reduce((a, s) => a + s.grossRideTimeHours, 0);
  const mount = document.getElementById('summary');
  mount.innerHTML = `
    <div class="summary-card"><div class="label">Route</div><div class="value">${routeName}</div></div>
    <div class="summary-card"><div class="label">Etappen</div><div class="value">${stages.length}</div></div>
    <div class="summary-card"><div class="label">Gesamtdistanz</div><div class="value">${totalDistance.toFixed(1)} km</div></div>
    <div class="summary-card"><div class="label">Höhenmeter</div><div class="value">↑ ${Math.round(totalUp)} / ↓ ${Math.round(totalDown)}</div></div>
    <div class="summary-card"><div class="label">Netto-Fahrzeit</div><div class="value">${totalNet.toFixed(1)} h</div></div>
    <div class="summary-card"><div class="label">Brutto-Fahrzeit</div><div class="value">${totalGross.toFixed(1)} h</div></div>
  `;
}

function renderStages(stages) {
  const mount = document.getElementById('stages');
  mount.innerHTML = '';
  stages.forEach((stage, idx) => {
    const stageEl = document.createElement('section');
    stageEl.className = 'stage';
    stageEl.innerHTML = `
      <div class="stage-color" style="background:${stage.color}"></div>
      <div class="stage-body">
        <div class="stage-head">
          <div class="stage-title">Etappe ${stage.id}: ${stage.name}</div>
          <div class="badge">${stage.difficulty}</div>
        </div>
        <div class="meta">
          <div class="meta-item"><div class="label">Distanz</div><div class="value">${stage.dist.toFixed(1)} km</div></div>
          <div class="meta-item"><div class="label">Höhenmeter</div><div class="value">↑ ${Math.round(stage.up)} m</div></div>
          <div class="meta-item"><div class="label">Höhenmeter</div><div class="value">↓ ${Math.round(stage.down)} m</div></div>
          <div class="meta-item"><div class="label">Netto-Fahrzeit</div><div class="value">${stage.netRideTimeHours.toFixed(1)} h</div></div>
          <div class="meta-item"><div class="label">Brutto-Fahrzeit</div><div class="value">${stage.grossRideTimeHours.toFixed(1)} h</div></div>
          <div class="meta-item"><div class="label">Kurzpausen</div><div class="value">${Math.round(stage.shortBreakMinutes)} min</div></div>
        </div>
        <div class="canvas-wrap" style="height:220px"><canvas id="chart-${idx}"></canvas></div>
        ${stage.hotel ? `
          <div class="hotel">
            <strong>🏨 Unterkunft</strong><br>
            ${stage.hotel.name}<br>
            ${stage.hotel.hotelUrl ? `<a href="${stage.hotel.hotelUrl}" target="_blank" rel="noopener noreferrer">Hotel-Link öffnen</a>` : ''}
            ${stage.hotel.distanceToRouteKm != null ? `<div class="small-note">Abstand zur Route: ${stage.hotel.distanceToRouteKm.toFixed(1)} km</div>` : ''}
          </div>
        ` : ''}
        ${stage.plausibilityLevel ? `
          <div class="warnings">
            <div class="warning ${stage.plausibilityLevel}">${stage.plausibilityMessage}</div>
          </div>
        ` : ''}
      </div>
    `;
    mount.appendChild(stageEl);
    renderChart(`chart-${idx}`, stage.ele, stage.color);
  });
}

function renderMap(stages, stops) {
  APP.layerGroup.clearLayers();
  stages.forEach(stage => {
    L.polyline(stage.seg.map(p => [p.lat, p.lon]), { color: stage.color, weight: 4, opacity: 0.95 }).addTo(APP.layerGroup);
  });
  stops.forEach(stop => {
    const plausibilityLevel = getPlausibilityLevel(stop.distanceToRouteKm ?? 0, APP.state.config.routePlausibilityCheck);
    const marker = L.marker([stop.lat, stop.lon]).addTo(APP.layerGroup);
    const note = plausibilityLevel ? `<br><strong>Achtung:</strong> ${getPlausibilityMessage(stop.distanceToRouteKm, plausibilityLevel)}` : '';
    marker.bindPopup(`<strong>${stop.name}</strong>${note}`);
  });
  if (APP.layerGroup.getLayers().length > 0) {
    APP.map.fitBounds(APP.layerGroup.getBounds(), { padding: [20, 20] });
  }
}

async function loadTour() {
  try {
    destroyCharts();
    setStatus('Lade Tour …');
    const routeName = document.getElementById('routeSelect').value;
    const routeLabel = routeName === 'alps' ? 'Alpenroute' : 'Seenroute';
    const [config, rawStops, points] = await Promise.all([
      loadJSON('data/config.json'),
      loadJSON(`data/${routeName}-stops.json`),
      loadGPX(routeName)
    ]);
    APP.state.config = config;
    APP.state.routeName = routeName;
    const preparedStops = [];
    for (const stop of rawStops) {
      const coords = await resolveStopCoordinates(stop);
      if (!coords) continue;
      const nearest = findNearestTrackPoint(coords, points);
      preparedStops.push({ ...stop, lat: coords.lat, lon: coords.lon, coordinateSource: coords.source, trackIndex: nearest.index, distanceToRouteKm: nearest.distanceToRouteKm });
    }
    preparedStops.sort((a, b) => a.trackIndex - b.trackIndex);
    const stages = buildStages(points, preparedStops, config);
    APP.state.stops = preparedStops;
    APP.state.stages = stages;
    renderSummary(stages, routeLabel);
    renderStages(stages);
    renderMap(stages, preparedStops);
    setStatus(`${stages.length} Tagesabschnitt(e) geladen`);
  } catch (err) {
    console.error(err);
    setStatus('Fehler beim Laden der Tour');
    document.getElementById('stages').innerHTML = `<section class="stage"><div class="stage-color" style="background:#dc2626"></div><div class="stage-body"><div class="stage-title">Fehler</div><p>${err.message}</p></div></section>`;
  }
}
