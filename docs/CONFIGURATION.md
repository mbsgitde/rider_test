# Konfiguration – Digitales Roadbook

Diese Datei beschreibt die zentralen Konfigurationsdateien des Projekts.

---

## 1. `data/gpx-manifest.json`

Legt fest, welche GPX-Dateien geladen werden können.

Aktueller Inhalt:

```json
{
  "schemaVersion": 1,
  "description": "Statisches Manifest: Nur diese GPX-Dateien werden im Tour-Dropdown angezeigt. Anzeigename und Roadbook-Daten kommen aus dem GPX.",
  "files": [
    "Hohenzollernradweg_Relax.gpx"
  ]
}
```

### Wichtige Regeln

- Die Datei verweist auf GPX-Dateien im Ordner `gpx/`.
- Der Dateiname muss exakt übereinstimmen.
- Für eine neue Route muss die GPX-Datei in `gpx/` liegen und im Manifest referenziert werden.

---

## 2. `data/config.json`

Steuert allgemeine App- und Berechnungsparameter.

Aktueller Inhalt:

```json
{
  "timing": {
    "baseCyclingSpeedKmh": 19,
    "minimumCyclingSpeedKmh": 9,
    "climbSpeedReductionPer1000mKmh": 4,
    "shortBreakMinutesPerHour": 7,
    "longBreakMinutesPerStage": 20
  },
  "visuals": {
    "stageColors": [
      "#14b8a6",
      "#f59e0b",
      "#8b5cf6",
      "#84cc16",
      "#ec4899",
      "#06b6d4",
      "#f97316"
    ]
  }
}
```

### Wichtige Bereiche

- `timing`: Geschwindigkeit, Mindestgeschwindigkeit, Steigungsreduktion und Pausenlogik.
- `visuals.stageColors`: Farben der Etappen.

---

## 3. `data/weather-settings.json`

Steuert Wettergenerierung, Tourstart-Fallback, Sampling und KI-Modell.

Aktueller Inhalt:

```json
{
  "schemaVersion": 1,
  "enabled": true,
  "description": "V50.6: Etappen-Wetter-Einzahler mit Regen/Wind-Icons und aufklappbarer Detailprognose.",
  "tourStartDateTime": "2026-07-01T09:00:00+02:00",
  "dailyStageStartTime": "09:00",
  "sampleDistanceKm": 10,
  "mapMarkers": {
    "global": "none",
    "stage": "none"
  },
  "weatherProvider": "open-meteo",
  "ai": {
    "enabled": true,
    "provider": "groq",
    "model": "llama-3.3-70b-versatile"
  }
}
```

---

## 4. `data/weather.json`

Wird automatisch erzeugt. Diese Datei sollte normalerweise nicht manuell gepflegt werden.

### Erzeugung

```bash
node assets/generateWeather.js
```

oder per GitHub Action:

```text
Actions → Weather Forecast → Run workflow
```

---

## 5. `data/Hohenzollernradweg_Relax-stops.fallback.json`

Fallback-Datei für Stops, falls GPX-Tags nicht vollständig ausgewertet werden können. Vorrangig sollen Stops jedoch über GPX-`#Tags` gepflegt werden.
