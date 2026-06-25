/**
 * Calculate the distance between two geographic points in meters
 * using the Haversine formula
 */
const getDistanceMeters = (
  userLat: number,
  userLng: number,
  targetLat: number,
  targetLng: number
): number => {
  const EARTH_RADIUS_METERS = 6371000;

  const toRadians = (deg: number): number => (deg * Math.PI) / 180;

  const dLat = toRadians(targetLat - userLat);
  const dLng = toRadians(targetLng - userLng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(userLat)) *
      Math.cos(toRadians(targetLat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

export default getDistanceMeters;
