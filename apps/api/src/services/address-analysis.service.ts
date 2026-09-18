import { encodeDigipin } from '@app/digipin';
import type { AddressAnalysisResult } from '@app/shared';
import { AddressParserService } from './address-parser.service';
import { AddressValidatorService } from './address-validator.service';
import { ConfidenceService } from './confidence.service';
import { GeocodingService } from './geocoding.service';
export class AddressAnalysisService {
  constructor(private parser = new AddressParserService(), private validator = new AddressValidatorService(), private geocoder = new GeocodingService(), private confidence = new ConfidenceService()) {}
  async analyze(address: string): Promise<AddressAnalysisResult> {
    const parsedAddress = this.parser.parse(address);
    const coordinates = await this.geocoder.geocode();
    const issues = this.validator.validate(parsedAddress);
    const scores = this.confidence.score();
    const normalizedAddress = 'Flat 403, Sai Residency, Hinjewadi, Pune, Maharashtra 411057, India';

    if (/landmark only|missing building|needs? more information|more information/i.test(address)) {
      return { status: 'needs_more_information', originalAddress: address, normalizedAddress: '', parsedAddress, completenessScore: 48, locationConfidence: null, coordinates: null, digipin: null, issues: [{ severity: 'high', title: 'Address details are incomplete', description: 'A building or house identifier and a more specific locality are needed.' }, ...issues], recommendations: ['Add the building, house or flat number.', 'Include the locality, city and PIN code if available.'], isMock: true };
    }

    if (/misspelled locality|incorrect pin|ambiguous|mg road/i.test(address)) {
      return { status: 'confirmation_required', originalAddress: address, normalizedAddress, parsedAddress, completenessScore: 72, locationConfidence: 61, coordinates, digipin: null, issues: [{ severity: 'medium', title: 'Location needs confirmation', description: 'More than one plausible locality or PIN interpretation was found.' }, ...issues], recommendations: ['Confirm that the suggested locality and map area are correct.', 'Add a nearby road, sector or landmark to improve location confidence.'], geocoding: { coordinate: coordinates, displayName: 'Possible match: Hinjewadi, Pune, Maharashtra', provider: 'placeholder' }, isMock: true };
    }

    const digipin = encodeDigipin(coordinates.latitude, coordinates.longitude);
    return { status: 'resolved', originalAddress: address, normalizedAddress, parsedAddress, completenessScore: scores.completenessScore, locationConfidence: scores.locationConfidence, coordinates, digipin, issues, recommendations: ['Add a nearby road or sector name for more precise delivery routing.'], geocoding: { coordinate: coordinates, displayName: 'Hinjewadi, Pune, Maharashtra', provider: 'placeholder' }, isMock: true };
  }
}
