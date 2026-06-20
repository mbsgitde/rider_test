# PRD – Bike Tour Planner (Best-Practice Kurzfassung für Repo)

## Zielbild V19
Die App trennt Tourdarstellung, Links und Logistik klar voneinander: Direkt nach der Tourauswahl stehen externe Links und Klassifizierung, danach Karte und Summary, anschließend Bahnhofsinfos vor den Etappen und Hotels nach den Etappen.

## Änderungen in V19
1. **Neue Aufteilung der Oberfläche**
   - Externe Links und ADFC-Bewertung zwischen Tourauswahl und Karte.
   - Bahnhofs-/Start-Ziel-Infos in eigenem Kasten vor den Etappen.
   - Hotels in eigenem Kasten nach den Etappen.

2. **Manuelle ADFC-Bewertung**
   - `adfcStars` und `adfcTourUrl` werden manuell in `data/routes.json` gepflegt.
   - Anzeige nur, wenn Werte vorhanden sind.

3. **Erweiterte Bahnhofslogistik**
   - Start und Ziel unterstützen:
     - Treffpunkt
     - Abfahrtszeit
     - Ankunftszeit
     - bis zu 3 Umstiege
     - bis zu 10 Sitzplatzreservierungen
     - bis zu 10 Radplatzreservierungen
   - Leere Listen oder fehlende Werte werden nicht angezeigt.

4. **Exporte bleiben vollständig**
   - ZIP enthält Gesamtstrecke + Etappen + README + Tour-Steckbrief.
   - README/TXT spiegeln die neuen Logistikdaten wider.

## Entschlackung
- Fokus nur auf aktuelle Kernbereiche: Tourwahl, Links/Klassifizierung, Karte, Etappen, Bahnhof, Hotels, Exporte.
- Veraltete Zwischenstufen wurden entfernt.
