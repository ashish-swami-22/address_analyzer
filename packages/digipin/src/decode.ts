import { DIGIPIN_ALPHABET, DIGIPIN_GRID, INDIA_DIGIPIN_BOUNDS } from './constants';
import type { Coordinate } from './types';
export function decodeDigipin(digipin: string): Coordinate {
  const normalized = digipin.replaceAll('-', '').toUpperCase();
  if (normalized.length !== 10 || [...normalized].some((character) => !DIGIPIN_ALPHABET.has(character))) throw new Error('DIGIPIN must contain 10 valid characters.');
  const grid = DIGIPIN_GRID as readonly (readonly string[])[];
  let { minLatitude, maxLatitude, minLongitude, maxLongitude } = INDIA_DIGIPIN_BOUNDS;
  for (const character of normalized) {
    const row = grid.findIndex((line) => line.includes(character));
    const column = grid[row].indexOf(character);
    const latitudeHeight = (maxLatitude - minLatitude) / 4;
    const longitudeWidth = (maxLongitude - minLongitude) / 4;
    maxLatitude -= row * latitudeHeight; minLatitude = maxLatitude - latitudeHeight;
    minLongitude += column * longitudeWidth; maxLongitude = minLongitude + longitudeWidth;
  }
  return { latitude: (minLatitude + maxLatitude) / 2, longitude: (minLongitude + maxLongitude) / 2 };
}
