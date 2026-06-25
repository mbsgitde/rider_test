# Digitales Roadbook – V48

## Fix gegenüber V47

V47 wurde durch eine zu starke Umstrukturierung instabil. V48 basiert wieder auf der stabilen V46-Logik und übernimmt nur den gewünschten Marker-Feinschliff:

- Übernachtungs-KM-Angabe im Gesamthöhenprofil auf X-Achsen-Label-Höhe.
- Keine Einheit `km` beim Übernachtungs-KM-Label.
- Gestrichelte Linie endet auf der X-Achse.
- Gestrichelte Linie hat Linienstärke 1, analog zu den Achsen-/Gridlinien.
- Tour-Dropdown, Manifest-Laden und GPX-Parsing wurden zusätzlich validiert.


---
## Digitales Roadbook – V50.1

Details siehe `PRD_Digitales_Roadbook_V50_1.md`.

### Änderung in V50.1

- Wetterprognose Gesamt zeigt jetzt `Start: DD/MM/YY hh:mm`.
- Etappen-Wetterübersicht zeigt je Etappe `DD/MM/YY hh:mm`.
- Aktive Einzeletappenansicht zeigt ebenfalls `Start: DD/MM/YY hh:mm`.
- Karten-Popups nutzen dasselbe Datumsformat.
