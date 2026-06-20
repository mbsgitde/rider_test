# PRD – Bike Tour Planner (Best-Practice Kurzfassung für Repo)

## Änderungen in V8 – Bugfixes und UX-Verbesserungen
1. **Kartenstil-Auswahl lesbar**: In der Kartenstil-Auswahl im Overlay sind jetzt alle verfügbaren Optionen unabhängig vom aktiven Stil klar lesbar. Die aktive Auswahl bleibt visuell hervorgehoben, ohne die übrigen Optionen unlesbar zu machen.
2. **Zuverlässiger Etappenzoom**: Der Klick auf eine Etappe zoomt die Karte nun zuverlässig auf genau den ausgewählten Abschnitt – auch dann, wenn zuvor bereits auf eine benachbarte Etappe gezoomt wurde.
3. **Etappen-Nummer als Symbol**: Jede Etappe erhält in der Übersicht zusätzlich ein rundes Symbol mit der Etappennummer, z. B. `1`, `2`, `3`.
4. **Fokus auf einzelne Etappe**: Wenn eine Etappe ausgewählt wird, kommt sie zusätzlich in den Fokus. Die anderen Etappen werden temporär ausgeblendet. Über einen Rücksetzen-Button können wieder alle Etappen angezeigt werden.

## Bestehende Kernfeatures bleiben erhalten
- Zeitformat überall `hh:mm`
- Hotelmarker-Popup mit Direktlink in neuem Browser-Tab
- Höhenprofil-Hover mit Overlay
- Hover auf Etappe hebt Kartenabschnitt hervor
- Unterkunftsmarker optisch anders als normale Stops
- Overlay-Control für Kartenansicht
- dynamisches Tour-Dropdown über `data/routes.json`
- Pausen = Kurzpausen + große Pause
- Schwierigkeit als farbiger Badge analog Ski-Pisten
