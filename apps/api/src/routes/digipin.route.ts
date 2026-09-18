import type { FastifyInstance } from 'fastify';
import { decode, encode } from '../controllers/digipin.controller';
export async function digipinRoute(app: FastifyInstance) { app.post('/api/digipin/encode', encode); app.post('/api/digipin/decode', decode); }
