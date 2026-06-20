# PRD – Bike Tour Planner (Best-Practice Kurzfassung für Repo)

## Korrekturen in V9
1. **Etappennummern auf der grafischen Etappendarstellung**: Die runden Kreise mit `1`, `2`, `3` usw. werden nicht in der Listenübersicht angezeigt, sondern direkt **in der Mitte der farbigen Etappenlinie auf der Karte**.
2. **Fokus-/Filter-Reset funktioniert zuverlässig**: Wenn eine einzelne Etappe ausgewählt und die übrigen temporär ausgeblendet wurden, kann der Zustand über den Reset-Button zuverlässig zurückgesetzt werden.
3. **Kartenstil-Auswahl bleibt gut lesbar**.
4. **Zeitformat bleibt überall `hh:mm`**.

## Bestehende Kernfeatures bleiben erhalten
- Hotelmarker-Popup mit Direktlink in neuem Browser-Tab
- Höhenprofil-Hover mit Overlay
- Hover auf Etappe hebt Kartenabschnitt hervor
- Unterkunftsmarker optisch anders als normale Stops
- Overlay-Control für Kartenansicht
- dynamisches Tour-Dropdown über `data/routes.json`
- Pausen = Kurzpausen + große Pause
- Schwierigkeit als farbiger Badge analog Ski-Pisten
- Klick auf Etappe zoomt zuverlässig auf den Kartenabschnitt
