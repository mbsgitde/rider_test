# Digitales Roadbook – V48

## Fix gegenüber V47

V47 wurde durch eine zu starke Umstrukturierung instabil. V48 basiert wieder auf der stabilen V46-Logik und übernimmt nur den gewünschten Marker-Feinschliff:

- Übernachtungs-KM-Angabe im Gesamthöhenprofil auf X-Achsen-Label-Höhe.
- Keine Einheit `km` beim Übernachtungs-KM-Label.
- Gestrichelte Linie endet auf der X-Achse.
- Gestrichelte Linie hat Linienstärke 1, analog zu den Achsen-/Gridlinien.
- Tour-Dropdown, Manifest-Laden und GPX-Parsing wurden zusätzlich validiert.


---

## V48 Wetterprognose-Erweiterung

Diese ZIP-Version erweitert V48 um eine automatisierte Wetterprognose entlang der Route.

### Enthaltene neue Dateien

- `data/weather-settings.json` – Startdatum/-uhrzeit und Sampling-Distanz
- `data/weather.json` – generierter Forecast für Frontend und GitHub Pages
- `scripts/generateWeather.js` – Generator für Open-Meteo + Groq-Zusammenfassung
- `.github/workflows/weather.yml` – GitHub Actions Workflow

### GitHub Secret

Für die KI-Zusammenfassung muss im Repository ein Secret hinterlegt werden:

```text
Settings → Secrets and variables → Actions → New repository secret
Name: GROQ_API_KEY
Value: <dein Groq API Key>
```

Ohne `GROQ_API_KEY` wird die Wetterdatei trotzdem erzeugt, aber die Zusammenfassung enthält dann einen Hinweis, dass keine KI-Zusammenfassung verfügbar ist.

### Startdatum ändern

Das Startdatum steht in:

```text
data/weather-settings.json
```

Beispiel:

```json
"tourStartDateTime": "2026-07-01T09:00:00+02:00"
```

Es wird nur dann eine Forecast-Prognose erzeugt, wenn der Startzeitpunkt in der Zukunft und maximal 14 Tage entfernt ist.

### Anzeigeverhalten

- Keine Etappe aktiv: Wetterprognose für die Gesamttour im Übersichtsbereich.
- Etappe aktiv: Wetterprognose nur für die aktive Etappe; die übrigen Etappen sind ausgeblendet.
- Karte: Wettermarker werden passend zum aktuellen Kontext (Gesamt/Etappe) angezeigt.
