/*
 * Digitales Roadbook – 1.0 Beta
 *
 * Erzeugt data/weather.json aus GPX, Open-Meteo und optional Groq GPT-OSS 120B.
 * Der komplette Code wurde KI-Unterstützt mit mit Microsoft 365 Copilot erstellt.
 */

const fs = require('fs');

const DATA_DIR = 'data';
const GPX_DIR = 'gpx';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf8');
}
function stripXml(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}
function child(block, tag) {
  const pattern = new RegExp(`<[^:>]*:?${tag}[^>]*>([\\s\\S]*?)<\\/[^:>]*:?${tag}>`, 'i');
  const match = pattern.exec(block || '');
  return match ? stripXml(match[1]) : '';
}
function parseTags(desc) {
  const tags = {};
  let current = null;
  for (const raw of String(desc || '').split(/\r?\n/)) {
    const line = raw.trim();
    const match = /^#([\wÄÖÜäöüß-]+)\s*:\s*(.*)$/.exec(line);
    if (match) {
      current = match[1].toLowerCase();
      tags[current] = match[2].trim();
    } else if (current && line) {
      tags[current] += '\n' + line;
    }
  }
  return tags;
}
function tag(tags, ...keys) {
  for (const key of keys) {
    const value = tags[key.toLowerCase()];
    if (value && String(value).trim()) return String(value).trim();
  }
  return '';
}
function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '');
}
function roadbookType(value) {
  const normalized = normalize(value);
  if (['start', 'anfang', 'beginn', 'startpunkt', 'startbahnhof'].includes(normalized)) return 'start';
  if (['overnight', 'hotel', 'unterkunft', 'uebernachtung', 'ubernachtung', 'lodging', 'campground', 'nacht', 'stay'].includes(normalized)) return 'overnight';
  if (['end', 'ziel', 'ende', 'zielpunkt', 'zielbahnhof'].includes(normalized)) return 'end';
  return null;
}
function haversine(a, b) {
  const radius = 6371.0088;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const lat1 = rad(a.lat);
  const lat2 = rad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
function nearestIndex(coord, points) {
  let best = 0;
  let bestDistance = Infinity;
  points.forEach((point, index) => {
    const distance = haversine(coord, point);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}
function parseGpx(raw) {
  const points = [];
  let match;
  const trackRegex = /<trkpt\b([^>]*)>([\s\S]*?)<\/trkpt>/gi;
  while ((match = trackRegex.exec(raw))) {
    const lat = /lat=["']([^"']+)/i.exec(match[1]);
    const lon = /lon=["']([^"']+)/i.exec(match[1]);
    if (lat && lon) points.push({ lat: +lat[1], lon: +lon[1], ele: +(child(match[2], 'ele') || 0) });
  }

  const waypoints = [];
  const waypointRegex = /<wpt\b([^>]*)>([\s\S]*?)<\/wpt>/gi;
  while ((match = waypointRegex.exec(raw))) {
    const lat = /lat=["']([^"']+)/i.exec(match[1]);
    const lon = /lon=["']([^"']+)/i.exec(match[1]);
    if (!lat || !lon) continue;
    const desc = child(match[2], 'desc');
    waypoints.push({ name: child(match[2], 'name'), tags: parseTags(desc), lat: +lat[1], lon: +lon[1] });
  }

  return {
    metadataName: child(raw.match(/<metadata[\s\S]*?<\/metadata>/i)?.[0] || '', 'name'),
    trackName: child(raw.match(/<trk[\s\S]*?<\/trk>/i)?.[0] || '', 'name'),
    points,
    waypoints,
  };
}
function buildStops(parsed) {
  return parsed.waypoints
    .map((waypoint) => {
      const type = roadbookType(tag(waypoint.tags, 'type', 'typ'));
      if (!type) return null;
      const stop = {
        name: waypoint.name,
        type,
        address: tag(waypoint.tags, 'ort', 'place', 'city'),
        lat: waypoint.lat,
        lon: waypoint.lon,
        tags: waypoint.tags,
      };
      stop.trackIndex = nearestIndex(stop, parsed.points);
      return stop;
    })
    .filter(Boolean)
    .sort((a, b) => a.trackIndex - b.trackIndex);
}
function buildStages(points, stops, timing) {
  const stages = [];
  let offset = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    let start = stops[i].trackIndex;
    let end = stops[i + 1].trackIndex;
    if (end <= start) end = start + 1;
    const segment = points.slice(start, end + 1);
    let distance = 0;
    let up = 0;
    for (let j = 1; j < segment.length; j++) {
      distance += haversine(segment[j - 1], segment[j]);
      const diff = segment[j].ele - segment[j - 1].ele;
      if (diff > 0) up += diff;
    }
    const speed = Math.max(
      timing.minimumCyclingSpeedKmh,
      timing.baseCyclingSpeedKmh - (up / 1000) * timing.climbSpeedReductionPer1000mKmh,
    );
    stages.push({
      id: i + 1,
      stageIndex: i,
      name: `${stops[i].address || stops[i].name} → ${stops[i + 1].address || stops[i + 1].name}`,
      segment,
      distance,
      up,
      speed,
      startKm: offset,
      endKm: offset + distance,
      startStop: stops[i],
    });
    offset += distance;
  }
  return stages;
}
function offsetOf(iso) {
  const match = String(iso).match(/([+-])(\d{2}):(\d{2})$/);
  return match ? (match[1] === '-' ? -1 : 1) * (+match[2] * 60 + +match[3]) : 0;
}
function partsOf(iso) {
  const match = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) throw Error('Ungültige tourStartDateTime');
  return { y: +match[1], mo: +match[2], d: +match[3], h: +match[4], mi: +match[5] };
}
function parseDateGerman(value) {
  const match = String(value || '').trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return match ? { y: +match[3], mo: +match[2], d: +match[1] } : null;
}
function normalizeTime(value) {
  if (!value) return '';
  const raw = String(value).trim().replace(/h$/i, '');
  return /^\d{2}:\d{2}$/.test(raw) ? raw + ':00' : raw;
}
function baseDateParts(settings, startStop) {
  const germanDate = parseDateGerman(tag(startStop?.tags || {}, 'date', 'datum'));
  return germanDate || partsOf(settings.tourStartDateTime);
}
function stageStart(settings, stageIndex, stop, startStop) {
  const tags = stop?.tags || {};
  const explicitDateTime = tag(tags, 'datetime', 'startdatetime');
  if (explicitDateTime) {
    return /([+-]\d{2}:\d{2}|Z)$/.test(explicitDateTime)
      ? new Date(explicitDateTime)
      : new Date(explicitDateTime + (settings.timezoneOffset || '+02:00'));
  }
  const base = baseDateParts(settings, startStop || stop);
  const explicitDate = parseDateGerman(tag(tags, 'date', 'datum'));
  const dateParts = explicitDate || { ...base, d: base.d + stageIndex };
  let time = tag(tags, 'starttime', 'start', 'time', 'uhrzeit');
  if (!time) time = stageIndex === 0 ? String(settings.tourStartDateTime).slice(11, 16) : settings.dailyStageStartTime || '09:00';
  const [hours, minutes] = normalizeTime(time).split(':').map(Number);
  const offset = offsetOf(settings.tourStartDateTime) || offsetOf('2000-01-01T00:00:00' + (settings.timezoneOffset || '+02:00'));
  return new Date(Date.UTC(dateParts.y, dateParts.mo - 1, dateParts.d, hours || 0, minutes || 0) - offset * 60000);
}
function validateForecastWindow(start, days) {
  const now = new Date();
  const last = new Date(start.getTime() + (days - 1) * 86400000);
  if ((start - now) / 86400000 < 0) return [false, 'Tourstart liegt in der Vergangenheit.'];
  if ((last - now) / 86400000 > 14) return [false, `Die letzte Etappe liegt mehr als 14 Tage in der Zukunft (${days} Etappen).`];
  return [true, null];
}
function forecastQuality(start, generatedAt = new Date()) {
  const daysAhead = Math.max(0, Math.round((new Date(start) - generatedAt) / 86400000));
  let label = 'hoch';
  let score = 90;
  if (daysAhead > 3) { label = 'mittel'; score = 70; }
  if (daysAhead > 7) { label = 'niedrig'; score = 45; }
  return { label, score, daysAhead };
}
function sampleRoute(stages, timing, settings, sampleKm, startStop) {
  const samples = [];
  let globalKm = 0;
  let nextSample = 0;
  function add(point, stage, localKm, time) {
    samples.push({
      km: +globalKm.toFixed(1),
      localKm: +localKm.toFixed(1),
      stageId: stage.id,
      stageIndex: stage.stageIndex,
      stageName: stage.name,
      stageStartTime: stageStart(settings, stage.stageIndex, stage.startStop, startStop).toISOString(),
      lat: point.lat,
      lon: point.lon,
      ele: Math.round(point.ele),
      time: new Date(time).toISOString(),
    });
    nextSample += sampleKm;
  }
  for (const stage of stages) {
    let time = stageStart(settings, stage.stageIndex, stage.startStop, startStop);
    let localKm = 0;
    if (!samples.length) add(stage.segment[0], stage, 0, time);
    else if (globalKm >= nextSample - 1e-9) add(stage.segment[0], stage, 0, time);
    for (let j = 1; j < stage.segment.length; j++) {
      const distance = haversine(stage.segment[j - 1], stage.segment[j]);
      const minutes = (distance / stage.speed) * 60;
      time = new Date(time.getTime() + (minutes + (minutes * (timing.shortBreakMinutesPerHour || 0)) / 60) * 60000);
      globalKm += distance;
      localKm += distance;
      if (globalKm >= nextSample - 1e-9) add(stage.segment[j], stage, localKm, time);
    }
  }
  return samples;
}
const weatherCache = new Map();
async function fetchWeather(point) {
  const key = `${point.lat.toFixed(3)},${point.lon.toFixed(3)}`;
  let data = weatherCache.get(key);
  if (!data) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${point.lat}&longitude=${point.lon}&hourly=temperature_2m,precipitation,precipitation_probability,wind_speed_10m,weather_code&forecast_days=16&timezone=UTC`;
    const response = await fetch(url);
    if (!response.ok) throw Error('Open-Meteo HTTP ' + response.status);
    data = await response.json();
    weatherCache.set(key, data);
  }
  const target = new Date(point.time).getTime();
  let bestIndex = 0;
  let bestDiff = Infinity;
  data.hourly.time.forEach((time, index) => {
    const diff = Math.abs(new Date(time + 'Z') - target);
    if (diff < bestDiff) { bestDiff = diff; bestIndex = index; }
  });
  const hourly = data.hourly;
  return {
    weatherTime: hourly.time[bestIndex] + 'Z',
    temperature: hourly.temperature_2m[bestIndex],
    precipitation: hourly.precipitation[bestIndex],
    precipitationProbability: hourly.precipitation_probability[bestIndex],
    windSpeed: hourly.wind_speed_10m[bestIndex],
    weatherCode: hourly.weather_code[bestIndex],
  };
}
function round(value, decimals = 1) {
  return Number.isFinite(value) ? +value.toFixed(decimals) : null;
}
function weatherIcon(stats) {
  if ((stats.totalPrecipitation || 0) > 3 || (stats.maxPrecipitationProbability || 0) >= 60) return '🌧️';
  if ((stats.totalPrecipitation || 0) > 0.5 || (stats.maxPrecipitationProbability || 0) >= 35) return '🌦️';
  if ([0, 1].includes(+stats.dominantWeatherCode)) return '☀️';
  if ([2, 3].includes(+stats.dominantWeatherCode)) return '⛅';
  return '🌤️';
}
function pick(points, mode) {
  if (!points.length) return null;
  if (mode === 'start') return points[0];
  if (mode === 'end') return points[points.length - 1];
  return points[Math.floor(points.length / 2)];
}
function stats(points) {
  if (!points.length) return null;
  const values = (key) => points.map((point) => point.weather?.[key]).filter(Number.isFinite);
  const temps = values('temperature');
  const precipitation = values('precipitation');
  const probability = values('precipitationProbability');
  const wind = values('windSpeed');
  const codes = values('weatherCode');
  const counts = {};
  codes.forEach((code) => { counts[code] = (counts[code] || 0) + 1; });
  const dominant = +Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const result = {
    minTemperature: round(Math.min(...temps), 0),
    maxTemperature: round(Math.max(...temps), 0),
    totalPrecipitation: round(precipitation.reduce((a, b) => a + b, 0), 1),
    maxPrecipitationProbability: round(Math.max(...probability), 0),
    maxWindSpeed: round(Math.max(...wind), 0),
    dominantWeatherCode: Number.isFinite(dominant) ? dominant : null,
    startPoint: pick(points, 'start'),
    markerPoint: pick(points, 'mid'),
    endPoint: pick(points, 'end'),
  };
  result.icon = weatherIcon(result);
  return result;
}
function compactPoints(points) {
  const candidates = [pick(points, 'start'), pick(points, 'mid'), pick(points, 'end')];
  return candidates.filter((point, index, array) => point && array.findIndex((other) => other.km === point.km && other.time === point.time) === index);
}
function formatDateGerman(iso) {
  const date = new Date(iso);
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getFullYear()).slice(-2)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}h`;
}
function weatherLine(point) {
  const weather = point.weather || {};
  return `Etappe ${point.stageId}, ${Math.round(point.localKm)} km lokal / ${Math.round(point.km)} km gesamt (${formatDateGerman(point.time)}): ${weather.temperature}°C, Regen ${weather.precipitation} mm, Regenwahrscheinlichkeit ${weather.precipitationProbability}%, Wind ${weather.windSpeed} km/h`;
}
function factsBlock(meta = {}) {
  if (meta.type === 'stage') {
    return `Verbindliche Fakten zur Etappe:\n- Etappe: ${meta.stageId}\n- Name: ${meta.stageName}\n- Exakte Etappendistanz: ${round(meta.stageDistanceKm, 1)} km\n- Startzeit: ${formatDateGerman(meta.stageStartTime)}\n- Prognosegüte: ${meta.forecastQuality?.label || '–'}\n\nRegeln:\n- Nenne die Etappendistanz NICHT im Fließtext.\n- Erfinde keine Distanzen, Zeiten oder Wetterwerte.`;
  }
  if (meta.type === 'global') {
    return `Verbindliche Fakten zur Gesamttour:\n- Tour: ${meta.routeName}\n- Exakte Gesamtdistanz: ${round(meta.totalDistanceKm, 1)} km\n- Anzahl Etappen: ${meta.stageCount}\n- Startzeit Gesamttour: ${formatDateGerman(meta.tourStartDateTime)}\n${(meta.stages || []).map((stage) => `- Etappe ${stage.id}: ${stage.name}, ${round(stage.dist, 1)} km, Start ${formatDateGerman(stage.startTime)}`).join('\n')}\n\nRegeln:\n- Erfinde keine Distanzen, Zeiten oder Wetterwerte.`;
  }
  return '';
}
async function summary(title, points, settings, meta = {}) {
  if (!settings.ai?.enabled) return 'KI-Zusammenfassung deaktiviert.';
  const key = process.env.GROQ_API_KEY;
  if (!key) return 'Keine KI-Zusammenfassung verfügbar: GROQ_API_KEY ist nicht gesetzt.';
  const prompt = `Du bist Wetterberater für eine mehrtägige Fahrradtour.\n\n${factsBlock(meta)}\n\nAufgabe: Fasse "${title}" in 3-5 deutschen Sätzen zusammen. Fokus ausschließlich auf Wetter.\n\nWetterpunkte:\n${points.map(weatherLine).join('\n')}`;
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.ai.model || 'openai/gpt-oss-120b',
      temperature: 0.1,
      messages: [
        { role: 'system', content: 'Du formulierst knappe Wetterprognosen für Radreisen auf Deutsch. Halte dich strikt an Fakten.' },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!response.ok) return `KI-Zusammenfassung konnte nicht erzeugt werden (Groq HTTP ${response.status}).`;
  const json = await response.json();
  return json.choices?.[0]?.message?.content?.trim() || 'Keine KI-Zusammenfassung erhalten.';
}
async function main() {
  const timing = readJson(`${DATA_DIR}/config.json`).timing;
  const manifest = readJson(`${DATA_DIR}/gpx-manifest.json`);
  const settings = readJson(`${DATA_DIR}/weather-settings.json`);
  const file = (Array.isArray(manifest) ? manifest : manifest.files)[0];
  const generatedAt = new Date();
  const output = {
    schemaVersion: 1,
    generatedAt: generatedAt.toISOString(),
    sourceFile: file,
    tourStartDateTime: settings.tourStartDateTime,
    dailyStageStartTime: settings.dailyStageStartTime || '09:00',
    valid: false,
    provider: { weather: 'open-meteo', ai: 'groq' },
    global: { summary: '', stats: null },
    points: [],
    stages: [],
  };
  const parsed = parseGpx(fs.readFileSync(`${GPX_DIR}/${file}`, 'utf8'));
  const stops = buildStops(parsed);
  const stages = buildStages(parsed.points, stops, timing);
  const startStop = stops.find((stop) => stop.type === 'start') || stages[0]?.startStop;
  const firstStart = stageStart(settings, 0, stages[0]?.startStop, startStop);
  output.tourStartDateTime = firstStart.toISOString();
  const [valid, reason] = validateForecastWindow(firstStart, stages.length);
  if (!valid) {
    output.reason = reason;
    output.global.summary = reason;
    writeJson(`${DATA_DIR}/weather.json`, output);
    return;
  }
  const samples = sampleRoute(stages, timing, settings, settings.sampleDistanceKm || 10, startStop);
  for (const point of samples) point.weather = await fetchWeather(point);
  for (const stage of stages) {
    const stagePoints = samples.filter((point) => point.stageId === stage.id);
    const start = stageStart(settings, stage.stageIndex, stage.startStop, startStop).toISOString();
    const quality = forecastQuality(start, generatedAt);
    output.stages.push({
      stageId: stage.id,
      stageIndex: stage.stageIndex,
      name: stage.name,
      startKm: +stage.startKm.toFixed(1),
      endKm: +stage.endKm.toFixed(1),
      stageDistanceKm: +stage.distance.toFixed(1),
      stageStartTime: start,
      forecastQuality: quality,
      stats: stats(stagePoints),
      compactPoints: compactPoints(stagePoints),
      summary: await summary(`Etappe ${stage.id}: ${stage.name}`, stagePoints, settings, {
        type: 'stage',
        stageId: stage.id,
        stageName: stage.name,
        stageDistanceKm: stage.distance,
        startKm: stage.startKm,
        endKm: stage.endKm,
        stageStartTime: start,
        forecastQuality: quality,
      }),
      points: stagePoints,
    });
  }
  output.valid = true;
  output.routeName = parsed.metadataName || parsed.trackName || file;
  output.totalDistanceKm = +stages.at(-1).endKm.toFixed(1);
  output.points = samples;
  output.global.stats = stats(samples);
  output.global.forecastQuality = forecastQuality(firstStart, generatedAt);
  output.global.summary = await summary(output.routeName, samples, settings, {
    type: 'global',
    routeName: output.routeName,
    totalDistanceKm: output.totalDistanceKm,
    stageCount: stages.length,
    tourStartDateTime: firstStart.toISOString(),
    forecastQuality: output.global.forecastQuality,
    stages: stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      dist: stage.distance,
      startTime: stageStart(settings, stage.stageIndex, stage.startStop, startStop).toISOString(),
    })),
  });
  writeJson(`${DATA_DIR}/weather.json`, output);
  console.log(`1.0 Beta Wetter geschrieben: ${output.totalDistanceKm} km, ${samples.length} Punkte, ${output.stages.length} Etappen, Modell ${settings.ai?.model}`);
}
main().catch((error) => {
  console.error(error);
  writeJson(`${DATA_DIR}/weather.json`, {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    valid: false,
    reason: String(error.message || error),
    global: { summary: 'Wetterprognose konnte nicht erzeugt werden: ' + String(error.message || error), stats: null },
    points: [],
    stages: [],
  });
  process.exit(1);
});
