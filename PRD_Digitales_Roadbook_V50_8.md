# PRD – Digitales Roadbook V50.8

## Ziel

V50.8 finalisiert die GPX-basierte Wetterzeitlogik und verfeinert die Gesamt-Höhengrafik.

## Änderungen

- Deutsches Datumsformat `DD.MM.YYYY` am Startpunkt wird unterstützt.
- Folgeetappen übernehmen automatisch Startdatum + Etappenindex und benötigen nur `#starttime:hh:mm`.
- URLs ohne `https://` werden im Frontend normalisiert.
- Tourlinks können vom Startpunkt, Zielpunkt oder erstem Wegpunkt mit Link-Tags gelesen werden.
- Übernachtungs-KM-Labels im Gesamtprofil werden auf Höhe der X-Achsen-Beschriftung gezeichnet.
- Übernachtungs-Linien sind nicht mehr gestrichelt, sondern als dezente Koordinatensystemlinie dargestellt.
- Gesamtprofil zeigt Start-0 und gerundete Gesamt-KM-Zahl am Ende generisch aus dem GPX.
- Abstand zwischen Gesamtprofil und orangefarbener Wetterbox wurde an den Abstand Etappenprofil/blauer Wetterbox angeglichen.
