# Digitales Roadbook

**Version:** 1.0 Beta  
**Projektart:** Studierendenprojekt im Kontext des Hochschulzertifikat KI-Kompetenzen für die Praxis der Hochschule München  
**Ziel:** Statisches, GitHub-Pages-fähiges Roadbook für mehrtägige Fahrradtouren mit GPX-Route, Etappen, Höhenprofil, Hotels/Übernachtungen, Wetterprognose und KI-Zusammenfassung.

---

## Inhaltsverzeichnis

1. [Was macht dieses Projekt?](#was-macht-dieses-projekt)
2. [Projektstruktur](#projektstruktur)
3. [Schnellstart](#schnellstart)
4. [Konfiguration im Überblick](#konfiguration-im-überblick)
5. [GPX- und Komoot-Tags](#gpx--und-komoot-tags)
6. [Wetter, Cronjob und KI](#wetter-cronjob-und-ki)
7. [Dauer- und Pausenberechnung](#dauer--und-pausenberechnung)
8. [Gesamtübersicht und Höhenprofil](#gesamtübersicht-und-höhenprofil)
9. [Lizenz, Attribution und KI-Hinweis](#lizenz-attribution-und-ki-hinweis)
10. [Wichtige Dateien](#wichtige-dateien)
11. [Tests vor einem Release](#tests-vor-einem-release)

---

## Was macht dieses Projekt?

Das digitale Roadbook erzeugt aus einer GPX-Datei eine interaktive Tour-Webseite. Die Anwendung läuft komplett statisch, z. B. auf GitHub Pages, und benötigt keinen eigenen Server.

Die App zeigt:

- die Gesamtstrecke auf einer Leaflet-Karte,
- Tagesetappen auf Basis von Start-, Hotel-/Overnight- und Zielpunkten,
- Höhenprofile mit Distanz und Höhenmetern,
- Hotel-/Übernachtungspunkte,
- Tourlinks wie ADFC und offizieller Tourlink,
- Wetterprognosen entlang der Route,
- KI-generierte Wetterzusammenfassungen über Groq GPT-OSS 120B.

Die zentrale Idee: **Komoot-/GPX-Wegpunkte werden mit kurzen `#Tags` angereichert**, damit die App daraus Roadbook-Informationen, Etappen und Wetterzeiten ableiten kann.

---

## Projektstruktur

```text
index.html
README.md
LICENSE.md
NOTICE.md
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
  LICENSES_AND_ATTRIBUTION.md
  CODE_STYLE.md
  PRD.md
```

---

## Schnellstart

1. ZIP entpacken oder Repository klonen.
2. Dateien ins GitHub Repository kopieren.
3. Änderungen committen und pushen.
4. GitHub Pages aktivieren.
5. GitHub Action starten:

```text
GitHub → Actions → Weather Forecast → Run workflow
```

6. Nach erfolgreichem Lauf wird `data/weather.json` durch die Action aktualisiert.
7. Webseite öffnen und Browser-Cache leeren bzw. Hard Refresh durchführen.

Details: [`docs/DEPLOYMENT_AND_GITHUB.md`](docs/DEPLOYMENT_AND_GITHUB.md)

---

## Konfiguration im Überblick

| Bereich | Datei | Beschreibung | Detaildoku |
|---|---|---|---|
| Route / GPX | `data/gpx-manifest.json` | Legt fest, welche GPX-Datei geladen wird. | [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md) |
| Dauer / Pausen | `data/config.json` | Geschwindigkeit, Mindestgeschwindigkeit, Steigungsfaktor und Pausen. | [`docs/TIMING_AND_BREAKS.md`](docs/TIMING_AND_BREAKS.md) |
| Wetter | `data/weather-settings.json` | Tourstart-Fallback, Sampling, Zeitzone, KI-Modell. | [`docs/WEATHER_AUTOMATION.md`](docs/WEATHER_AUTOMATION.md) |
| Cronjob | `.github/workflows/weather.yml` | Zeitgesteuerte Wetteraktualisierung. | [`docs/WEATHER_AUTOMATION.md`](docs/WEATHER_AUTOMATION.md) |
| KI | `data/weather-settings.json` + `GROQ_API_KEY` | KI-Zusammenfassung mit Groq `openai/gpt-oss-120b`. | [`docs/AI_SUMMARY.md`](docs/AI_SUMMARY.md) |
| Komoot-Tags | GPX `<desc>` | Roadbook-Tags für Start, Hotels, Ziel, Zeiten und Links. | [`docs/GPX_TAGS_KOMOOT.md`](docs/GPX_TAGS_KOMOOT.md) |
| Lizenzen | `LICENSE.md`, `NOTICE.md` | Projektlizenz, Drittbibliotheken, KI-Hinweis. | [`docs/LICENSES_AND_ATTRIBUTION.md`](docs/LICENSES_AND_ATTRIBUTION.md) |
| Produktanforderungen | `docs/PRD.md` | Produktziele, Anforderungen, Akzeptanzkriterien. | [`docs/PRD.md`](docs/PRD.md) |

---

## GPX- und Komoot-Tags

Die App liest Roadbook-Informationen aus dem `<desc>`-Feld der GPX-Wegpunkte.

**Wichtig:** Für dieses Projekt gilt das Komoot-Limit als feste Vorgabe: **maximal 250 Zeichen pro Wegpunktbeschreibung**.

### Startpunkt

```text
#type:start
#ort:Stuttgart
#date:01.07.2026
#starttime:11:45
#comment:Ankunft um 11:00h
```

### Übernachtung / Hotel / Start der nächsten Etappe

```text
#type:overnight
#ort:Bebenhausen
#starttime:09:00
#url:www.hirsch-bebenhausen.de
#comment:Check-In ab 15h
```

### Zielpunkt mit Tourlinks

```text
#type:end
#ort:Singen
#comment:Rückreise Zug 16:50
#adfcStars:4
#adfcUrl:www.adfc-radtourismus.de/hohenzollern-radweg/
#officialUrl:www.schwaebischealb.de/rad/hohenzollern-radweg
```

Tipps wegen 250-Zeichen-Limit:

- `https://` weglassen; die App ergänzt es automatisch.
- Lange Tourlinks bevorzugt am Zielpunkt speichern.
- Kommentare kurz halten.
- Bei Folgeetappen nur `#starttime` pflegen; das Datum wird automatisch aus dem Startdatum berechnet.

Details: [`docs/GPX_TAGS_KOMOOT.md`](docs/GPX_TAGS_KOMOOT.md)

---

## Wetter, Cronjob und KI

Die Wetterdatei wird automatisch erzeugt:

```text
data/weather.json
```

Der Generator ist:

```text
assets/generateWeather.js
```

Die GitHub Action liegt hier:

```text
.github/workflows/weather.yml
```

Aktuelle KI-Konfiguration:

```text
Anbieter: Groq
Modell-ID: openai/gpt-oss-120b
Anzeigename: GPT-OSS 120B
Secret: GROQ_API_KEY
```

Ohne `GROQ_API_KEY` läuft die Wettergenerierung weiter, aber die KI-Zusammenfassung wird durch einen Hinweistext ersetzt.

Details:

- [`docs/WEATHER_AUTOMATION.md`](docs/WEATHER_AUTOMATION.md)
- [`docs/AI_SUMMARY.md`](docs/AI_SUMMARY.md)

---

## Dauer- und Pausenberechnung

Die Dauerberechnung wird über `data/config.json` gesteuert.

Aktuelle Timing-Werte:

```json
{
  "baseCyclingSpeedKmh": 19,
  "minimumCyclingSpeedKmh": 9,
  "climbSpeedReductionPer1000mKmh": 4,
  "shortBreakMinutesPerHour": 7,
  "longBreakMinutesPerStage": 20
}
```

Grundprinzip:

```text
Geschwindigkeit = Grundgeschwindigkeit - Höhenmeterfaktor
Fahrzeit = Distanz / Geschwindigkeit
Pausenzeit = Fahrzeit × Pausenminuten pro Stunde
Gesamtzeit = Fahrzeit + Pausenzeit
```

Details: [`docs/TIMING_AND_BREAKS.md`](docs/TIMING_AND_BREAKS.md)

---

## Gesamtübersicht und Höhenprofil

Die Gesamtübersicht nutzt ein normales Chart.js-Koordinatensystem mit **25-km-Raster**. Zusätzlich werden die Kilometerstände der Hotel-/Übernachtungspunkte und die Ziel-/Gesamtdistanz als Marker im Profil eingeblendet.

Beispiel für den Hohenzollernradweg:

```text
Gesamtdistanz: ca. 259,7 km → Marker 260
```

---

## Lizenz, Attribution und KI-Hinweis

Dieses Projekt ist ein **Studierendenprojekt im Kontext des Hochschulzertifikat KI-Kompetenzen für die Praxis der Hochschule München**.

Der komplette Code wurde KI-Unterstützt mit mit Microsoft 365 Copilot erstellt.

Projektlizenz:

```text
MIT License
```

Drittanbieter und Datenquellen:

- Leaflet – BSD 2-Clause License
- Chart.js – MIT License
- JSZip – MIT/GPLv3 dual licensing; Nutzung hier unter MIT-Option
- OpenStreetMap-Daten – ODbL, Attribution erforderlich
- OpenTopoMap – CC-BY-SA-/Attributionshinweise beachten
- Open-Meteo – Wetterdaten
- Groq – optionale KI-Zusammenfassungen

Details:

- [`LICENSE.md`](LICENSE.md)
- [`NOTICE.md`](NOTICE.md)
- [`docs/LICENSES_AND_ATTRIBUTION.md`](docs/LICENSES_AND_ATTRIBUTION.md)

---

## Wichtige Dateien

### `index.html`

Startseite und Einstiegspunkt der App. Enthält jetzt zusätzlich einen Footer mit Lizenz-, Attribution- und KI-Hinweisen.

### `assets/app.js`

Frontend-Logik:

- GPX laden und parsen
- Etappen erzeugen
- Leaflet-Karte rendern
- Chart.js-Höhenprofile rendern
- Wetterboxen anzeigen
- GPX-/ZIP-Downloads erzeugen

### `assets/generateWeather.js`

Node.js-Script für GitHub Actions:

- GPX lesen
- Etappenstartzeiten aus GPX-Tags berechnen
- Wetterdaten von Open-Meteo laden
- KI-Zusammenfassungen via Groq erzeugen
- `data/weather.json` schreiben

### `data/weather-settings.json`

Konfiguriert Wetter, Sampling, Zeitzone und KI-Modell.

### `.github/workflows/weather.yml`

GitHub Action für automatische Wetterupdates.

---

## Tests vor einem Release

```bash
node --check assets/app.js
node --check assets/generateWeather.js
```

Zusätzlich manuell prüfen:

- GitHub Action **Weather Forecast** läuft erfolgreich.
- `data/weather.json` enthält `valid: true`.
- Gesamtübersicht zeigt 25-km-Raster.
- Hotel-/Overnight-KM und Ziel-KM sind sichtbar.
- ADFC-/Official-Link werden angezeigt.
- Footer ist in `index.html` sichtbar.
- Mobile Ansicht funktioniert.
