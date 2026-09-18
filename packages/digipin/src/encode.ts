import { DIGIPIN_GRID, DIGIPIN_LENGTH, INDIA_DIGIPIN_BOUNDS } from './constants';
export function encodeDigipin(latitude: number, longitude: number): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < INDIA_DIGIPIN_BOUNDS.minLatitude || latitude > INDIA_DIGIPIN_BOUNDS.maxLatitude || longitude < INDIA_DIGIPIN_BOUNDS.minLongitude || longitude > INDIA_DIGIPIN_BOUNDS.maxLongitude) throw new Error('Coordinates are outside the DIGIPIN bounding box.');
  let { minLatitude, maxLatitude, minLongitude, maxLongitude } = INDIA_DIGIPIN_BOUNDS;
  let result = '';
  for (let level = 0; level < DIGIPIN_LENGTH; level += 1) {
    const row = Math.min(3, Math.floor(((maxLatitude - latitude) / (maxLatitude - minLatitude)) * 4));
    const column = Math.min(3, Math.floor(((longitude - minLongitude) / (maxLongitude - minLongitude)) * 4));
    result += DIGIPIN_GRID[row][column];
    const latitudeHeight = (maxLatitude - minLatitude) / 4;
    const longitudeWidth = (maxLongitude - minLongitude) / 4;
    maxLatitude -= row * latitudeHeight; minLatitude = maxLatitude - latitudeHeight;
    minLongitude += column * longitudeWidth; maxLongitude = minLongitude + longitudeWidth;
  }
  return `${result.slice(0, 3)}-${result.slice(3, 6)}-${result.slice(6)}`;
}
