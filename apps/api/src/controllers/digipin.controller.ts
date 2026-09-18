import { decodeDigipin, encodeDigipin } from '@app/digipin';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { coordinateSchema, digipinSchema } from '../schemas/address.schema';
export async function encode(request: FastifyRequest, reply: FastifyReply) { const input = coordinateSchema.parse(request.body); return reply.send({ digipin: encodeDigipin(input.latitude, input.longitude) }); }
export async function decode(request: FastifyRequest, reply: FastifyReply) { const input = digipinSchema.parse(request.body); return reply.send(decodeDigipin(input.digipin)); }
