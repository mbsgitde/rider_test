# Bike Tour Planner – GitHub Pages Starter V19

## Änderungen in V19
1. **Bahnhof und Hotels als eigene Kästen**
   - Start und Ziel werden als eigene Bahnhofssektion **vor** den Etappen dargestellt.
   - Hotels werden als eigene Sektion **nach** den Etappen dargestellt.

2. **Tourismus-URL und ADFC-Bewertung zwischen Tourauswahl und Karte**
   - Der Bereich zwischen Tourauswahl und Karte zeigt:
     - offiziellen Tourismus-/Radwegelink
     - manuell gepflegte ADFC-Sterne
     - ADFC-Link

3. **ADFC-Bewertung manuell im JSON**
   - `data/routes.json` unterstützt:
     - `adfcStars`
     - `adfcTourUrl`
   - Sterne werden symbolisch (`★`) dargestellt.

4. **Bahnhofsdetails erweitert**
   - Für `start` und `end` unterstützt das Stop-JSON jetzt zusätzlich:
     - `meetingPoint`
     - `departureTime`
     - `arrivalTime`
     - `transfers` (0–3 Einträge)
     - `reservedSeats` (0–10 Einträge)
     - `reservedBikeSpots` (0–10 Einträge)
   - Leere Bereiche werden in der UI automatisch ausgeblendet.

5. **Templates aktualisiert**
   - `data/routes-template.json`
   - `data/stops-template.json`

## Beispielroute Alpe Adria
- offizieller Radwegelink hinterlegt
- ADFC-Tour-Link hinterlegt
- manuelle ADFC-Sterne: 4
- Dummywerte für Treffpunkt, Zeiten, Umstiege und Reservierungen enthalten
