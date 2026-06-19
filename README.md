# Bike Tour Planner – GitHub Pages Starter V2

## Neue Features
1. **Kartenansicht umschalten**: Standard, Humanitarian und Topografisch.
2. **Dynamisches Tour-Dropdown**: Die Tourliste wird aus `data/routes.json` geladen. Diese Datei ist aus den vorhandenen GPX-Dateien im Ordner `/gpx` abgeleitet.

## Wichtiger Hinweis für GitHub Pages
Direktes Einlesen eines Ordnerinhalts im Browser ist auf GitHub Pages nicht zuverlässig möglich. Deshalb wird die dynamische Tourliste GitHub-Pages-kompatibel über eine erzeugte Manifestdatei `data/routes.json` umgesetzt.

## Inhalt
```text
index.html
assets/
  app.js
  styles.css
gpx/
  alps.gpx
  lake.gpx
data/
  config.json
  config.md
  routes.json
  alps-stops.json
  lake-stops.json
PRD_Bike_Tour_Planner_Best_Practice.md
README.md
```
