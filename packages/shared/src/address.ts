import type { Coordinate, GeocodingResult } from './geo';
export interface ParsedAddress { houseNumber?: string; building?: string; floor?: string; flat?: string; street?: string; landmark?: string; locality?: string; city?: string; state?: string; postalCode?: string; country: string; }
export interface AddressIssue { severity: 'low' | 'medium' | 'high'; title: string; description: string; }
export type AddressResolutionStatus = 'resolved' | 'confirmation_required' | 'needs_more_information';
export interface AddressAnalysisResult { status: AddressResolutionStatus; originalAddress: string; normalizedAddress: string; parsedAddress: ParsedAddress; completenessScore: number; locationConfidence: number | null; coordinates: Coordinate | null; digipin: string | null; issues: AddressIssue[]; recommendations: string[]; geocoding?: GeocodingResult; isMock: true; }
