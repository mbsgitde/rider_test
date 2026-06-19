# PRD – Bike Tour Planner (Best-Practice Kurzfassung für Repo)

## Neue Features in dieser Fassung
1. **Umschaltbare Kartenansicht**: Nutzer können zwischen mehreren Kartenstilen (z. B. Standard, Humanitarian, Topografisch) wechseln.
2. **Dynamisches Tour-Dropdown**: Das Dropdown wird nicht statisch im HTML gepflegt, sondern aus einer manifestierten Routenliste (`data/routes.json`) geladen. Diese Datei wird aus den vorhandenen GPX-Dateien im Ordner `/gpx` abgeleitet und ist GitHub-Pages-kompatibel.

## Fachliche Kernanforderungen
- Statische Web-App auf GitHub Pages
- GPX-Dateien in `/gpx`
- Stops-/Hotel-Dateien in `/data`
- zentrale Konfiguration in `/data/config.json`
- lesbare Konfigurationsdokumentation in `/data/config.md`
- Distanz, Höhenmeter, Netto-/Brutto-Fahrzeit, Schwierigkeit pro Etappe
- Höhenprofil pro Etappe
- Unterkunftslink pro Overnight-Stop
- Plausibilitätswarnung, wenn ein Stop deutlich neben der Route liegt
- farbige Etappen in Karte und Übersicht
- dynamische Tourliste aus vorhandenen GPX-Dateien (technisch über `data/routes.json`)
