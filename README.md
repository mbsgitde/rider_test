# Bike Tour Planner – GitHub Pages Starter V27

Neu in V27:

- Fehlende Stop-Koordinaten können automatisch aus `googleMapsUrl` gelesen werden, wenn der Link Koordinaten enthält.
- Unterstützte Muster sind u. a. `@lat,lon,zoom`, `query=lat,lon`, `q=lat,lon`, `!3dlat!4dlon` und `!2dlon!3dlat`.
- `routes.json` nutzt jetzt zusätzlich `gpxFile` und `stopsFile`, falls vorhanden.
- Hohenzollern-JSONs sind korrigiert enthalten:
  - `data/routes.json`
  - `data/Hohenzollernradweg_2027_Relax-stops.json`
- Die Hohenzollern-GPX-Datei muss als `gpx/Hohenzollernradweg_2027_Relax.gpx` ergänzt werden.

Wichtig: Kurzlinks wie `maps.app.goo.gl/...` enthalten meist keine direkt auslesbaren Koordinaten. Für automatische Erkennung bitte vollständige Google-Maps-Links mit Koordinaten verwenden.
