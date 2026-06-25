# Digitales Roadbook – V48

## Fix gegenüber V47

V47 wurde durch eine zu starke Umstrukturierung instabil. V48 basiert wieder auf der stabilen V46-Logik und übernimmt nur den gewünschten Marker-Feinschliff:

- Übernachtungs-KM-Angabe im Gesamthöhenprofil auf X-Achsen-Label-Höhe.
- Keine Einheit `km` beim Übernachtungs-KM-Label.
- Gestrichelte Linie endet auf der X-Achse.
- Gestrichelte Linie hat Linienstärke 1, analog zu den Achsen-/Gridlinien.
- Tour-Dropdown, Manifest-Laden und GPX-Parsing wurden zusätzlich validiert.


---
## Digitales Roadbook – V50.4

Details siehe `PRD_Digitales_Roadbook_V50_4.md`.

### Änderung in V50.4

- Weather Workflow hat jetzt `concurrency`, damit Cron-Läufe nicht parallel denselben Branch beschreiben.
- Workflow synchronisiert den Branch vor der Wettergenerierung.
- Workflow vergleicht `data/weather.json` ohne `generatedAt`.
- Wenn sich nur `generatedAt` ändert, wird kein Commit erzeugt und damit kein Pages Deployment angestoßen.
- V50.3 KI-Prompt-Guard bleibt enthalten.
