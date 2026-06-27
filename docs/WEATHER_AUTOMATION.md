# Wetter-Automatisierung

Workflow: `.github/workflows/weather.yml`

Lokaler Lauf:

```bash
node assets/generateWeather.js
```

GitHub Actions Cron läuft in UTC. Die Weather Action erzeugt `data/weather.json`.
