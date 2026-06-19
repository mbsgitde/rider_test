import xml.etree.ElementTree as ET

def parse_gpx(gpx_text):
    root = ET.fromstring(gpx_text)
    ns = {'default': 'http://www.topografix.com/GPX/1/1'}

    points = []

    for trkpt in root.findall(".//default:trkpt", ns):
        lat = float(trkpt.get("lat"))
        lon = float(trkpt.get("lon"))

        ele = trkpt.find("default:ele", ns)
        elevation = float(ele.text) if ele is not None else 0

        points.append({"lat": lat, "lon": lon, "ele": elevation})

    return points
