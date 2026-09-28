import type { AddressAnalysisResult, Coordinate } from "@app/shared";
import { supabase } from "./supabase";
export async function analyzeAddress(
  address: string,
): Promise<AddressAnalysisResult> {
  if (!supabase)
    throw new Error("Supabase environment variables are not configured");

  console.info("[analyze-address] invoking Supabase Edge Function", {
    addressLength: address.trim().length,
  });
  const { data, error } = await supabase.functions.invoke("analyze-address", {
    body: { address },
  });

  if (error) {
    const functionError = error as Error & { context?: Response };
    let detail = functionError.message;

    if (functionError.context) {
      try {
        const responseBody = await functionError.context.clone().text();
        if (responseBody) detail += `: ${responseBody}`;
      } catch {
        // Keep the original SDK error when the response body is unavailable.
      }
    }

    console.error("[analyze-address] Supabase Edge Function failed", {
      message: detail,
    });
    throw new Error(detail);
  }

  console.info("[analyze-address] Supabase Edge Function succeeded");
  return data as AddressAnalysisResult;
}
