# Digitales Roadbook – V48

## Fix gegenüber V47

V47 wurde durch eine zu starke Umstrukturierung instabil. V48 basiert wieder auf der stabilen V46-Logik und übernimmt nur den gewünschten Marker-Feinschliff:

- Übernachtungs-KM-Angabe im Gesamthöhenprofil auf X-Achsen-Label-Höhe.
- Keine Einheit `km` beim Übernachtungs-KM-Label.
- Gestrichelte Linie endet auf der X-Achse.
- Gestrichelte Linie hat Linienstärke 1, analog zu den Achsen-/Gridlinien.
- Tour-Dropdown, Manifest-Laden und GPX-Parsing wurden zusätzlich validiert.


---
## Digitales Roadbook – V50.6

Details siehe `PRD_Digitales_Roadbook_V50_6.md`.

### Änderung in V50.6

- Etappen-Wetter-Einzahler zeigt jetzt Regen-Icon: `Regen x,x mm · Risiko bis X %`.
- Windwert steht mit Wind-Icon: `Wind bis X km/h`.
- Der Einzahler ist in der Etappenübersicht ausklappbar und zeigt dann die vollständige Prognose.
- Im Einzeletappen-Fokus bleibt die vollständige blaue Wetterbox direkt sichtbar.


## V50.8.1

Hotfix für Weather Forecast Action: `firstStart`-Initialisierung korrigiert.
