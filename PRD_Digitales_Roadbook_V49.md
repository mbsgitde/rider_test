# PRD – Digitales Roadbook V49: Kompakte mehrtägige Wetterprognose

## 1. Dokumentversion

- **Produkt:** Digitales Roadbook
- **Version:** V49
- **Status:** Implementierte ZIP-Version
- **Datum:** 2026-06-25
- **Basis:** V48 Stable Baseline
- **Schwerpunkt:** Kompakte Wetterprognose für Gesamt- und Etappenansicht

## 2. Produktziel

V49 erweitert das digitale Roadbook um eine mehrtägige, zeitbasierte Wetterprognose entlang einer Fahrradtour. Die Prognose wird per GitHub Actions erzeugt, damit API-Zugänge nicht im Frontend offengelegt werden. Die Darstellung wird gegenüber der ersten Wetterintegration bewusst verdichtet: Pro Etappe erscheint eine kompakte Wetterkarte mit Symbol, Temperaturspanne, Regen-/Windwerten und KI-Kurzfazit statt vieler einzelner Datenpunkt-Chips.

## 3. Nutzerproblem

Radreisende benötigen eine schnelle, verständliche Einschätzung des Wetters pro Tagesetappe. Einzelne Wetterpunkte alle 10 km sind zwar technisch präzise, überladen aber die Etappenansicht und erschweren die Tourentscheidung. Gleichzeitig muss die Wetterberechnung die Mehrtagelogik berücksichtigen: Etappe 2 startet nicht wenige Minuten nach Etappe 1, sondern am Folgetag zu einer definierten Uhrzeit.

## 4. Ziele und Nicht-Ziele

### Ziele

- Wetterprognose über die komplette Tour mit korrekter Mehrtagelogik.
- Etappenbasierte Wetterprognose nur bei aktiver Etappe sichtbar.
- Kompakte Wetterdarstellung pro Etappe.
- Kartenmarker reduzieren: Gesamtansicht zeigt einen Marker je Etappe; aktive Etappe zeigt Start/Mitte/Ende.
- GitHub Actions für automatisierte Generierung von `data/weather.json`.
- Groq-Zusammenfassung über `GROQ_API_KEY` als GitHub Secret.
- Keine API Keys im Frontend.

### Nicht-Ziele

- Keine Live-Wetterabfrage im Browser.
- Keine eigene Wetterregel-Engine als Ersatz für die KI-Zusammenfassung.
- Keine sekundengenaue Fahrzeitsimulation.
- Keine Garantie für Wettergenauigkeit außerhalb üblicher Forecast-Unsicherheiten.

## 5. Kernfeatures

### 5.1 Mehrtägige Timeline

- Etappe 1 startet mit `tourStartDateTime`.
- Etappe 2 startet am Folgetag zu `dailyStageStartTime`.
- Etappe 3 startet zwei Tage nach Tourstart zu `dailyStageStartTime`.
- Etappe 4 startet drei Tage nach Tourstart zu `dailyStageStartTime`.
- Der Forecast wird nur erzeugt, wenn die letzte Etappe maximal 14 Tage in der Zukunft liegt.

### 5.2 Wetterdaten entlang der Route

- Interne Wetterpunkte werden weiterhin alle `sampleDistanceKm` Kilometer erzeugt.
- Open-Meteo liefert Wetterdaten je Koordinate und Zeitfenster.
- Die internen Punkte bleiben in `data/weather.json` für KI und Debugging erhalten.

### 5.3 Kompakte Etappenstatistik

Pro Etappe werden zusätzlich berechnet:

- minimale Temperatur
- maximale Temperatur
- gesamter Niederschlag über die internen Wetterpunkte
- maximale Regenwahrscheinlichkeit
- maximale Windgeschwindigkeit
- dominantes Wettersymbol
- Start-, Mittel- und Endpunkt für die Kartenansicht

### 5.4 KI-Zusammenfassung

- Groq erzeugt je Etappe eine Kurzprognose.
- Groq erzeugt zusätzlich eine Gesamtzusammenfassung der Tour.
- Wenn `GROQ_API_KEY` fehlt, wird trotzdem eine Wetterdatei erzeugt, aber mit Hinweis auf fehlende KI-Zusammenfassung.

### 5.5 UI-Verhalten

#### Gesamtansicht

- Zeigt eine kompakte Gesamttour-Wetterkarte.
- Zeigt eine Etappenübersicht mit je einer Zeile pro Etappe:
  - Wettersymbol
  - Etappennummer
  - Temperaturspanne
  - Regenmenge / Regenrisiko
  - Windmaximum
- Karte zeigt einen Wettermarker pro Etappe.

#### Aktive Etappenansicht

