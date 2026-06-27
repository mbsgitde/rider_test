# KI-Zusammenfassung mit Groq

Die App kann Wetterdaten pro Etappe und für die Gesamttour durch eine KI zusammenfassen lassen.

---

## 1. Anbieter

Aktuell vorgesehen:

```text
Groq Chat Completions API
```

Modell laut `weather-settings.json`:

```text
llama-3.3-70b-versatile
```

---

## 2. Aktivierung

Datei:

```text
data/weather-settings.json
```

```json
"ai": {
  "enabled": true,
  "provider": "groq",
  "model": "openai/gpt-oss-120b"
}
```

---

## 3. GitHub Secret

In GitHub muss ein Repository Secret gesetzt werden:

```text
GROQ_API_KEY
```

Pfad:

```text
Repository → Settings → Secrets and variables → Actions → New repository secret
```

---

## 4. Verhalten ohne API-Key

Wenn kein `GROQ_API_KEY` gesetzt ist, bleibt die Wettergenerierung funktionsfähig. Die App schreibt dann einen Hinweistext statt einer KI-Zusammenfassung.

---

## 5. Prompt-Guard

Die KI wird instruiert:

- keine Distanzen zu erfinden,
- Etappenlängen nicht aus Wetterpunkten abzuleiten,
- nur vorhandene Werte zu verwenden,
- Wetter, Regen, Wind, Temperatur und Prognosegüte zusammenzufassen.
