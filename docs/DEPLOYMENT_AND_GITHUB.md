# Deployment und GitHub-Betrieb

## 1. GitHub Pages

Die App ist statisch und kann direkt über GitHub Pages ausgeliefert werden.

### Typischer Ablauf

1. Dateien ins Repository pushen.
2. GitHub Pages auf Branch/Ordner konfigurieren.
3. `index.html` öffnet die App.
4. `.nojekyll` verhindert Jekyll-Verarbeitung.

---

## 2. Wetter-Workflow starten

Pfad:

```text
GitHub → Actions → Weather Forecast → Run workflow
```

Nach Erfolg wird `data/weather.json` aktualisiert und committed.

---

## 3. Typische Fehler

### `GROQ_API_KEY` fehlt

Nicht kritisch. Wetter wird erzeugt, aber KI-Zusammenfassungen enthalten Hinweistext.

### Tour liegt zu weit in der Zukunft

Wetterdaten werden als ungültig markiert, bis die Tour im Forecast-Fenster liegt.

### Browser zeigt alte Version

Hard Refresh durchführen oder Cache leeren.

---

## 4. Release-Konvention

Für produktive Tests sollten vollständige ZIP-Releases verwendet werden, nicht nur einzelne Hotfix-Dateien. App-only-Hotfixes sind nur für gezielte Korrekturen geeignet.
