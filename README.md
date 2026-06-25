# Digitales Roadbook – V48

## Fix gegenüber V47

V47 wurde durch eine zu starke Umstrukturierung instabil. V48 basiert wieder auf der stabilen V46-Logik und übernimmt nur den gewünschten Marker-Feinschliff:

- Übernachtungs-KM-Angabe im Gesamthöhenprofil auf X-Achsen-Label-Höhe.
- Keine Einheit `km` beim Übernachtungs-KM-Label.
- Gestrichelte Linie endet auf der X-Achse.
- Gestrichelte Linie hat Linienstärke 1, analog zu den Achsen-/Gridlinien.
- Tour-Dropdown, Manifest-Laden und GPX-Parsing wurden zusätzlich validiert.


---
## Digitales Roadbook – V50.2

Details siehe `PRD_Digitales_Roadbook_V50_2.md`.

### Änderung in V50.2

- Wettericons wurden vollständig aus der Kartenansicht entfernt.
- Wettericons pro Etappe erscheinen in der Gesamt-Höhengrafik mittig zwischen den Hotelmarkern.
- Die Gesamtprognose enthält keine Etappenliste mehr.
- Die einzelnen Etappenprognosen stehen direkt in den Etappen unterhalb der Höhengrafik.
- Datumsformat: `DD.MM.YY hh:mmh`.
