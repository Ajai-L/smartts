const EARTH_RADIUS_M = 6371000;

function haversineDistance(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const c1 = Math.sin(dLat / 2) ** 2;
  const c2 = Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(c1 + c2));
}

export function evaluateMovementRisk({ previous, current, expectedRoutePoint, dangerZones }) {
  const velocity = previous ? haversineDistance(previous, current) : 0;
  const routeDeviation = expectedRoutePoint ? haversineDistance(expectedRoutePoint, current) : 0;

  const enteredDangerZones = dangerZones.filter((zone) => {
    const [lng, lat] = zone.center.coordinates;
    return haversineDistance({ lat, lng }, current) <= zone.radiusMeters;
  });

  const riskScore = Math.min(
    100,
    (velocity > 25 ? 35 : 10) + (routeDeviation > 500 ? 25 : 5) + enteredDangerZones.length * 20
  );

  return { velocity, routeDeviation, enteredDangerZones, riskScore };
}
