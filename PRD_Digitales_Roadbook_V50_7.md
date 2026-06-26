# PRD – Digitales Roadbook V50.7

## Ziel

V50.7 ist die erste v1.0-Vorbereitungsiteration. Sie fokussiert produktreife Wetterzeiten, bessere Diagrammachse, Prognosegüte und sauberes Fokusverhalten.

## Änderungen

- Etappenauswahl fokussiert Etappenkarte/Höhengrafik, nicht automatisch Wetterdetails.
- Wetterdetails fokussieren Wetter nur, wenn sie aktiv aufgeklappt werden.
- Gesamt-Höhengrafik nutzt X-Achsen-Ticks nur für Start, Übernachtungs-/Hotelgrenzen und Ende.
- Wetterstartzeiten können aus GPX-`#datetime`, `#date` und `#starttime` gelesen werden.
- Groq-Modell ist auf `openai/gpt-oss-120b` voreingestellt.
- Prognosegüte wird in `weather.json` berechnet und im UI angezeigt.
- Blaue Etappen-Wetterbox überschreibt die Überschrift mit `Wetterprognose für DD.MM.YY um HH:mmh`.
