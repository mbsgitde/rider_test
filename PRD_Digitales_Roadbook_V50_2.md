# PRD – Digitales Roadbook V50.2: Wetterübersicht ohne Kartenmarker

## 1. Dokumentversion

- **Produkt:** Digitales Roadbook
- **Version:** V50.2
- **Status:** Implementierte ZIP-Version
- **Datum:** 2026-06-25
- **Basis:** V50.1
- **Schwerpunkt:** Wetterpositionierung ohne Kartenmarker und vereinfachte Gesamtprognose

## 2. Ziel der Version

V50.2 entfernt Wettericons vollständig aus der Kartenansicht und verlagert die Wetterorientierung in die Roadbook-Übersichten. Die Gesamt-Höhengrafik zeigt Wettericons je Etappe mittig zwischen den Übernachtungs-/Hotelmarkern. Die Wetterprognose der Gesamttour zeigt nur die Gesamtprognose, während die einzelnen Etappenprognosen direkt in den Etappenkarten unterhalb der Höhengrafik erscheinen.

## 3. Änderungen gegenüber V50.1

### 3.1 Kartenansicht

- Keine Wettermarker mehr auf der Karte.
- Start, Ziel, Hotels und Etappennummern bleiben unbeeinflusst.

### 3.2 Gesamtübersicht

- Wettericons pro Etappe bleiben in der Gesamt-Höhengrafik.
- Die Position liegt jeweils bei der Mitte der Etappendistanz, also visuell zwischen den Hotelmarkern.
- Die Karte „Wetterprognose Gesamttour“ enthält keine Etappenliste mehr.

### 3.3 Etappenübersicht

- Jede Etappe zeigt ihre eigene Wetterkurzform direkt in der Etappenkarte unterhalb des Höhenprofils.
- Dies gilt sowohl in der normalen Übersicht als auch bei aktivem Etappenfokus.

### 3.4 Datumsformat

- Wetterdatum wird im Format `DD.MM.YY hh:mmh` ausgegeben.
- Beispiel: `01.07.26 09:00h`.

## 4. Akzeptanzkriterien

- Auf der Karte sind keine Wettericons sichtbar.
- Die Gesamt-Höhengrafik zeigt Wettericons mittig zwischen den Hotelmarkern.
- Die Gesamt-Wetterprognose enthält keine Etappen 1–4 Liste.
- Etappenwetter ist in jeder Etappenkarte in Kurzform sichtbar.
- Datumsformat ist konsistent `DD.MM.YY hh:mmh`.
