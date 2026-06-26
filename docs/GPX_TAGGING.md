# GPX Tagging für Wetterzeiten

V50.8 unterstützt Wetter-Startzeiten direkt aus dem `<desc>` eines Start- oder Übernachtungs-Wegpunkts.

## Empfohlenes Format

Am Startpunkt:

```text
#type:start
#ort:Stuttgart
#date:01.07.2026
#starttime:11:45
```

An den Übernachtungspunkten reicht die Uhrzeit:

```text
#type:overnight
#ort:Bebenhausen
#starttime:09:00
```

Daraus berechnet der Generator automatisch:

```text
Etappe 1 = Startdatum
Etappe 2 = Startdatum + 1 Tag
Etappe 3 = Startdatum + 2 Tage
Etappe 4 = Startdatum + 3 Tage
```

## URLs

`https://` kann weggelassen werden. Das Frontend ergänzt es automatisch.

```text
#url:www.example.de
#adfcUrl:www.example.de/tour
#officialUrl:www.example.de/offiziell
```

## Tourlinks

ADFC- und offizielle Tourlinks können am Startpunkt oder am Zielpunkt stehen.
