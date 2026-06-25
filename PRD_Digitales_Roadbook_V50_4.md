# PRD – Digitales Roadbook V50.4: Weather Deployment Guard

## 1. Dokumentversion

- **Produkt:** Digitales Roadbook
- **Version:** V50.4
- **Status:** Implementierte ZIP-Version
- **Datum:** 2026-06-25
- **Basis:** V50.3
- **Schwerpunkt:** Stabilisierung von Weather Cron und GitHub Pages Deployment

## 2. Problem

Die Wetter-Action erzeugte regelmäßig Commits auf `data/weather.json`. Auch wenn sich inhaltlich nur `generatedAt` änderte, wurde dadurch ein neuer Push ausgelöst. Bei häufiger Cron-Ausführung konnte dies die automatische `pages build and deployment` Action unnötig oft starten und Deployments blockieren oder in Timeouts laufen lassen.

## 3. Ziel

V50.4 reduziert unnötige Pages-Deployments und macht den Wetter-Workflow robuster gegen parallele Läufe und Remote-Änderungen.

## 4. Änderungen gegenüber V50.3

### 4.1 Workflow-Concurrency

Der Workflow nutzt jetzt:

```yaml
concurrency:
  group: weather-forecast-${{ github.ref }}
  cancel-in-progress: false
```

Damit laufen Wetterjobs pro Branch nicht parallel gegeneinander.

### 4.2 Branch-Synchronisierung

Vor der Generierung wird der aktuelle Remote-Stand geholt:

```bash
git fetch origin "$BRANCH"
git pull --rebase origin "$BRANCH"
```

Nach dem Commit erfolgt vor dem Push zusätzlich ein Rebase mit Autostash.

### 4.3 Meaningful Change Detection

Der Workflow vergleicht die alte und neue `data/weather.json`, ignoriert dabei aber `generatedAt`. Wenn sich nur `generatedAt` geändert hat, wird die alte Datei wiederhergestellt und kein Commit erzeugt.

### 4.4 V50.3-Funktionalität bleibt erhalten

- KI-Prompt-Guard gegen falsche Etappendistanzen
- keine Wettermarker auf der Karte
- Wettericons in der Gesamt-Höhengrafik
- Etappenwetter unter der jeweiligen Höhengrafik
- Datumsformat `DD.MM.YY hh:mmh`

## 5. Akzeptanzkriterien

- Wetter-Action commitet nicht, wenn sich nur `generatedAt` ändert.
- Pages Deployment wird nicht mehr durch reine Timestamp-Commits ausgelöst.
- Wetter-Action ist robuster gegen `fetch first` Push-Fehler.
- V50.3 UI und KI-Prompt-Guard bleiben unverändert erhalten.
