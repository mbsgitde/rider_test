# Digitales Roadbook – Hohenzollernradweg Relax

**Version:** 1.0 Beta  
**Projektart:** Studierendenprojekt im Kontext des Hochschulzertifikat KI-Kompetenzen für die Praxis der Hochschule München  
**Ziel:** Statisches, GitHub-Pages-fähiges Roadbook für mehrtägige Fahrradtouren mit GPX-Route, Etappen, Höhenprofil, Hotels/Overnights, Wetterprognose und KI-Zusammenfassung.

---

## Kurzüberblick

Dieses Projekt erzeugt aus einer GPX-Datei ein digitales Roadbook für eine mehrtägige Radtour. Die Route wird auf einer Karte und in Höhenprofilen dargestellt. Über `#Tags` in Komoot-/GPX-Wegpunktbeschreibungen werden Start, Übernachtungen, Ziel, Startzeiten, Hotel-Links und Tourlinks konfiguriert.

Die Wetterprognose wird automatisch über GitHub Actions erzeugt. Open-Meteo liefert die Wetterdaten. Die optionale KI-Zusammenfassung verwendet Groq mit `openai/gpt-oss-120b` / GPT-OSS 120B.

---

## Struktur

```text
index.html
assets/app.js
assets/styles.css
assets/generateWeather.js
data/config.json
data/gpx-manifest.json
data/weather-settings.json
data/weather.json
gpx/Hohenzollernradweg_Relax.gpx
.github/workflows/weather.yml
docs/
```

---

## Konfiguration

| Thema | Datei | Doku |
|---|---|---|
| Route/GPX | `data/gpx-manifest.json` | `docs/CONFIGURATION.md` |
| Dauer/Pausen | `data/config.json` | `docs/TIMING_AND_BREAKS.md` |
| Wetter/KI | `data/weather-settings.json` | `docs/WEATHER_AUTOMATION.md`, `docs/AI_SUMMARY.md` |
| Cronjob | `.github/workflows/weather.yml` | `docs/WEATHER_AUTOMATION.md` |
| Komoot-Tags | GPX `<desc>` | `docs/GPX_TAGS_KOMOOT.md` |
| Lizenzen | `LICENSE.md`, `NOTICE.md` | `docs/LICENSES_AND_ATTRIBUTION.md` |
| Code-Stil | `assets/app.js`, `assets/styles.css` | `docs/CODE_STYLE.md` |

---

## Komoot 250-Zeichen-Limit

Für dieses Projekt gilt als feste Vorgabe: pro Komoot-/GPX-Wegpunktbeschreibung (`<desc>`) maximal **250 Zeichen**.

## Hinweise zu KI und Lizenz

Der komplette Code wurde KI-Unterstützt mit mit Microsoft 365 Copilot erstellt. Das Projekt steht als eigener Projektcode unter MIT License. Siehe `LICENSE.md` und `NOTICE.md`.
