# PRD – Bike Tour Planner (Best-Practice Kurzfassung für Repo)

## Zielbild V20
Die Oberfläche priorisiert Informationshierarchie und Lesbarkeit: Kompakte externe Metadaten oben, Karte und Summary zentral, danach ein klarer Fluss aus Start, Etappen mit integrierten Hotels und abschließend Ziel.

## Änderungen in V20
1. **Meta-Bereich komprimiert**
   - Offizielle Tourismus-/Radweginfo als kleine, direkt verlinkte Überschrift.
   - ADFC-Wertung als kleine, direkt verlinkte Überschrift mit kurzer Sternangabe (`x/5 Sterne`).

2. **Startbahnhof vor den Etappen**
   - Vollbreiter Kasten oberhalb der ersten Etappe.
   - Klick verlinkt auf den Marker in der Karte.

3. **Endbahnhof nach den Etappen**
   - Vollbreiter Kasten unterhalb der letzten Etappe.
   - Klick verlinkt auf den Marker in der Karte.

4. **Hotels als Etappen-Zwischenblöcke**
   - Jeder Hotelstopp wird als eigener Vollbreiten-Block direkt nach der Etappe angezeigt, die dort endet.
   - Klick verlinkt auf den Marker in der Karte.

5. **Bahnhofslogistik unverändert vollständig**
   - Treffpunkt, Abfahrts-/Ankunftszeit, Verbindung, Wagen, bis zu 3 Umstiege, bis zu 10 Sitz- und Radplatzreservierungen.
   - Leere Felder bleiben unsichtbar.

## Entschlackung
- Fokus ausschließlich auf Layout, Mapping zwischen Kartenobjekten und UI-Blöcken sowie bestehende Exporte.
- Keine zusätzlichen neuen Featurezweige außerhalb dieses Layout-Umbaus.
