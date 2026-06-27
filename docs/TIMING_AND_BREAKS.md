# Dauer- und Pausenberechnung

Die Dauer- und Pausenberechnung wird über `data/config.json` gesteuert.

---

## 1. Aktuelle Timing-Konfiguration

```json
{
  "baseCyclingSpeedKmh": 19,
  "minimumCyclingSpeedKmh": 9,
  "climbSpeedReductionPer1000mKmh": 4,
  "shortBreakMinutesPerHour": 7,
  "longBreakMinutesPerStage": 20
}
```

---

## 2. Bedeutungen

### `baseCyclingSpeedKmh`

Grundgeschwindigkeit auf flachen Abschnitten.

### `minimumCyclingSpeedKmh`

Untergrenze der Geschwindigkeit, auch wenn Höhenmeter die Geschwindigkeit reduzieren.

### `climbSpeedReductionPer1000mKmh`

Reduktion der Geschwindigkeit je 1000 Höhenmeter Anstieg.

### `shortBreakMinutesPerHour`

Kurze Pausenzeit pro Fahrstunde. Diese Zeit wird auf die geschätzte Etappendauer addiert.

---

## 3. Berechnungsprinzip

Vereinfacht:

```text
Etappengeschwindigkeit = baseCyclingSpeedKmh - Höhenmeterfaktor
Etappendauer = Distanz / Etappengeschwindigkeit
Pausenzeit = Fahrzeit in Stunden × shortBreakMinutesPerHour
Gesamtdauer = Fahrzeit + Pausenzeit
```

Die genaue Berechnung erfolgt in `assets/app.js` beziehungsweise für Wetterzeitpunkte in `assets/generateWeather.js`.

---

## 4. Konfigurationshinweise

- Höhere `baseCyclingSpeedKmh` verkürzt alle Etappenzeiten.
- Höhere `climbSpeedReductionPer1000mKmh` verlängert bergige Etappen.
- Höhere `shortBreakMinutesPerHour` verschiebt Wetterpunkte später in den Tag.
