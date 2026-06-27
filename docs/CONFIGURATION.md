# Konfiguration

## `data/gpx-manifest.json`

```json
{
  "schemaVersion": 1,
  "description": "Statisches Manifest: Nur diese GPX-Dateien werden im Tour-Dropdown angezeigt. Anzeigename und Roadbook-Daten kommen aus dem GPX.",
  "files": [
    "Hohenzollernradweg_Relax.gpx"
  ]
}
```

## `data/config.json`

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

## `data/weather-settings.json`

```json
{
  "schemaVersion": 1,
  "enabled": true,
  "description": "1.0 Beta: GPX-Zeiten, 25-km-Gesamtübersicht, GPT-OSS 120B, vollständige Dokumentation.",
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
    "model": "openai/gpt-oss-120b"
  },
  "timezoneOffset": "+02:00"
}
```
