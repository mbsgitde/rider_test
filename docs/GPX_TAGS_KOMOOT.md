# Komoot-/GPX-`#Tags`

## Harte Vorgabe: 250 Zeichen

Für dieses Projekt gilt: Pro Komoot-/GPX-Wegpunktbeschreibung (`<desc>`) sind maximal **250 Zeichen** erlaubt.

## Unterstützte Tags

```text
#type:start|overnight|end
#ort:<Ort>
#date:DD.MM.YYYY
#starttime:hh:mm
#url:<Link>
#comment:<Kommentar>
#adfcStars:<1-5>
#adfcUrl:<ADFC-Link>
#officialUrl:<Offizieller Tourlink>
```

## Startpunkt

```text
#type:start
#ort:Stuttgart
#date:01.07.2026
#starttime:11:45
#comment:Ankunft um 11:00h
```

## Overnight / Hotel

```text
#type:overnight
#ort:Bebenhausen
#starttime:09:00
#url:www.hirsch-bebenhausen.de
#comment:Check-In ab 15h
```

## Zielpunkt

```text
#type:end
#ort:Singen
#comment:Rückreise Zug 16:50
#adfcStars:4
#adfcUrl:www.adfc-radtourismus.de/hohenzollern-radweg/
#officialUrl:www.schwaebischealb.de/rad/hohenzollern-radweg
```

## Empfehlungen

- `https://` weglassen.
- Lange Tourlinks an den Zielpunkt verschieben.
- Kommentare kurz halten.
- Bei Overnights nur `#starttime` pflegen; das Datum wird automatisch berechnet.
