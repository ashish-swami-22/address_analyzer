import type { AddressIssue, ParsedAddress } from '@app/shared';
export class AddressValidatorService { validate(parsed: ParsedAddress): AddressIssue[] { return parsed.postalCode ? [] : [{ severity: 'high', title: 'Missing PIN code', description: 'A six-digit postal code would improve routing confidence.' }]; } }
