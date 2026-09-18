import { describe, expect, it } from 'vitest';
import { decodeDigipin } from '../src';
describe('decodeDigipin', () => {
  it('decodes the documented example cell', () => { const result = decodeDigipin('39J-49L-L8T4'); expect(result.latitude).toBeCloseTo(28.622788, 4); expect(result.longitude).toBeCloseTo(77.213033, 4); });
  it('rejects an invalid DIGIPIN length', () => { expect(() => decodeDigipin('39J-49L-L8')).toThrow(); });
  it('rejects invalid DIGIPIN characters', () => { expect(() => decodeDigipin('39J-49L-L8X4')).toThrow(); });
});
