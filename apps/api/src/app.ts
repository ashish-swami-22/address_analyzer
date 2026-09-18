import cors from '@fastify/cors';
import Fastify from 'fastify';
import { addressRoute } from './routes/address.route';
import { digipinRoute } from './routes/digipin.route';
import { healthRoute } from './routes/health.route';
export function buildApp() { const app = Fastify({ logger: true }); app.register(cors, { origin: true }); app.register(healthRoute); app.register(addressRoute); app.register(digipinRoute); app.setErrorHandler((error, _request, reply) => { const message = error instanceof Error ? error.message : 'Unknown error'; const name = error instanceof Error ? error.name : ''; return reply.status(name === 'ZodError' ? 400 : 500).send({ error: message }); }); return app; }
