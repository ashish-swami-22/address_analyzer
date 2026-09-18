export interface LlmProvider { analyzeAddress(address: string): Promise<unknown>; }
