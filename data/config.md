# Konfigurationsdatei `config.json`

## Bereich `timing`
- `baseCyclingSpeedKmh`: Durchschnittsgeschwindigkeit in km/h bei 0 Höhenmetern bergauf.
- `climbSpeedReductionPer1000mKmh`: Abzug in km/h pro 1000 Höhenmeter bergauf.
- `minimumCyclingSpeedKmh`: Mindestgeschwindigkeit.
- `shortBreakMinutesPerHour`: Minuten Kurzpause pro Stunde Netto-Fahrzeit.
- `longBreakMinutesPerStage`: Zusätzliche große Pause pro Etappe.

## Bereich `weatherAlertThresholds`
- Wetter-Warnschwellen für spätere Erweiterung.

## Bereich `routePlausibilityCheck`
- Schwellwerte für Distanz eines Stops zur Route.

## Bereich `automation`
- Fachliches Intervall für spätere Wetter-Updates per GitHub Actions.

## Bereich `mapView`
- `defaultBaseMap`: Standard-Kartenstil beim Start.
- `availableBaseMaps`: Liste der aktiv nutzbaren Kartenansichten.
