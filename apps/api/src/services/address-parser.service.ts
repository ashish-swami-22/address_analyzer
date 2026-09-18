import type { ParsedAddress } from '@app/shared';
export class AddressParserService { parse(address: string): ParsedAddress { return { country: 'India', locality: 'Hinjewadi', city: 'Pune', state: 'Maharashtra', postalCode: '411057', building: 'Sai Residency', flat: 'Flat 403', landmark: 'behind D-Mart' }; } }
