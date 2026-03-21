import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialName, businessType, city } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const API_KEY = LOVABLE_API_KEY || OPENROUTER_API_KEY;

    if (!API_KEY) {
      throw new Error(
        "API Key configuration missing. Set LOVABLE_API_KEY or OPENROUTER_API_KEY.",
      );
    }

    const API_URL = LOVABLE_API_KEY
      ? "https://ai.gateway.lovable.dev/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions";

    console.log(
      `Fetching suppliers for: ${materialName} in ${city} for ${businessType}`,
    );

    const prompt = `Generate a JSON array of 5 realistic suppliers for "${materialName}" for a "${businessType}" business in ${city}, India.

Each supplier should have:
- name: Realistic Indian business name
- location: Specific area/market in or near ${city}
- rating: Number between 3.5 and 5.0
- priceRange: Price range in INR (e.g., "₹500-₹2,000")
- deliveryTime: Delivery time (e.g., "2-3 days", "Same day")
- minOrder: Minimum order value in INR
- contactType: "Online", "In-person", or "Both"
- phone: Indian phone number format
- specialization: What they specialize in
- pros: Array of 3 advantages
- cons: Array of 2 disadvantages
- verified: boolean (true/false)

Return ONLY valid JSON array, no other text.`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        max_tokens: 2000,
        temperature: 0.6,
        messages: [
          {
            role: "system",
            content:
              "You are a business data API that returns realistic Indian supplier data in JSON format only.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again later.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Please add credits.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Extract JSON from response
    let suppliers;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      suppliers = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      console.error("Failed to parse suppliers:", content);
      suppliers = [];
    }

    console.log(`Generated ${suppliers.length} suppliers`);

    return new Response(JSON.stringify({ suppliers }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in get-suppliers:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
