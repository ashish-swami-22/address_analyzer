import { z } from 'zod';
export const env = z.object({ API_PORT: z.coerce.number().default(4000) }).parse(process.env);
