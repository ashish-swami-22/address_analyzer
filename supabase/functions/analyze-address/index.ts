import { createClient } from "npm:@supabase/supabase-js@2";
import { encodeDigipin } from "../../../packages/digipin/src/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type NominatimAddress = {
  house_number?: string;
  building?: string;
  house_name?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  village?: string;
  town?: string;
  city?: string;
  municipality?: string;
  state?: string;
  postcode?: string;
  country?: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function first(...values: Array<string | undefined>) {
  return values.find((value) => value?.trim());
}

function parseNominatimAddress(address: NominatimAddress = {}) {
  return {
    country: address.country || "India",
    houseNumber: address.house_number,
    building: first(address.building, address.house_name),
    street: address.road,
    locality: first(address.suburb, address.neighbourhood, address.village),
    city: first(address.city, address.town, address.municipality),
    state: address.state,
    postalCode: address.postcode,
  };
}

async function geocodeAddress(
  address: string,
  referer: string | null,
): Promise<NominatimResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "3");
  url.searchParams.set("countrycodes", "in");
  const contactEmail = Deno.env.get("GEOCODER_CONTACT_EMAIL");
  if (contactEmail) url.searchParams.set("email", contactEmail);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      "User-Agent": contactEmail
        ? `IndiaAddressIntelligence/0.1 (contact: ${contactEmail})`
        : "IndiaAddressIntelligence/0.1",
      ...(referer ? { Referer: referer } : {}),
    },
  });

  if (!response.ok) {
    const providerMessage = (await response.text()).slice(0, 300);
    throw new Error(
      `Geocoding provider returned HTTP ${response.status}${providerMessage ? `: ${providerMessage}` : "."}`,
    );
  }

  return (await response.json()) as NominatimResult[];
}

Deno.serve(async (request) => {
  const requestId = crypto.randomUUID();
  console.info(`[analyze-address] ${requestId} request received`, {
    method: request.method,
    contentType: request.headers.get("content-type"),
  });

  if (request.method === "OPTIONS") {
    console.info(`[analyze-address] ${requestId} CORS preflight`);
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = (await request.json()) as { address?: unknown };
    if (typeof body.address !== "string" || body.address.trim().length < 3) {
      console.warn(`[analyze-address] ${requestId} invalid address payload`, {
        addressType: typeof body.address,
        addressLength:
          typeof body.address === "string" ? body.address.trim().length : null,
      });
      return json(
        { error: "Address must contain at least 3 characters." },
        400,
      );
    }

    const address = body.address.trim();
    console.info(`[analyze-address] ${requestId} address validated`, {
      addressLength: address.length,
    });
    console.info(`[analyze-address] ${requestId} geocoding address`);
    const matches = await geocodeAddress(
      address,
      request.headers.get("origin") || request.headers.get("referer"),
    );
    const bestMatch = matches[0];
    const hasMatch = Boolean(bestMatch);
    const hasAmbiguousMatches = matches.length > 1;
    const coordinates = bestMatch
      ? {
          latitude: Number(bestMatch.lat),
          longitude: Number(bestMatch.lon),
        }
      : null;
    const parsedAddress = parseNominatimAddress(bestMatch?.address);
    const status = !hasMatch
      ? "needs_more_information"
      : hasAmbiguousMatches
        ? "confirmation_required"
        : "resolved";
    const normalizedAddress = bestMatch?.display_name || "";
    const completenessScore = !hasMatch
      ? 35
      : Math.min(
          100,
          40 +
            [
              parsedAddress.houseNumber,
              parsedAddress.building,
              parsedAddress.street,
              parsedAddress.locality,
              parsedAddress.city,
              parsedAddress.state,
              parsedAddress.postalCode,
            ].filter(Boolean).length *
              8,
        );
    const locationConfidence = !hasMatch
      ? null
      : hasAmbiguousMatches
        ? 60
        : 80;
    const issues = !hasMatch
      ? [
          {
            severity: "high" as const,
            title: "Address could not be located",
            description:
              "No matching Indian location was returned. Add a city, locality, PIN code or nearby landmark.",
          },
        ]
      : hasAmbiguousMatches
        ? [
            {
              severity: "medium" as const,
              title: "Location needs confirmation",
              description:
                "Multiple plausible locations were returned. Confirm the displayed location before using its DIGIPIN.",
            },
          ]
        : [];
    const recommendations = !hasMatch
      ? [
          "Add the city, locality and PIN code if available.",
          "Include a nearby road, building or landmark.",
        ]
      : hasAmbiguousMatches
        ? [
            "Confirm that the displayed location is correct.",
            "Add a nearby road, sector or PIN code to narrow the result.",
          ]
        : [
            "Add a flat or house number if it was not included in the geocoded result.",
          ];

    console.info(`[analyze-address] ${requestId} geocoding completed`, {
      matchCount: matches.length,
      status,
      hasCoordinates: Boolean(coordinates),
    });

    const result = {
      status,
      originalAddress: address,
      normalizedAddress,
      parsedAddress,
      completenessScore,
      locationConfidence,
      coordinates,
      digipin:
        status === "resolved" && coordinates
          ? encodeDigipin(coordinates.latitude, coordinates.longitude)
          : null,
      issues,
      recommendations,
      geocoding: bestMatch
        ? {
            coordinate: coordinates!,
            displayName: bestMatch.display_name,
            provider: "nominatim" as const,
          }
        : undefined,
      isMock: false,
    };
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      console.error(`[analyze-address] ${requestId} server secrets missing`, {
        hasSupabaseUrl: Boolean(supabaseUrl),
        hasServiceRoleKey: Boolean(serviceRoleKey),
      });
      return json(
        { error: "Supabase server secrets are not configured." },
        500,
      );
    }

    console.info(`[analyze-address] ${requestId} inserting analysis`, {
      table: "address_analyses",
    });
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { error } = await supabase.from("address_analyses").insert({
      original_address: result.originalAddress,
      normalized_address: result.normalizedAddress,
      status: result.status,
      parsed_address: result.parsedAddress,
      completeness_score: result.completenessScore,
      location_confidence: result.locationConfidence,
      latitude: result.coordinates?.latitude ?? null,
      longitude: result.coordinates?.longitude ?? null,
      digipin: result.digipin,
      issues: result.issues,
      recommendations: result.recommendations,
    });
    if (error) {
      console.error(`[analyze-address] ${requestId} database insert failed`, {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return json({ error: error.message }, 500);
    }

    console.info(`[analyze-address] ${requestId} request completed`, {
      status: result.status,
    });
    return json(result);
  } catch (error) {
    console.error(`[analyze-address] ${requestId} request failed`, {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      500,
    );
  }
});
