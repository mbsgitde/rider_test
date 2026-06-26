# Wetter-Automatisierung

Der Workflow `.github/workflows/weather.yml` erzeugt `data/weather.json` per GitHub Actions.

## Modell

Das Groq-Modell wird in `data/weather-settings.json` gesetzt:

```json
"model": "openai/gpt-oss-120b"
```

## Deployment Guard

Der Workflow vergleicht `weather.json` ohne `generatedAt`. Wenn sich nur der Timestamp ändert, wird kein Commit erzeugt.
