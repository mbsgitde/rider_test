# V50.8.5 – Hotfix Gesamtübersicht KM-Marker

Dieser Hotfix ist für die letzte Version gedacht und ersetzt nur:

- `assets/app.js`
- `assets/styles.css`

## Änderung

- Das Koordinatensystem der Gesamtübersicht bleibt wieder Standard wie bei den Etappen.
- Die Kilometerstände der Hotels/Übernachtungen werden zusätzlich als kleine Labels im Gesamtprofil eingeblendet.
- Die Ziel-/Gesamtdistanz wird ebenfalls zusätzlich eingeblendet, z. B. `260`.
- Alte erzwungene X-Achsen-Ticks wurden entfernt, damit die normale Chart.js-Achse nicht mehr kaputtgeht.
- Weltkugel-/Link-Icons werden wieder direkt neben dem Text ausgerichtet.

## Anwendung

ZIP über die letzte funktionierende Version entpacken und `assets/app.js` sowie `assets/styles.css` ersetzen.
Danach Browser-Cache leeren bzw. Hard Refresh durchführen.
