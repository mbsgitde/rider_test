# Digitales Roadbook – Hohenzollernradweg Relax

**Status:** V50.8.x / v1.0-Prep  
**Ziel:** Statisches, GitHub-Pages-fähiges Roadbook für mehrtägige Fahrradtouren mit GPX-Route, Etappen, Höhenprofil, Hotels/Overnights, Wetterprognose und KI-Zusammenfassung.

---

## 1. Kurzüberblick

Dieses Projekt erzeugt aus einer GPX-Datei ein digitales Roadbook für eine mehrtägige Radtour. Die Route wird auf einer Karte und in Höhenprofilen dargestellt. Über spezielle `#Tags` in den Komoot-/GPX-Wegpunktbeschreibungen werden Start, Übernachtungen, Ziel, Startzeiten, Hotel-Links und Tourlinks konfiguriert.

Die Wetterprognose wird automatisch über GitHub Actions erzeugt. Dabei werden Open-Meteo-Wetterdaten geladen und optional per Groq-KI zu deutschen Kurzprognosen zusammengefasst.

---

## 2. Projektstruktur

```text
index.html
README.md
assets/
  app.js
  styles.css
  generateWeather.js
data/
  config.json
  gpx-manifest.json
  weather-settings.json
  weather.json
  Hohenzollernradweg_Relax-stops.fallback.json
gpx/
  Hohenzollernradweg_Relax.gpx
.github/workflows/
  weather.yml
docs/
  CONFIGURATION.md
  GPX_TAGS_KOMOOT.md
  WEATHER_AUTOMATION.md
  AI_SUMMARY.md
  TIMING_AND_BREAKS.md
  DEPLOYMENT_AND_GITHUB.md
  PRD.md
```

---

## 3. Schnellstart auf GitHub

1. ZIP entpacken.
2. Inhalt in das GitHub Repository kopieren.
3. Prüfen, dass diese Dateien vorhanden sind:

```text
index.html
assets/app.js
assets/styles.css
assets/generateWeather.js
data/config.json
data/gpx-manifest.json
data/weather-settings.json
gpx/Hohenzollernradweg_Relax.gpx
.github/workflows/weather.yml
```

4. Änderungen committen und pushen.
5. In GitHub unter **Actions → Weather Forecast** den Workflow manuell starten.
6. Nach erfolgreichem Lauf wird `data/weather.json` aktualisiert.
7. GitHub Pages öffnen und Browser-Cache leeren bzw. Hard Refresh durchführen.

---

## 4. Wichtigste Konfigurationen

| Thema | Datei | Dokumentation |
|---|---|---|
| Route/GPX-Datei | `data/gpx-manifest.json` | [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md) |
| Geschwindigkeit, Dauer, Pausen | `data/config.json` | [`docs/TIMING_AND_BREAKS.md`](docs/TIMING_AND_BREAKS.md) |
| Wetterstart, Modell, Sampling | `data/weather-settings.json` | [`docs/WEATHER_AUTOMATION.md`](docs/WEATHER_AUTOMATION.md) |
| GitHub Cronjob | `.github/workflows/weather.yml` | [`docs/WEATHER_AUTOMATION.md`](docs/WEATHER_AUTOMATION.md) |
| KI-Zusammenfassung | `data/weather-settings.json`, GitHub Secret `GROQ_API_KEY` | [`docs/AI_SUMMARY.md`](docs/AI_SUMMARY.md) |
| Komoot-/GPX-`#Tags` | GPX `<desc>` Feld | [`docs/GPX_TAGS_KOMOOT.md`](docs/GPX_TAGS_KOMOOT.md) |
| Deployment/GitHub Pages | GitHub Repository | [`docs/DEPLOYMENT_AND_GITHUB.md`](docs/DEPLOYMENT_AND_GITHUB.md) |
| Produktanforderungen | `docs/PRD.md` | [`docs/PRD.md`](docs/PRD.md) |

---

## 5. GPX-/Komoot-Tags

Die wichtigsten Tags im `<desc>`-Feld eines Wegpunkts:

```text
#type:start
#ort:Stuttgart
#date:01.07.2026
#starttime:11:45
```

```text
#type:overnight
#ort:Bebenhausen
#starttime:09:00
#url:www.hirsch-bebenhausen.de
```

```text
#type:end
#ort:Singen
#adfcStars:4
#adfcUrl:www.adfc-radtourismus.de/hohenzollern-radweg/
#officialUrl:www.schwaebischealb.de/rad/hohenzollern-radweg
```

Mehr Details: [`docs/GPX_TAGS_KOMOOT.md`](docs/GPX_TAGS_KOMOOT.md)

---

## 6. Wetter & KI

Die Wetterdaten werden durch `assets/generateWeather.js` erzeugt und nach `data/weather.json` geschrieben.

- Wetterquelle: Open-Meteo
- KI-Anbieter: Groq
- Modell aktuell: `llama-3.3-70b-versatile`
- Sampling aktuell: alle `10` km
- Tourstart-Fallback: `2026-07-01T09:00:00+02:00`
- Tagesstart-Fallback: `09:00`

Mehr Details:

- [`docs/WEATHER_AUTOMATION.md`](docs/WEATHER_AUTOMATION.md)
- [`docs/AI_SUMMARY.md`](docs/AI_SUMMARY.md)

---

## 7. Dauer- und Pausenberechnung

Die Dauerberechnung basiert auf `data/config.json`.

Aktuelle Werte:

```json
{
  "baseCyclingSpeedKmh": 19,
  "minimumCyclingSpeedKmh": 9,
  "climbSpeedReductionPer1000mKmh": 4,
  "shortBreakMinutesPerHour": 7,
  "longBreakMinutesPerStage": 20
}
```

Mehr Details: [`docs/TIMING_AND_BREAKS.md`](docs/TIMING_AND_BREAKS.md)

---

## 8. Release-Hinweise V50.8.x

- GPX-Datei mit deutschem Datum `DD.MM.YYYY` wird unterstützt.
- Folgeetappen benötigen nur `#starttime:hh:mm`.
- Weather Action nutzt `firstStart` korrekt und erzeugt `weather.json` ohne Initialisierungsfehler.
- Gesamtprofil soll normales Koordinatensystem behalten und Hotel-/Ziel-KM zusätzlich anzeigen.
- Tourlinks können am Zielpunkt gepflegt werden.
- URLs ohne `https://` werden automatisch normalisiert.

---

## 9. Tests vor v1.0

- `node --check assets/app.js`
- `node --check assets/generateWeather.js`
- GitHub Action **Weather Forecast** manuell ausführen
- Prüfen, ob `data/weather.json` `valid: true` enthält
- Gesamtübersicht prüfen:
  - Route sichtbar
  - Hotel-/Overnight-KM sichtbar
  - Ziel-KM, z. B. `260`, sichtbar
  - ADFC- und offizieller Tourlink sichtbar
- Mobile Ansicht prüfen

---

## 10. Weiterführende Dokumente

- [`docs/PRD.md`](docs/PRD.md)
- [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md)
- [`docs/GPX_TAGS_KOMOOT.md`](docs/GPX_TAGS_KOMOOT.md)
- [`docs/WEATHER_AUTOMATION.md`](docs/WEATHER_AUTOMATION.md)
- [`docs/AI_SUMMARY.md`](docs/AI_SUMMARY.md)
- [`docs/TIMING_AND_BREAKS.md`](docs/TIMING_AND_BREAKS.md)
- [`docs/DEPLOYMENT_AND_GITHUB.md`](docs/DEPLOYMENT_AND_GITHUB.md)
