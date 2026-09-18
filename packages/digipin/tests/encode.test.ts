import { describe, expect, it } from 'vitest';
import { decodeDigipin, encodeDigipin } from '../src';
describe('encodeDigipin', () => {
  it('encodes the official Dak Bhawan example', () => {
    expect(encodeDigipin(28.622788, 77.213033)).toBe('39J-49L-L8T4');
  });

  it('rejects an invalid latitude', () => {
    expect(() => encodeDigipin(38.500001, 77.213033)).toThrow();
    expect(() => encodeDigipin(Number.NaN, 77.213033)).toThrow();
  });

  it('rejects an invalid longitude', () => {
    expect(() => encodeDigipin(28.622788, 99.500001)).toThrow();
    expect(() => encodeDigipin(28.622788, Number.POSITIVE_INFINITY)).toThrow();
  });

  it('round trips through the center of the encoded cell', () => {
    const digipin = encodeDigipin(28.622788, 77.213033);
    const decoded = decodeDigipin(digipin);

    expect(encodeDigipin(decoded.latitude, decoded.longitude)).toBe(digipin);
  });
});
