# PRD – Digitales Roadbook V50.5: Wetter-UI Minor Update

## 1. Dokumentversion

- **Produkt:** Digitales Roadbook
- **Version:** V50.5
- **Status:** Implementierte ZIP-Version
- **Datum:** 2026-06-25
- **Basis:** V50.4
- **Schwerpunkt:** Debug-Zeile und differenzierte Etappenwetter-Darstellung

## 2. Ziel

V50.5 ergänzt eine dezente Debug-Zeile ausschließlich in der Gesamt-Wetterbox und vereinfacht die Etappen-Wetterdarstellung in der Übersicht. Die volle blaue Wetterbox wird nur noch angezeigt, wenn eine einzelne Etappe aktiv fokussiert ist.

## 3. Änderungen gegenüber V50.4

### 3.1 Debug-Zeile nur in Gesamt-Wetterbox

Die Gesamt-Wetterbox zeigt eine kleine technische Infozeile:

- Zeitpunkt der geladenen Wetterdaten
- `valid` Status
- Anzahl Etappen
- Anzahl Wetterpunkte

### 3.2 Kompakter Einzahler in der Etappenübersicht

In der Übersicht mit allen Etappen wird unter der Höhengrafik je Etappe nur noch ein kompakter Wetter-Einzahler angezeigt:

- Wettericon
- Temperaturbereich
- Regenrisiko
- Windmaximum

### 3.3 Volle blaue Wetterbox nur im Einzeletappen-Fokus

Die vollständige blaue Wetterbox mit KI-Zusammenfassung wird nur angezeigt, wenn eine einzelne Etappe ausgewählt ist und die übrigen Etappen ausgeblendet sind.

## 4. Akzeptanzkriterien

- Debug-Zeile erscheint nur in der Gesamt-Wetterbox.
- Etappenübersicht zeigt kompakte Wetter-Einzahler.
- Einzeletappen-Fokus zeigt vollständige Wetterbox inklusive KI-Zusammenfassung.
- V50.4 Workflow-Guard bleibt erhalten.
