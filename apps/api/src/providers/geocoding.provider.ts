import type { GeocodingResult } from '@app/shared';
export interface GeocodingProvider { geocode(address: string): Promise<GeocodingResult | null>; }
export class PlaceholderGeocodingProvider implements GeocodingProvider { async geocode(): Promise<null> { return null; } }
