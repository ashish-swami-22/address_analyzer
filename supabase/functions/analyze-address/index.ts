import { createClient } from 'npm:@supabase/supabase-js@2';
import { encodeDigipin } from '../../../packages/digipin/src/index.ts';

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const coordinates = { latitude: 18.5913, longitude: 73.7389 };
const parsedAddress = { country: 'India', locality: 'Hinjewadi', city: 'Pune', state: 'Maharashtra', postalCode: '411057', building: 'Sai Residency', flat: 'Flat 403', landmark: 'behind D-Mart' };

function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }); }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await request.json() as { address?: unknown };
    if (typeof body.address !== 'string' || body.address.trim().length < 3) return json({ error: 'Address must contain at least 3 characters.' }, 400);
    const address = body.address.trim();
    const normalizedAddress = 'Flat 403, Sai Residency, Hinjewadi, Pune, Maharashtra 411057, India';
    const needsMoreInformation = /landmark only|missing building|needs? more information|more information/i.test(address);
    const confirmationRequired = /misspelled locality|incorrect pin|ambiguous|mg road/i.test(address);
    const status = needsMoreInformation ? 'needs_more_information' : confirmationRequired ? 'confirmation_required' : 'resolved';
    const result = { status, originalAddress: address, normalizedAddress: needsMoreInformation ? '' : normalizedAddress, parsedAddress, completenessScore: needsMoreInformation ? 48 : confirmationRequired ? 72 : 86, locationConfidence: needsMoreInformation ? null : confirmationRequired ? 61 : 78, coordinates: needsMoreInformation ? null : coordinates, digipin: status === 'resolved' ? encodeDigipin(coordinates.latitude, coordinates.longitude) : null, issues: needsMoreInformation ? [{ severity: 'high', title: 'Address details are incomplete', description: 'A building or house identifier and a more specific locality are needed.' }] : confirmationRequired ? [{ severity: 'medium', title: 'Location needs confirmation', description: 'More than one plausible locality or PIN interpretation was found.' }] : [], recommendations: needsMoreInformation ? ['Add the building, house or flat number.', 'Include the locality, city and PIN code if available.'] : confirmationRequired ? ['Confirm that the suggested locality and map area are correct.', 'Add a nearby road, sector or landmark to improve location confidence.'] : ['Add a nearby road or sector name for more precise delivery routing.'], isMock: true as const };
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Supabase server secrets are not configured.' }, 500);
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabase.from('address_analyses').insert({ original_address: result.originalAddress, normalized_address: result.normalizedAddress, status: result.status, parsed_address: result.parsedAddress, completeness_score: result.completenessScore, location_confidence: result.locationConfidence, latitude: result.coordinates?.latitude ?? null, longitude: result.coordinates?.longitude ?? null, digipin: result.digipin, issues: result.issues, recommendations: result.recommendations });
    if (error) return json({ error: error.message }, 500);
    return json(result);
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 500); }
});
