# PRD – Bike Tour Planner (Best-Practice Kurzfassung für Repo)

## Änderung in V7
- **Zeitformat überall auf `hh:mm`**: Alle Zeitangaben im UI werden nicht mehr als Dezimalstunden dargestellt, sondern im Format `hh:mm`, z. B. `06:24` oder `20:40`.

## Gilt für folgende Bereiche
- Netto-Fahrzeit je Etappe
- Brutto-Fahrzeit je Etappe
- Gesamt-Netto-Fahrzeit in der Summary
- Gesamt-Brutto-Fahrzeit in der Summary
- Hover-Overlay im Höhenprofil (kumulierte Netto-Zeit)

## Bestehende Features bleiben erhalten
- Kartenansicht als Overlay-Control auf der Karte
- dynamisches Tour-Dropdown über `data/routes.json`
- Pausen = Kurzpausen + große Pause
- Schwierigkeit als farbiger Badge analog Ski-Pisten
- Klick auf Etappe zoomt auf den Kartenabschnitt
- Hover auf Etappe hebt Kartenabschnitt hervor
- Unterkunftsmarker sind optisch anders als normale Stops
- Hotelmarker-Popup mit Direktlink in neuem Browser-Tab
- interaktives Höhenprofil-Overlay mit kumulierten Werten
