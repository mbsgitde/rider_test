## PRD – Bike Tour Planner (Best-Practice Kurzfassung für Repo)

### Zielbild V20
Die Oberfläche folgt dem Tourablauf: kompakte externe Metadaten direkt unter der Tourauswahl, dann Karte und Summary, danach Startbahnhof, Etappen mit integrierten Hotelblöcken und abschließend der Endbahnhof.

### Änderungen in V20
- **Meta-Bereich komprimiert**
  - Tourismus-/offizieller Link als kleine, direkt verlinkte Überschrift.
  - ADFC-Wertung als kleine, direkt verlinkte Überschrift mit knapper Angabe (`x/5 Sterne`).
- **Startbahnhof vor der ersten Etappe**
  - Vollbreiter Kasten vor den Etappen.
  - Klick springt zum Marker in der Karte.
- **Hotels zwischen den Etappen**
  - Hotels erscheinen als Vollbreiten-Blöcke direkt nach der Etappe, an deren Ende sie liegen.
  - Klick springt zum Marker in der Karte.
- **Endbahnhof nach der letzten Etappe**
  - Vollbreiter Kasten nach den Etappen.
  - Klick springt zum Marker in der Karte.
- **Bestehende Logistik bleibt vollständig**
  - Treffpunkt, Abfahrts-/Ankunftszeit, Verbindung, Wagen, bis zu 3 Umstiege, bis zu 10 Sitz-/Radplatzreservierungen.
  - Nicht gepflegte Bereiche bleiben verborgen.

### Entschlackung
- Fokus nur auf Layout, Kartenverlinkung und die bestehenden Exporte.
- Keine zusätzlichen Nebenfunktionen außerhalb dieses Umbaus.
