# PRD – Digitales Roadbook V49.1: Kompakte mehrtägige Wetterprognose – UI-Finishing

## 1. Dokumentversion

- **Produkt:** Digitales Roadbook
- **Version:** V49.1
- **Status:** Implementierte ZIP-Version
- **Datum:** 2026-06-25
- **Basis:** V49 / V48 Stable Baseline
- **Schwerpunkt:** Wetter-UX, Karten-Prioritäten, Chart-Integration, Cron-Frequenz

## 2. Produktziel

V49.1 verfeinert die Wetterintegration aus V49. Ziel ist eine übersichtliche Darstellung der Wetterprognose ohne visuelle Überladung: Die Etappenansicht zeigt eine kompakte Wetterkarte unterhalb des Höhenprofils, die Gesamtansicht integriert Wetter-Icons zusätzlich in die Gesamt-Höhengrafik, und Kartenmarker sollen Start-, Ziel- und Übernachtungsmarker nicht überdecken.

## 3. Änderungen gegenüber V49

### 3.1 Dateistruktur

- Der Generator wurde von `scripts/generateWeather.js` nach `assets/generateWeather.js` verschoben.
- Der Workflow ruft jetzt `node assets/generateWeather.js` auf.
- Der Ordner `scripts` wird nicht mehr benötigt.

### 3.2 Karten-Controls

- Die Icons für Vollbildkarte und Tour-Zentrierung werden über CSS wieder mittig ausgerichtet.
- `.map-control-btn` nutzt Flexbox-Zentrierung.

### 3.3 Marker-Priorität auf der Karte

- Wettermarker erhalten einen niedrigeren `zIndexOffset`.
- Logistikmarker wie Start, Ziel und Übernachtung erhalten einen höheren `zIndexOffset`.
- Ziel: Wetterdaten ergänzen die Karte, überdecken aber nicht die Roadbook-Logistik.

### 3.4 Wetterposition in den Etappen

- Die kompakte Wetterkarte steht in der Etappenansicht unterhalb der Höhengrafik.
- Das gilt sowohl in der normalen Etappenliste als auch bei aktivem Etappenfokus.

### 3.5 Wetterintegration in die Gesamt-Höhengrafik

- Die Gesamt-Höhengrafik enthält pro Etappe ein kompaktes Wettersymbol.
- Die Symbole werden im unteren Zusatzbereich des Charts gezeichnet.
- Das Chart-Padding wurde erhöht, damit Wetter-Icons nicht Höhenlinie, Achse oder Hotelmarker überdecken.

### 3.6 Cron-Frequenz

- Der Workflow läuft geplant um 05, 08, 11, 14, 17, 20 und 22 Uhr deutscher Sommerzeit.
- In UTC entspricht das `0 3,6,9,12,15,18,20 * * *`.
- Zwischen 23 Uhr und 5 Uhr morgens erfolgt kein geplanter Lauf.

## 4. Akzeptanzkriterien

- `assets/generateWeather.js` existiert und wird von GitHub Actions genutzt.
- `.github/workflows/weather.yml` enthält keinen Verweis mehr auf `scripts/generateWeather.js`.
- Wetterkarten erscheinen unterhalb der Höhenprofile.
- Die Gesamt-Höhengrafik zeigt Wetter-Icons pro Etappe ohne Hotelmarker zu verdecken.
- Start-, Ziel- und Übernachtungsmarker bleiben auf der Karte visuell dominant.
- Der Workflow verwendet Node.js 24 und Actions v6.
- Die geplante Cron-Frequenz erzeugt bei bis zu 10 Touren ausreichend Puffer zum Groq-Free-Tier.

## 5. Technische Hinweise

- GitHub Actions Cron läuft in UTC.
- Bei 10 Touren und 4 Etappen entstehen ungefähr 5 Groq-Requests pro Tour und Lauf: 4 Etappen + 1 Gesamttour.
- Bei 7 geplanten Läufen pro Tag entspricht das bei 10 Touren ca. 350 Groq-Requests pro Tag.
- Das liegt unter dem typischen Free-Tier-Limit für `llama-3.3-70b-versatile` von 1.000 Requests pro Tag.
