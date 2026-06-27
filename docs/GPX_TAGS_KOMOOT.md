# Komoot-/GPX-`#Tags`

Die Roadbook-Informationen werden im `<desc>`-Feld der GPX-Wegpunkte gepflegt. Komoot begrenzt dieses Feld typischerweise stark, daher sollten Tags kurz gehalten werden.

---

## 1. Grundprinzip

Relevante Wegpunkte werden durch `#type` erkannt:

```text
#type:start
#type:overnight
#type:end
```

Nur diese Wegpunkte strukturieren die Tour in Etappen.

---

## 2. Startpunkt

Beispiel:

```text
#type:start
#ort:Stuttgart
#date:01.07.2026
#starttime:11:45
#comment:Ankunft um 11:00h
```

### Bedeutung

- `#type:start` markiert den Tourstart.
- `#date` wird im deutschen Format `DD.MM.YYYY` geschrieben.
- `#starttime` wird im Format `hh:mm` geschrieben.
- Dieses Datum bildet die Basis für alle Folgeetappen.

---

## 3. Übernachtung / Etappenstart

Beispiel:

```text
#type:overnight
#ort:Bebenhausen
#starttime:09:00
#url:www.hirsch-bebenhausen.de
#comment:Check-In ab 15h
```

### Bedeutung

- `#type:overnight` markiert einen Hotel-/Übernachtungspunkt.
- Gleichzeitig ist dieser Punkt der Start der nächsten Etappe.
- Es reicht, nur `#starttime` zu pflegen.
- Das Datum wird automatisch berechnet:
  - Etappe 2 = Startdatum + 1 Tag
  - Etappe 3 = Startdatum + 2 Tage
  - Etappe 4 = Startdatum + 3 Tage

---

## 4. Zielpunkt

Beispiel:

```text
#type:end
#ort:Singen
#comment:Rückreise mit dem Zug um 16:50h
#adfcStars:4
#adfcUrl:www.adfc-radtourismus.de/hohenzollern-radweg/
#officialUrl:www.schwaebischealb.de/rad/hohenzollern-radweg
```

### Bedeutung

- `#type:end` markiert das Ende der Tour.
- Am Zielpunkt können Tourlinks gepflegt werden, weil dort keine Etappenstartzeit nötig ist.
- `#adfcStars`, `#adfcUrl` und `#officialUrl` werden in der Gesamtübersicht angezeigt.

---

## 5. Unterstützte Tags

```text
#type:start|overnight|end
#ort:<Ort>
#date:DD.MM.YYYY
#starttime:hh:mm
#url:<Hotel- oder POI-Link>
#comment:<Kommentar>
#adfcStars:<1-5>
#adfcUrl:<ADFC-Link>
#officialUrl:<Offizieller Tourlink>
```

---

## 6. URL-Regeln

`https://` darf weggelassen werden:

```text
#url:www.example.de
```

Die App öffnet dies automatisch als:

```text
https://www.example.de
```

---

## 7. Zeichenlimit-Tipps für Komoot

- `https://` weglassen.
- Kommentare kurz halten.
- Lange Tourlinks am Zielpunkt pflegen.
- Pro Wegpunkt nur notwendige Tags speichern.
