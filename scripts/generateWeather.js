/*
 * Digitales Roadbook V48 – Weather Generator
 * - liest data/gpx-manifest.json, data/config.json und data/weather-settings.json
 * - berechnet eine Timeline entlang der GPX-Strecke inkl. Höhenfaktor und Pausen
 * - fragt Open-Meteo Forecast stundenbasiert ab
 * - erzeugt Groq-KI-Zusammenfassungen für Gesamttour und Etappen
 *
 * Benötigtes GitHub Secret für KI: GROQ_API_KEY
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const GPX_DIR = path.join(ROOT, 'gpx');

function readJSON(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function writeJSON(file, data) { fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8'); }
function escRegExp(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function stripTags(s) { return String(s || '').replace(/<[^>]+>/g, '').trim(); }
function decodeXml(s) { return String(s || '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'"); }
function child(block, tag) { const m = new RegExp(`<[^:>]*:?${tag}[^>]*>([\\s\\S]*?)<\\/[^:>]*:?${tag}>`, 'i').exec(block || ''); return m ? decodeXml(stripTags(m[1])) : ''; }
function parseTags(desc) { const t = {}; let cur = null; for (const raw of String(desc || '').split(/\r?\n/)) { const line = raw.trim(); if (!line) continue; const m = /^#([\wÄÖÜäöüß-]+)\s*:\s*(.*)$/.exec(line); if (m) { cur = m[1].toLowerCase(); t[cur] = m[2].trim(); } else if (cur) t[cur] += '\n' + line; } return t; }
function tag(t, ...ks) { for (const k of ks) { const v = t[String(k).toLowerCase()]; if (v != null && String(v).trim()) return String(v).trim(); } return ''; }
function norm(v) { return String(v || '').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,''); }
function type(v) { const x = norm(v); if(['start','anfang','beginn','startpunkt','startbahnhof'].includes(x)) return 'start'; if(['overnight','hotel','unterkunft','uebernachtung','ubernachtung','lodging','campground','nacht','stay'].includes(x)) return 'overnight'; if(['end','ziel','ende','zielpunkt','zielbahnhof'].includes(x)) return 'end'; return null; }
function hav(a,b) { const R=6371, toRad=x=>x*Math.PI/180; const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon); const h=Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLon/2)**2; return 2*R*Math.atan2(Math.sqrt(h), Math.sqrt(1-h)); }
function nearest(c, pts) { let m=Infinity, idx=0; pts.forEach((p,i)=>{ const d=hav(c,p); if(d<m){m=d; idx=i;} }); return idx; }
function place(s) { return s.address || s.name || ''; }
function round(n, d=1) { return Number.isFinite(n) ? +n.toFixed(d) : null; }

function parseGPX(raw) {
  const metadataName = child(raw.match(/<metadata[\s\S]*?<\/metadata>/i)?.[0] || '', 'name');
  const trackName = child(raw.match(/<trk[\s\S]*?<\/trk>/i)?.[0] || '', 'name');
  const pts = [];
  const trkRegex = /<trkpt\b([^>]*)>([\s\S]*?)<\/trkpt>/gi;
  let m;
  while ((m = trkRegex.exec(raw))) {
    const lat = /lat=["']([^"']+)/i.exec(m[1]);
    const lon = /lon=["']([^"']+)/i.exec(m[1]);
    if (!lat || !lon) continue;
    pts.push({ lat:+lat[1], lon:+lon[1], ele:+(child(m[2], 'ele') || 0) });
  }
  const wpts = [];
  const wptRegex = /<wpt\b([^>]*)>([\s\S]*?)<\/wpt>/gi;
  while ((m = wptRegex.exec(raw))) {
    const lat = /lat=["']([^"']+)/i.exec(m[1]);
    const lon = /lon=["']([^"']+)/i.exec(m[1]);
    if (!lat || !lon) continue;
    const desc = child(m[2], 'desc');
    wpts.push({ name: child(m[2], 'name'), desc, sym: child(m[2], 'sym'), lat:+lat[1], lon:+lon[1], tags: parseTags(desc) });
  }
  return { metadataName, trackName, pts, wpts };
}

function stopsFromGPX(p) {
  return p.wpts.map(w => {
    const ty = type(tag(w.tags,'type','typ'));
    if (!ty) return null;
    const s = { name:w.name, type:ty, address:tag(w.tags,'ort','place','city'), comment:tag(w.tags,'comment','hinweis','notes'), hotelUrl:tag(w.tags,'url','hotelurl','website'), lat:w.lat, lon:w.lon, tags:w.tags };
    s.trackIndex = nearest(s, p.pts);
    return s;
  }).filter(Boolean).sort((a,b)=>a.trackIndex-b.trackIndex);
}

function buildStages(pts, stops, cfg) {
  const out=[];
  for (let i=0; i<stops.length-1; i++) {
    let a=stops[i].trackIndex, b=stops[i+1].trackIndex;
    if (b<=a) b=a+1;
    const seg=pts.slice(a,b+1);
    let dist=0, up=0, down=0;
    for (let j=1;j<seg.length;j++) {
      const d=hav(seg[j-1], seg[j]); dist+=d;
      const df=seg[j].ele-seg[j-1].ele;
      if (df>0) up+=df; else down+=Math.abs(df);
    }
    const speed=Math.max(cfg.minimumCyclingSpeedKmh, cfg.baseCyclingSpeedKmh-(up/1000)*cfg.climbSpeedReductionPer1000mKmh);
    out.push({ id:i+1, stageIndex:i, name:`${place(stops[i])} → ${place(stops[i+1])}`, startTrackIndex:a, endTrackIndex:b, seg, dist, up, down, speed, startKm:null, endKm:null });
  }
  let offset=0;
  out.forEach(s=>{ s.startKm=offset; offset+=s.dist; s.endKm=offset; });
  return out;
}

function validateForecastWindow(start) {
  const now = new Date();
  const diffDays = (start.getTime() - now.getTime()) / 86400000;
  if (diffDays < 0) return { ok:false, reason:'Tourstart liegt in der Vergangenheit. Es wird keine Forecast-Prognose erzeugt.' };
  if (diffDays > 14) return { ok:false, reason:'Tourstart liegt mehr als 14 Tage in der Zukunft. Es wird keine Forecast-Prognose erzeugt.' };
  return { ok:true, reason:null };
}

function buildTimelineSamples(stages, cfg, startTime, sampleKm) {
  const samples=[];
  let currentTime = new Date(startTime.getTime());
  let globalKm = 0;
  let nextSample = 0;
  const addSample = (p, stage, localKm) => {
    samples.push({ km: round(globalKm,1), localKm: round(localKm,1), stageId: stage.id, stageIndex: stage.stageIndex, stageName: stage.name, lat:p.lat, lon:p.lon, ele:round(p.ele,0), time:new Date(currentTime.getTime()).toISOString() });
    nextSample += sampleKm;
  };
  for (const stage of stages) {
    let localKm=0;
    if (samples.length===0 && stage.seg[0]) addSample(stage.seg[0], stage, 0);
    for (let j=1;j<stage.seg.length;j++) {
      const a=stage.seg[j-1], b=stage.seg[j];
      const d=hav(a,b);
      const minutes = (d / stage.speed) * 60;
      const shortBreakMinutes = minutes * (cfg.shortBreakMinutesPerHour || 0) / 60;
      currentTime = new Date(currentTime.getTime() + (minutes + shortBreakMinutes) * 60000);
      globalKm += d; localKm += d;
      if (globalKm + 1e-9 >= nextSample) addSample(b, stage, localKm);
    }
    currentTime = new Date(currentTime.getTime() + (cfg.longBreakMinutesPerStage || 0) * 60000);
  }
  return samples;
}

function closestHourlyWeather(data, targetIso) {
  const times = data?.hourly?.time || [];
  if (!times.length) return null;
  const target = new Date(targetIso).getTime();
  let best = 0, bestDiff = Infinity;
  times.forEach((t,i)=>{ const ms = new Date(t + 'Z').getTime(); const diff=Math.abs(ms-target); if(diff<bestDiff){best=i;bestDiff=diff;} });
  const h = data.hourly;
  return {
    weatherTime: times[best] + 'Z',
    temperature: round(h.temperature_2m?.[best],1),
    precipitation: round(h.precipitation?.[best],1),
    precipitationProbability: h.precipitation_probability?.[best] ?? null,
    windSpeed: round(h.wind_speed_10m?.[best],1),
    weatherCode: h.weather_code?.[best] ?? null
  };
}

const weatherCache = new Map();
async function fetchWeatherForPoint(p) {
  const key = `${p.lat.toFixed(3)},${p.lon.toFixed(3)}`;
  let data = weatherCache.get(key);
  if (!data) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&hourly=temperature_2m,precipitation,precipitation_probability,wind_speed_10m,weather_code&forecast_days=16&timezone=UTC`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo Fehler ${res.status} für ${key}`);
    data = await res.json();
    weatherCache.set(key, data);
  }
  return closestHourlyWeather(data, p.time);
}

function compactPoint(p) {
  const w=p.weather||{};
  return `km ${Math.round(p.km)} (${new Date(p.time).toLocaleString('de-DE',{weekday:'short',hour:'2-digit',minute:'2-digit', timeZone:'Europe/Berlin'})}): ${w.temperature ?? '–'}°C, Regen ${w.precipitation ?? '–'} mm, Regenwahrscheinlichkeit ${w.precipitationProbability ?? '–'}%, Wind ${w.windSpeed ?? '–'} km/h`;
}

async function groqSummary(title, points, settings) {
  if (!settings.ai?.enabled) return 'KI-Zusammenfassung deaktiviert.';
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return 'Keine KI-Zusammenfassung verfügbar: GROQ_API_KEY ist nicht gesetzt.';
  const prompt = `Du bist ein deutschsprachiger Wetterberater für mehrtägige Fahrradtouren.\nErstelle für "${title}" eine kurze, konkrete Prognose in 3-5 Sätzen.\nBerücksichtige Temperatur, Regen, Wind, zeitlichen Verlauf und Kilometerabschnitte.\nKeine Markdown-Tabelle, keine erfundenen Daten.\n\nWetterpunkte:\n${points.map(compactPoint).join('\n')}`;
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: settings.ai.model || 'llama-3.3-70b-versatile',
      temperature: 0.2,
      messages: [
        { role:'system', content:'Du formulierst präzise, knappe Wetterprognosen für Radreisen auf Deutsch.' },
        { role:'user', content: prompt }
      ]
    })
  });
  if (!res.ok) return `KI-Zusammenfassung konnte nicht erzeugt werden (Groq HTTP ${res.status}).`;
  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() || 'Keine KI-Zusammenfassung erhalten.';
}

async function main() {
  const config = readJSON(path.join(DATA_DIR, 'config.json'));
  const manifest = readJSON(path.join(DATA_DIR, 'gpx-manifest.json'));
  const settings = readJSON(path.join(DATA_DIR, 'weather-settings.json'));
  const files = Array.isArray(manifest) ? manifest : (manifest.files || []);
  const sourceFile = files[0];
  const outFile = path.join(DATA_DIR, 'weather.json');
  const start = new Date(settings.tourStartDateTime);
  const provider = { weather:'open-meteo', ai:settings.ai?.provider || 'groq' };
  const baseOut = { schemaVersion:1, generatedAt:new Date().toISOString(), sourceFile, tourStartDateTime:settings.tourStartDateTime, valid:false, reason:null, provider, global:{summary:''}, points:[], stages:[] };

  if (!settings.enabled) { baseOut.reason='Wetterprognose ist in data/weather-settings.json deaktiviert.'; baseOut.global.summary=baseOut.reason; writeJSON(outFile, baseOut); return; }
  const valid = validateForecastWindow(start);
  if (!valid.ok) { baseOut.reason=valid.reason; baseOut.global.summary=valid.reason; writeJSON(outFile, baseOut); return; }

  const gpxRaw = fs.readFileSync(path.join(GPX_DIR, sourceFile), 'utf8');
  const parsed = parseGPX(gpxRaw);
  const stops = stopsFromGPX(parsed);
  if (parsed.pts.length < 2) throw new Error('GPX enthält keine ausreichenden Trackpunkte.');
  if (stops.length < 2) throw new Error('GPX enthält keine ausreichenden Roadbook-Wegpunkte (#type).');

  const stages = buildStages(parsed.pts, stops, config.timing);
  const sampleKm = settings.sampleDistanceKm || 10;
  const samples = buildTimelineSamples(stages, config.timing, start, sampleKm);

  for (const p of samples) {
    p.weather = await fetchWeatherForPoint(p);
  }

  const stageOut = [];
  for (const s of stages) {
    const pts = samples.filter(p => p.stageId === s.id);
    stageOut.push({
      stageId: s.id,
      stageIndex: s.stageIndex,
      name: s.name,
      startKm: round(s.startKm,1),
      endKm: round(s.endKm,1),
      summary: await groqSummary(`Etappe ${s.id}: ${s.name}`, pts, settings),
      points: pts
    });
  }

  const globalSummary = await groqSummary(parsed.metadataName || parsed.trackName || sourceFile, samples, settings);
  const out = { ...baseOut, valid:true, reason:null, routeName:parsed.metadataName || parsed.trackName || sourceFile, totalDistanceKm:round(stages.at(-1).endKm,1), global:{ summary:globalSummary }, points:samples, stages:stageOut };
  writeJSON(outFile, out);
  console.log(`Wetterprognose geschrieben: ${outFile} (${samples.length} Punkte, ${stageOut.length} Etappen)`);
}

main().catch(err => {
  console.error(err);
  const outFile = path.join(DATA_DIR, 'weather.json');
  writeJSON(outFile, { schemaVersion:1, generatedAt:new Date().toISOString(), valid:false, reason:String(err.message||err), global:{summary:'Wetterprognose konnte nicht erzeugt werden: '+String(err.message||err)}, points:[], stages:[] });
  process.exit(1);
});
