import { z } from 'zod';
export const addressAnalyzeSchema = z.object({ address: z.string().trim().min(3) });
export const coordinateSchema = z.object({ latitude: z.number().finite(), longitude: z.number().finite() });
export const digipinSchema = z.object({ digipin: z.string().min(10) });
