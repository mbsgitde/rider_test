# Rider Test – GitHub Pages Vorlage

Statische Weiterentwicklung der bestehenden `rider_test`-Idee als GitHub-Pages-kompatible Website.

## Struktur

```text
index.html
assets/styles.css
assets/app.js
data/tours.json
gpx/demo-track.gpx
```

## Lokal testen

Da die Seite JSON/GPX per `fetch()` lädt, am besten über einen lokalen Webserver starten:

```bash
python3 -m http.server 8000
```

Dann öffnen: <http://localhost:8000>

## Deployment auf GitHub Pages

1. Dateien in dein Repository kopieren.
2. Commit & Push auf `main`.
3. In GitHub: **Settings → Pages → Deploy from a branch → main / root** auswählen.

## Weiterentwicklungsideen

- Admin-Ansicht zum Bearbeiten der JSON-Daten
- GPX-Upload und automatische Track-Auswertung
- Distanz-/Höhenmeter-Berechnung
- Mehrsprachigkeit
- Tour-Ranking oder Favoriten
