# Bike Tour Planner – GitHub Pages Starter V29

Neu in V29:

- GPX-Waypoint-Auto-Matching für Stops ohne `lat`/`lon`.
- Fuzzy Search über Waypoint-Namen, inkl. Normalisierung von Umlauten und Begriffen wie Hotel, Landhotel, Bahnhof, Hbf.
- Optionales `matchName` oder `waypointName` in der Stop-JSON für kontrolliertes Matching.
- Fallback: Start = erster Trackpoint, Ziel = letzter Trackpoint, falls kein Waypoint passt.
- Google-Maps-Koordinaten-Fallback bleibt erhalten.
- Hohenzollern-Stops sind bewusst schlank ohne lat/lon, um den Self-Service-Workflow zu demonstrieren.
