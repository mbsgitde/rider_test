# PRD – Digitales Roadbook V50.1: Wetterdatum in allen Ansichten

## 1. Dokumentversion

- **Produkt:** Digitales Roadbook
- **Version:** V50.1
- **Status:** Implementierte ZIP-Version
- **Datum:** 2026-06-25
- **Basis:** V50
- **Schwerpunkt:** Datums- und Startzeit-Anzeige für Wetterprognosen

## 2. Ziel der Version

V50.1 ergänzt die Wetterdarstellung um ein klar sichtbares Datum im Format `DD/MM/YY` inklusive Startuhrzeit im Format `hh:mm`. Die Anzeige erfolgt in der Gesamtprognose, in der Etappenübersicht und in der aktiven Einzeletappenansicht.

## 3. Änderungen gegenüber V50

### 3.1 Gesamtprognose

- Die Wetterkarte der Gesamttour zeigt nun `Start: DD/MM/YY hh:mm`.
- Das Datum basiert auf `tourStartDateTime` aus `data/weather-settings.json` bzw. `data/weather.json`.

### 3.2 Etappenübersicht

- Jede Etappen-Wetterzeile zeigt jetzt die jeweilige Etappenstartzeit im Format `DD/MM/YY hh:mm`.
- Die Etappenstartzeit basiert auf `stageStartTime` pro Etappe.

### 3.3 Einzeletappenansicht

- Die Wetterkarte der aktiven Etappe zeigt nun `Start: DD/MM/YY hh:mm`.
- Die Darstellung bleibt unterhalb der Höhengrafik.

### 3.4 Karten-Popups

- Wetter-Popups verwenden ebenfalls das kurze Datumsformat `DD/MM/YY hh:mm`.

## 4. Akzeptanzkriterien

- Gesamtwetter zeigt Startdatum und Startzeit.
- Jede Zeile in der Etappen-Wetterübersicht zeigt Datum und Startzeit.
- Aktive Etappenansicht zeigt Datum und Startzeit.
- Format ist konsistent: `DD/MM/YY hh:mm`.
- V50-Funktionen bleiben erhalten: seitlich versetzte Wettermarker und reduzierte Abstände.
