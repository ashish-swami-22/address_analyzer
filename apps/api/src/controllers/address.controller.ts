import type { FastifyReply, FastifyRequest } from 'fastify';
import { addressAnalyzeSchema } from '../schemas/address.schema';
import { AddressAnalysisService } from '../services/address-analysis.service';
const service = new AddressAnalysisService();
export async function analyzeAddress(request: FastifyRequest, reply: FastifyReply) { const input = addressAnalyzeSchema.parse(request.body); return reply.send(await service.analyze(input.address)); }
