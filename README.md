# Bike Tour Planner – GitHub Pages Starter (Fixed)

## Behobener Fehler
Diese Version behebt den Fehler:

```text
APP.layerGroup.getBounds is not a function
```

### Fix
Statt `L.layerGroup()` wird jetzt `L.featureGroup()` verwendet, sodass `getBounds()` korrekt funktioniert.
