from math import radians, sin, cos, sqrt, atan2

def haversine(p1, p2):
    R = 6371
    dlat = radians(p2["lat"] - p1["lat"])
    dlon = radians(p2["lon"] - p1["lon"])

    a = sin(dlat/2)**2 + cos(radians(p1["lat"])) * cos(radians(p2["lat"])) * sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1-a))

def build_stages(points, stops):
    stages = []
    chunk_size = len(points) // (len(stops) - 1)

    for i in range(len(stops) - 1):
        segment = points[i*chunk_size:(i+1)*chunk_size]
        dist = 0
        for j in range(len(segment)-1):
            dist += haversine(segment[j], segment[j+1])

        stages.append({
            "name": f"{stops[i]['name']} → {stops[i+1]['name']}",
            "distance_km": dist
        })

    return stages
