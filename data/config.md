# Konfigurationsdatei `config.json`

## Bereich `timing`

- `baseCyclingSpeedKmh`: Angenommene Durchschnittsgeschwindigkeit in km/h bei 0 Höhenmetern bergauf.
- `climbSpeedReductionPer1000mKmh`: Abzug in km/h pro 1000 Höhenmeter bergauf.
- `minimumCyclingSpeedKmh`: Mindestgeschwindigkeit, damit die Fahrzeitberechnung nicht unrealistisch langsam wird.
- `shortBreakMinutesPerHour`: Minuten Kurzpause pro Stunde Netto-Fahrzeit.
- `longBreakMinutesPerStage`: Zusätzliche große Pause pro Etappe in Minuten.

## Bereich `weatherAlertThresholds`

- `rainWarningMillimeters`: Warnschwelle für Niederschlagssumme in mm.
- `rainProbabilityWarningPercent`: Warnschwelle für Niederschlagswahrscheinlichkeit in Prozent.
- `windWarningKmh`: Warnschwelle für Windgeschwindigkeit in km/h.
- `warmTemperatureCelsius`: Hinweis auf warme Bedingungen ab dieser Temperatur in °C.
- `hotTemperatureCelsius`: Warnung auf heißen Tagesabschnitt ab dieser Temperatur in °C.
- `criticalHeatTemperatureCelsius`: Starke Warnung bei sehr heißem Tagesabschnitt ab dieser Temperatur in °C.
- `forecastRainIncreaseMillimeters`: Schwelle für deutliche Verschlechterung der Regenprognose in mm.
- `forecastRainProbabilityIncreasePercent`: Schwelle für deutliche Verschlechterung der Regenwahrscheinlichkeit in Prozentpunkten.
- `forecastWindIncreaseKmh`: Schwelle für deutliche Verschlechterung der Windprognose in km/h.

## Bereich `routePlausibilityCheck`

- `distanceFromRouteInfoThresholdKm`: Abstand zur Route in km, ab dem ein Hinweis angezeigt wird.
- `distanceFromRouteWarningThresholdKm`: Abstand zur Route in km, ab dem eine Warnung angezeigt wird.
- `distanceFromRouteCriticalThresholdKm`: Abstand zur Route in km, ab dem ein kritischer Warnhinweis angezeigt wird.

## Bereich `automation`

- `weatherUpdateInterval`: Gewünschtes fachliches Intervall für Wetterupdates, z. B. `hourly`, `every3hours`, `daily`.
