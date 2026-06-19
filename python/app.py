import js
from gpx_parser import parse_gpx
from stage_builder import build_stages

async def load_data():
    route_select = js.document.getElementById("routeSelect")
    route_file = route_select.value

    response = await js.fetch(route_file)
    gpx_text = await response.text()

    trackpoints = parse_gpx(gpx_text)

    response_stops = await js.fetch("data/stops.json")
    stops = await response_stops.json()

    stages = build_stages(trackpoints, stops)

    output = ""
    for s in stages:
        output += f"<p>{s['name']}: {round(s['distance_km'],1)} km</p>"

    js.document.getElementById("output").innerHTML = output
