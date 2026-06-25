# Digitales Roadbook – V48

## Fix gegenüber V47

V47 wurde durch eine zu starke Umstrukturierung instabil. V48 basiert wieder auf der stabilen V46-Logik und übernimmt nur den gewünschten Marker-Feinschliff:

- Übernachtungs-KM-Angabe im Gesamthöhenprofil auf X-Achsen-Label-Höhe.
- Keine Einheit `km` beim Übernachtungs-KM-Label.
- Gestrichelte Linie endet auf der X-Achse.
- Gestrichelte Linie hat Linienstärke 1, analog zu den Achsen-/Gridlinien.
- Tour-Dropdown, Manifest-Laden und GPX-Parsing wurden zusätzlich validiert.


---
## Digitales Roadbook – V49 Wetter kompakt

V49 ergänzt V48 um eine kompakte mehrtägige Wetterprognose. Details siehe `PRD_Digitales_Roadbook_V49.md`.

### Wichtig

- Workflow: `.github/workflows/weather.yml`
- Sichtbare Workflow-Kopie: `_github_workflows_weather.yml_COPY_ONLY.txt`
- Generator: `scripts/generateWeather.js`
- Einstellungen: `data/weather-settings.json`
- Ergebnis: `data/weather.json`

### Mehrtagelogik

Etappe 1 startet mit `tourStartDateTime`. Jede weitere Etappe startet am Folgetag zur `dailyStageStartTime`.

### Kompakte Darstellung

Die UI zeigt keine langen Listen einzelner Wetterpunkte mehr. Stattdessen gibt es pro Etappe ein Symbol, Temperaturspanne, Regen-/Windwerte und eine KI-Kurzzusammenfassung.
