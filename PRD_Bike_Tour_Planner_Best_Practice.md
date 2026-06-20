# PRD – Bike Tour Planner (Best-Practice Kurzfassung für Repo)

## Zielbild V18
Die App bündelt Tourdarstellung, Export und Logistik in einer klaren, aufgeräumten Oberfläche. Logistikobjekte (Start, Ziel, Hotels) sollen die Kartensicht nicht visuell stören, aber in der Übersicht und im Export vollständig dokumentiert sein.

## Änderungen in V18
1. **Kartendarstellung Logistik entschärft**
   - Start, Ziel und Hotels nutzen dieselbe dezente Markerfarbe.
   - Etappenfarben bleiben ausschließlich den Streckenabschnitten vorbehalten.

2. **Optionale ADFC-Darstellung**
   - Pro Route können in `data/routes.json` optional `adfcStars` und `adfcTourUrl` gepflegt werden.
   - Die Oberfläche zeigt Sterne und Link nur dann, wenn valide Daten vorhanden sind.
   - Ohne gepflegte ADFC-Sterne wird nichts suggeriert.

3. **Logistikübersicht bleibt kompakt**
   - Separate, platzoptimierte Bereiche für:
     - Start & Ziel (Anreise / Rückreise)
     - Hotels
     - offizielle / ADFC-Links

4. **Exporte erweitert**
   - ZIP-Export enthält Gesamtstrecke + Etappen.
   - ZIP-README dokumentiert Route, offizielle Beschreibung, ADFC-Daten, Start/Ziel, Hotels und enthaltene Dateien.
   - Ein kompakter Tour-Steckbrief kann zusätzlich als TXT exportiert werden.

5. **Datenpflege erleichtert**
   - Template-Dateien für Routen und Stops liegen im Repo.
   - README beschreibt die relevanten Felder prägnant.

## Entschlackung
- Ältere Zwischenstände und überflüssige Wiederholungen wurden gestrichen.
- Fokus nur auf aktuell sichtbare Kernfunktionen: Route laden, Karte, Etappen, Logistik, Links und Exporte.
