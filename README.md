# Digitales Roadbook – V43

## Inhalt

Diese Version enthält ausschließlich das hochgeladene GPX-Beispiel:

- `gpx/Hohenzollernradweg_Relax.gpx`

## Wichtige Änderung in V43

- `routes.json` wurde durch `data/gpx-manifest.json` ersetzt.
- Das Manifest listet nur die GPX-Dateien, die im Dropdown angezeigt werden sollen.
- Der Anzeigename kommt aus GPX `<metadata><name>` bzw. `<trk><name>`.
- Etappenstopps kommen primär aus GPX-`<wpt><desc>` Tags:
  - `#type:start|overnight|end`
  - `#ort:...`
  - `#url:...` für Hotels
  - `#comment:...`
- ADFC und offizielle Tourlinks sind optional und werden im `#type:start`-Wegpunkt gelesen:
  - `#adfcStars:4`
  - `#adfcUrl:https://...`
  - `#officialUrl:https://...`
- `stops.fallback.json` ist ausdrücklich nur ein optionaler Fallback, falls ein GPX keine Roadbook-Tags enthält.

## Dateien

```text
index.html
assets/app.js
assets/styles.css
data/config.json
data/gpx-manifest.json
data/Hohenzollernradweg_Relax-stops.fallback.json
gpx/Hohenzollernradweg_Relax.gpx
```
