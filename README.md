# Bike Tour Planner – GitHub Pages Starter V20

## Änderungen in V20
1. **Kompakter Meta-Bereich**
   - Tourismus-/Radwegelink stark verkleinert: Überschrift selbst ist der Link.
   - ADFC-Wertung ebenfalls kompakt: verlinkte Überschrift + kurze Angabe `4/5 Sterne`.

2. **Startbahnhof vor den Etappen**
   - Der Startbahnhof wird als eigener Kasten in voller Breite vor der ersten Etappe dargestellt.
   - Klick auf den Kasten fokussiert den Marker in der Karte.

3. **Endbahnhof nach den Etappen**
   - Der Endbahnhof wird als eigener Kasten in voller Breite nach der letzten Etappe dargestellt.
   - Klick auf den Kasten fokussiert den Marker in der Karte.

4. **Hotels zwischen den Etappen**
   - Hotels werden als volle Zwischenkarten direkt zwischen den Etappen angezeigt (z. B. zwischen Etappe 1 und 2).
   - Klick auf die Hotelkarte fokussiert den Marker in der Karte.

5. **Bestehende Bahnhofslogistik bleibt erhalten**
   - Treffpunkt, Abfahrts-/Ankunftszeit, bis zu 3 Umstiege sowie bis zu 10 Sitz- und Radplatzreservierungen.

## JSON-Felder
### `data/routes.json`
- `officialDescriptionUrl`
- `adfcStars`
- `adfcTourUrl`

### `data/*-stops.json`
Für `start` und `end`:
- `meetingPoint`
- `departureTime`
- `arrivalTime`
- `connection`
- `carriageNumber`
- `transfers`
- `reservedSeats`
- `reservedBikeSpots`
