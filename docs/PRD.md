# PRD – Digitales Roadbook


---

## 16. User- und Konfigurationsdokumentation für GitHub

### Ziel

Die Repository-Dokumentation muss neuen Nutzern und Betreibern ermöglichen, das Projekt ohne zusätzliche Erklärung zu konfigurieren, zu deployen und zu warten.

### Neue Dokumentationsstruktur

```text
README.md
docs/CONFIGURATION.md
docs/GPX_TAGS_KOMOOT.md
docs/WEATHER_AUTOMATION.md
docs/AI_SUMMARY.md
docs/TIMING_AND_BREAKS.md
docs/DEPLOYMENT_AND_GITHUB.md
docs/PRD.md
```

### Akzeptanzkriterien

- README erklärt das Projekt in maximal 10 Minuten verständlich.
- README verlinkt alle relevanten Konfigurationsdokumente.
- Wetter, Cronjob, KI-Zusammenfassung, Dauer-/Pausenberechnung und Komoot-`#Tags` sind jeweils separat beschrieben.
- GitHub-Betrieb und manuelles Starten der Weather Action sind dokumentiert.
- Neue Nutzer können anhand der README eine Route pflegen, Wetter erzeugen und die App deployen.
