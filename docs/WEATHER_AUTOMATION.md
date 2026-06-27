# Wetter-Automatisierung und GitHub Cronjob

Die Wetterdaten werden über `assets/generateWeather.js` erzeugt und nach `data/weather.json` geschrieben.

---

## 1. Lokaler Lauf

```bash
node assets/generateWeather.js
```

Voraussetzungen:

- Node.js verfügbar
- Internetzugriff für Open-Meteo
- Optional: Umgebungsvariable `GROQ_API_KEY`

---

## 2. GitHub Action

Workflow-Datei:

```text
.github/workflows/weather.yml
```

Der Workflow:

1. checkt das Repository aus,
2. richtet Node.js ein,
3. ruft `node assets/generateWeather.js` auf,
4. schreibt `data/weather.json`,
5. committed nur relevante Änderungen.

---

## 3. Cronjob

Der Workflow läuft zeitgesteuert über `schedule.cron`.

Beispiel:

```yaml
schedule:
  - cron: "0 3,4,5,6,7,10,13,16,17,18,19,20 * * *"
```

GitHub Cron läuft in UTC. Für MESZ muss entsprechend umgerechnet werden.

---

## 4. Wettereinstellungen

Datei:

```text
data/weather-settings.json
```

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

### Wichtige Werte

- `tourStartDateTime`: Fallback, wenn GPX kein Datum enthält.
- `dailyStageStartTime`: Fallback für Folgeetappen.
- `timezoneOffset`: Zeitzonenoffset, z. B. `+02:00`.
- `sampleDistanceKm`: Abstand der Wetter-Samplingpunkte entlang der Route.
- `ai.enabled`: KI-Zusammenfassung aktivieren/deaktivieren.
- `ai.model`: Groq-Modell.

---

## 5. GPX-Zeitlogik

Priorität:

1. `#datetime`
2. `#date` + `#starttime`
3. Startdatum + Etappenindex + `#starttime`
4. Fallback aus `weather-settings.json`

---

## 6. Forecast-Fenster

Open-Meteo liefert Vorhersagedaten nur für einen begrenzten Zeitraum. Wenn die Tour zu weit in der Zukunft liegt, wird die Wettergenerierung abgebrochen bzw. als nicht gültig markiert.
