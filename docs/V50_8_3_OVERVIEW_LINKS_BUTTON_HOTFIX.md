# V50.8.3 – Overview / Links / Button Hotfix

Gezielter Hotfix für die funktionierende V50.8.1/V50.8.2:

- Die Gesamt-KM-Angabe am Ende der X-Achse wird als echter X-Achsen-Tick ausgegeben, z. B. `260`.
- Die Overnight-KM-Werte werden nicht mehr manuell gezeichnet, sondern als echte Achsen-Ticks dargestellt. Dadurch liegen sie exakt auf gleicher Höhe wie die `0`.
- ADFC- und offizieller Tourlink werden nicht nur am Startpunkt gesucht, sondern auch am Zielpunkt und an jedem weiteren Roadbook-Punkt.
- GPX-URLs ohne `https://` werden automatisch als `https://...` geöffnet.
- Button-/Link-Icons werden per CSS vertikal mit der Schrift ausgerichtet.

Anwendung: Diese ZIP über die funktionierende Version entpacken und `assets/app.js` sowie `assets/styles.css` ersetzen.
