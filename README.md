# Bike Tour Planner – GitHub Pages Starter V19

Exakte Projektbasis aus den gelieferten Dateien.

## Struktur

```text
index.html
assets/app.js
assets/styles.css
data/config.json
data/routes.json
data/*-stops.json
gpx/*.gpx
```

## GPX-Hinweis

Die hochgeladenen `.txt`-Dateien enthielten Höhenprofile. Daraus wurden gültige GPX-Dateien erzeugt:

- `gpx/alpe-adria.gpx`
- `gpx/seenroute.gpx`

Die Höhenwerte wurden übernommen; die Koordinaten wurden entlang der in den jeweiligen `*-stops.json` Dateien hinterlegten Stop-Koordinaten interpoliert, damit die bestehende Leaflet-/Chart-Logik direkt lauffähig ist.

## Lokal testen

```bash
python3 -m http.server 8000
```

Dann öffnen:

```text
http://localhost:8000
```

## GitHub Pages

Dateien in das Repository kopieren, committen und GitHub Pages auf `main` / root aktivieren.
