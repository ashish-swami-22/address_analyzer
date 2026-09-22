import type { AddressAnalysisResult, Coordinate } from '@app/shared';
import { supabase } from './supabase';
export async function analyzeAddress(address: string): Promise<AddressAnalysisResult> { if (!supabase) throw new Error('Supabase environment variables are not configured'); const { data, error } = await supabase.functions.invoke('analyze-address', { body: { address } }); if (error) throw error; return data as AddressAnalysisResult; }
