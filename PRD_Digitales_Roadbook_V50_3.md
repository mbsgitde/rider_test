# PRD – Digitales Roadbook V50.3: KI-Prompt-Guard gegen Distanzfehler

## 1. Dokumentversion

- **Produkt:** Digitales Roadbook
- **Version:** V50.3
- **Status:** Implementierte ZIP-Version
- **Datum:** 2026-06-25
- **Basis:** V50.2
- **Schwerpunkt:** Absicherung der KI-Wetterzusammenfassungen gegen falsche Etappendistanzen

## 2. Ziel der Version

V50.3 korrigiert ein fachliches Risiko in den Groq-Zusammenfassungen: Die KI darf Etappendistanzen nicht aus den 10-km-Wetterstichproben ableiten. Stattdessen erhält sie verbindliche Fakten aus der GPX-/Etappenberechnung. Zusätzlich wird sie angewiesen, Etappendistanzen im Fließtext nicht zu nennen, weil diese bereits im Roadbook-Metablock korrekt dargestellt werden.

## 3. Problem

Vor V50.3 konnte die KI Aussagen erzeugen wie „Die Etappe erstreckt sich über 60 km“, obwohl die echte Etappendistanz ca. 74 km beträgt. Ursache: Die KI sah primär Wetterpunkte und konnte aus dem letzten Samplepunkt eine falsche Distanz ableiten.

## 4. Änderungen gegenüber V50.2

### 4.1 Verbindlicher Faktenblock im Prompt

Für jede Etappe werden an Groq übergeben:

- Etappennummer
- Etappenname
- exakte Etappendistanz
- Startzeit
- Start-km und End-km der Gesamttour

### 4.2 Strikte Prompt-Regeln

Die KI erhält Regeln:

- Etappendistanz nicht im Fließtext nennen.
- Etappenlänge niemals aus Wetterpunkten ableiten.
- Wetterpunkte sind nur Stichproben.
- Kilometerangaben nur als lokale Etappen-km für Wetterabschnitte nutzen.
- Keine Distanzen, Zeiten oder Wetterwerte erfinden.

### 4.3 Lokale Kilometer in Wetterpunkten

Die Wetterpunktzeilen enthalten jetzt lokale Etappen-km und Gesamt-km, damit Wetterabschnitte korrekt formuliert werden können.

## 5. Akzeptanzkriterien

- KI-Zusammenfassungen enthalten keine falschen Etappendistanzen.
- KI formuliert wetterbezogen statt distanzbezogen.
- Wenn Kilometer genannt werden, beziehen sie sich auf lokale Etappen-km.
- Die bestehenden V50.2 UI-Änderungen bleiben erhalten.
