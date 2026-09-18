import type { DigipinBounds } from './types';
export const DIGIPIN_GRID = [['F','C','9','8'],['J','3','2','7'],['K','4','5','6'],['L','M','P','T']] as const;
export const DIGIPIN_LENGTH = 10;
export const INDIA_DIGIPIN_BOUNDS: DigipinBounds = { minLatitude: 2.5, maxLatitude: 38.5, minLongitude: 63.5, maxLongitude: 99.5 };
export const DIGIPIN_ALPHABET: ReadonlySet<string> = new Set<string>(DIGIPIN_GRID.flat());
