# PRD – Digitales Roadbook V50.6: Aufklappbarer Wetter-Einzahler

## 1. Dokumentversion

- **Produkt:** Digitales Roadbook
- **Version:** V50.6
- **Status:** Implementierte ZIP-Version
- **Datum:** 2026-06-25
- **Basis:** V50.5
- **Schwerpunkt:** Wetter-Einzahler mit Regen-/Wind-Icons und ausklappbarer Prognose

## 2. Ziel

V50.6 verbessert die kompakte Wetterzeile in der Etappenübersicht. Der Einzahler zeigt die wichtigsten Wetterdaten in einer Zeile, ist aber ausklappbar, um bei Bedarf die vollständige Prognose inklusive KI-Zusammenfassung anzuzeigen.

## 3. Änderungen gegenüber V50.5

### 3.1 Wetter-Einzahler

Der Einzahler enthält nun:

- Wettericon
- Temperaturbereich
- Regen-Icon mit `Regen x,x mm · Risiko bis X %`
- Wind-Icon mit `Wind bis X km/h`

### 3.2 Aufklappbare Detailprognose

In der Etappenübersicht ist der Einzahler als `<details>`/`<summary>` umgesetzt. Beim Aufklappen erscheint die vollständige Prognose inklusive Startzeit, Detaildaten und KI-Zusammenfassung.

### 3.3 Einzeletappen-Fokus

Bei aktivem Etappenfokus bleibt die vollständige blaue Wetterbox direkt sichtbar.

## 4. Akzeptanzkriterien

- Regenwert und Risiko stehen zusammen hinter dem Regen-Icon.
- Windwert steht hinter dem Wind-Icon.
- Einzahler ist in der Übersicht aufklappbar.
- Vollständige Prognose ist weiterhin direkt sichtbar, wenn eine einzelne Etappe fokussiert ist.
- V50.5 Debug-Zeile und V50.4 Deployment Guard bleiben erhalten.
