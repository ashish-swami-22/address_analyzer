import type { FastifyInstance } from 'fastify';
import { analyzeAddress } from '../controllers/address.controller';
export async function addressRoute(app: FastifyInstance) { app.post('/api/address/analyze', analyzeAddress); }
