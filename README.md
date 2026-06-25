# Digitales Roadbook – V48

## Fix gegenüber V47

V47 wurde durch eine zu starke Umstrukturierung instabil. V48 basiert wieder auf der stabilen V46-Logik und übernimmt nur den gewünschten Marker-Feinschliff:

- Übernachtungs-KM-Angabe im Gesamthöhenprofil auf X-Achsen-Label-Höhe.
- Keine Einheit `km` beim Übernachtungs-KM-Label.
- Gestrichelte Linie endet auf der X-Achse.
- Gestrichelte Linie hat Linienstärke 1, analog zu den Achsen-/Gridlinien.
- Tour-Dropdown, Manifest-Laden und GPX-Parsing wurden zusätzlich validiert.


---
## Digitales Roadbook – V49.1 Wetter-UI-Finishing

Details siehe `PRD_Digitales_Roadbook_V49_1.md`.

### Änderungen

- Wettergenerator liegt jetzt in `assets/generateWeather.js`.
- GitHub Action ruft `node assets/generateWeather.js` auf.
- Wetterkarten stehen unterhalb der Höhengrafiken.
- Gesamt-Höhengrafik enthält Wetter-Icons pro Etappe.
- Wettermarker auf der Karte haben niedrigere Priorität als Start/Ziel/Hotelmarker.
- Cron läuft tagsüber: 05, 08, 11, 14, 17, 20, 22 Uhr MESZ.