- Nur aktive Etappe bleibt sichtbar.
- Wetterkarte zeigt nur die Prognose dieser Etappe.
- Keine langen Datenpunktlisten.
- Karte zeigt maximal drei Wettermarker: Start, Mitte, Ende.

## 6. User Stories und Akzeptanzkriterien

### User Story 1: Gesamtwetter schnell einschätzen

Als Radreisender möchte ich in der Gesamtübersicht sofort erkennen, wie das Wetter über alle Etappen verteilt ist, damit ich die Tourplanung schnell bewerten kann.

**Akzeptanzkriterien:**

- Die Gesamtansicht zeigt eine KI-Zusammenfassung.
- Die Gesamtansicht zeigt eine kompakte Etappen-Wetterübersicht.
- Es werden keine langen Listen einzelner 10-km-Wetterpunkte angezeigt.

### User Story 2: Etappenwetter fokussiert sehen

Als Radreisender möchte ich beim Klick auf eine Etappe nur das Wetter dieser Etappe sehen, damit ich nicht durch Informationen anderer Tage abgelenkt werde.

**Akzeptanzkriterien:**

- Bei aktivem Etappenfokus sind andere Etappen ausgeblendet.
- Die Wetterkarte zeigt nur die aktive Etappe.
- Die Karte zeigt nur Start/Mitte/Ende-Wettermarker der aktiven Etappe.

### User Story 3: Mehrtagelogik korrekt abbilden

Als Nutzer möchte ich, dass Etappe 2 am Folgetag startet, damit die Wetterprognose nicht fälschlich von einer Eintagestour ausgeht.

**Akzeptanzkriterien:**

- `dailyStageStartTime` steuert die Startzeit ab Etappe 2.
- Die letzte Etappe wird gegen das 14-Tage-Forecast-Fenster geprüft.
- `data/weather.json` enthält `stageStartTime` pro Etappe.

## 7. Technische Anforderungen

### Frontend

- Vanilla JavaScript bleibt erhalten.
- Leaflet bleibt Kartenbibliothek.
- Chart.js bleibt Höhenprofilbibliothek.
- `assets/app.js` lädt optional `data/weather.json`.
- Wetteranzeige darf die bestehende V48-Etappenlogik nicht brechen.

### Backend-Automatisierung

- GitHub Actions Workflow: `.github/workflows/weather.yml`
- Node.js 24
- `actions/checkout@v6`
- `actions/setup-node@v6`
- Script: `scripts/generateWeather.js`
- Output: `data/weather.json`

### Secrets

- `GROQ_API_KEY` als GitHub Actions Secret.
- Kein Secret im Repository oder Frontend.

## 8. Datenmodell

### `data/weather-settings.json`

```json
{
  "tourStartDateTime": "2026-07-01T09:00:00+02:00",
  "dailyStageStartTime": "09:00",
  "sampleDistanceKm": 10
}
```

### `data/weather.json`

Wichtige Felder:

- `valid`
- `reason`
- `global.summary`
- `global.stats`
- `stages[].summary`
- `stages[].stats`
- `stages[].compactPoints`
- `stages[].points`

## 9. Priorisierung

### Must-have

- Mehrtagelogik
- kompakte Etappenwetterkarte
- globale Etappenübersicht
- GitHub Actions Workflow
- Groq Secret-Unterstützung

### Should-have

- reduzierte Wettermarker auf Karte
- sichtbare Workflow-Kopie im Root als Hilfestellung
- klare README-Ergänzung

### Nice-to-have

- Temperatur-Overlay im Höhenprofil
- manuelle UI-Eingabe für Startdatum
- mehrere Startzeitprofile pro Etappe

## 10. Erfolgskriterien

- GitHub Action erzeugt `data/weather.json` erfolgreich.
- Groq API Calls erfolgen nur in GitHub Actions.
- Gesamtansicht ist deutlich übersichtlicher als die Datenpunktliste.
- Etappenansicht zeigt nur eine kompakte Wetterkarte.
- Distanzberechnung basiert auf GPX-Trackpunkten und liegt bei dieser Tour bei ca. 260 km.

## 11. Risiken und Annahmen

- Open-Meteo-Forecast ist wettermodellabhängig und kann sich täglich ändern.
- Groq-Free-Tier kann Rate Limits haben.
- Bei 4 Etappen muss die letzte Etappe innerhalb des 14-Tage-Fensters liegen.
- GitHub Actions muss im korrekten Branch vorhanden sein.

## 12. Abgrenzung zu V48

V48 war die stabile Roadbook-Basis ohne Wetterfunktion. V49 ergänzt Wetterautomatisierung, Mehrtagelogik und kompakte Wetter-UX, ohne die Kernlogik von V48 zu ersetzen.
