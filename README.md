## Bike Tour Planner – GitHub Pages Starter V20

### Änderungen in V20
- **Meta-Bereich verschlankt**
  - Der Tourismus-/offizielle Link ist jetzt kompakt und direkt über die Überschrift verlinkt.
  - Die ADFC-Wertung ist ebenfalls kompakt und zeigt nur `x/5 Sterne`; die Überschrift ist direkt verlinkt.
- **Startbahnhof vor den Etappen**
  - Der Startbahnhof wird als eigener Kasten in voller Breite vor der ersten Etappe dargestellt.
  - Klick auf den Kasten fokussiert den Marker auf der Karte.
- **Endbahnhof nach den Etappen**
  - Der Endbahnhof wird als eigener Kasten in voller Breite nach der letzten Etappe dargestellt.
  - Klick auf den Kasten fokussiert den Marker auf der Karte.
- **Hotels zwischen den Etappen**
  - Hotels werden als vollbreite Karten direkt zwischen passenden Etappen angezeigt.
  - Klick auf die Hotelkarte fokussiert den Marker auf der Karte.
- **Bestehende Logik bleibt erhalten**
  - ADFC-Bewertung bleibt manuell in `data/routes.json` gepflegt.
  - Bahnhofsdaten unterstützen weiter Treffpunkt, Zeiten, bis zu 3 Umstiege sowie bis zu 10 Sitz- und Radreservierungen.
