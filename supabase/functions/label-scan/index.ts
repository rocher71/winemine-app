// supabase/functions/label-scan/index.ts
//
// winemine v0.1.0 mock adapter — returns a fixed LWIN regardless of input so the
// camera/storage/lookup pipeline can be exercised end-to-end before Gemini Vision
// (v0.2.0) or on-device inference is wired in.
//
// Response shape MUST stay in sync with src/lib/label-scan/adapters/mock.ts on the RN side.
// Changing the shape requires updating both sides at once.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Verified 2026-05-19 via:
//   select lwin, display_name from public.wines
//   where status='Live' and lwin in (select lwin from public.wine_korean_names)
//   order by lwin limit 1;
// → 1000115 = Domaines Schlumberger, Gewurztraminer Grand Cru, Kessler (Alsace, France).
// Has a wine_korean_names entry so wines_localized.name_ko fallback works in both locales.
const MOCK_LWIN = "1000115";
const MOCK_CONFIDENCE = 0.92;

type LabelScanInput = {
  photo_url?: string;
  image_base64?: string;
};

type LabelScanResult = {
  lwin: string;
  confidence: number;
  candidate_lwins?: string[];
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // verify_jwt=true in config.toml makes Supabase reject calls without a valid JWT
  // (anonymous sessions count as valid). No need to re-check the header here.

  let _body: LabelScanInput = {};
  try {
    _body = await req.json();
  } catch {
    // empty / non-JSON bodies are allowed for the mock — fall through to fixed response.
  }

  const result: LabelScanResult = {
    lwin: MOCK_LWIN,
    confidence: MOCK_CONFIDENCE,
  };

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
