# Wetter-Automatisierung

Die Wetterprognose wird durch `assets/generateWeather.js` erzeugt.

## Lokaler Lauf

```bash
node assets/generateWeather.js
```

## GitHub Action

```text
.github/workflows/weather.yml
```

Die Action schreibt `data/weather.json` und committed nur sinnvolle Änderungen.

## Cronjob

GitHub Actions verwendet UTC-Zeiten.

```yaml
schedule:
  - cron: "0 3,4,5,6,7,10,13,16,17,18,19,20 * * *"
```

## GPX-Zeitlogik

1. `#datetime`
2. `#date` + `#starttime`
3. Startdatum + Etappenindex + `#starttime`
4. Fallback aus `weather-settings.json`
