# Bike Tour Planner – GitHub Pages Starter V18

## Änderungen in V18
1. **Dezente gemeinsame Logistikfarbe auf der Karte**
   - Start, Ziel und Hotels teilen sich jetzt eine unaufdringliche Markerfarbe.
   - Dadurch kollidiert die Logistikdarstellung nicht mehr mit den farbigen Etappenlinien.

2. **ADFC-Klassifizierung mit Sternen (optional)**
   - In `data/routes.json` können jetzt optional hinterlegt werden:
     - `adfcStars` (1–5)
     - `adfcTourUrl`
   - Die UI zeigt Sterne und Link nur dann, wenn diese Daten tatsächlich gepflegt sind.

3. **V18-Vorschläge umgesetzt**
   - JSON-Templates für Routen und Stops: `data/routes-template.json`, `data/stops-template.json`
   - Icons für Anreise / Rückreise in der Logistikübersicht
   - strukturiertere `README.txt` im ZIP
   - **Tour-Steckbrief als TXT herunterladen**

4. **ZIP-Export erweitert**
   - ZIP enthält weiterhin alle Etappen und zusätzlich die Gesamtstrecke.
   - Die `README.txt` im ZIP listet jetzt Route, offiziellen Radwegelink, ADFC-Daten, Start/Ziel-Logistik, Hotels und enthaltene GPX-Dateien.

## JSON-Schema-Erweiterung
### `data/routes.json`
Optionale Felder pro Route:
- `officialDescriptionUrl`
- `adfcStars`
- `adfcTourUrl`

### `data/*-stops.json`
Für `start` und `end`:
- `connection`
- `carriageNumber`
- `reservedSeat`
- `reservedBikeSpot`

Für `overnight`:
- `hotelUrl`
- `notes`

## Beispielroute Alpe Adria
- offizieller Radwegelink hinterlegt
- ADFC-Tour-Link hinterlegt
- ADFC-Sterne **nicht** voreingetragen (werden nur angezeigt, wenn gepflegt)
- Dummywerte für Bahn- und Reservierungsdaten sind enthalten
