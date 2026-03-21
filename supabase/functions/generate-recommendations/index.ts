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
    const { userProfile } = await req.json();
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

    console.log("Generating recommendations for:", userProfile);

    const systemPrompt = `You are an expert business advisor specializing in small-scale businesses and startups in India. 
You provide practical, realistic advice for beginners with limited budgets.

RULES:
- Always give structured output with clear data
- Use practical, realistic advice based on Indian market conditions
- Avoid motivational or generic content
- Focus on small-scale, low-budget businesses
- Provide estimates and ranges, not exact numbers
- Use simple language for beginners
- Consider the user's budget, location, and interest area`;

    const userPrompt = `Based on the following user profile, recommend exactly 3 realistic business ideas that match their budget and interests.

USER PROFILE:
- Budget: ₹${parseInt(userProfile.budget).toLocaleString("en-IN")}
- City/Region: ${userProfile.city}
- Interest Area: ${userProfile.interest}
- Experience Level: ${userProfile.experience}

For each business idea, provide the following in valid JSON format:
{
  "ideas": [
    {
      "id": "unique-id-lowercase",
      "name": "Business Name",
      "description": "Brief 1-2 sentence description",
      "investmentRange": "₹X,XX,XXX - ₹X,XX,XXX",
      "expectedRevenue": "₹X,XX,XXX - ₹X,XX,XXX/month",
      "profitMargin": "XX-XX%",
      "riskLevel": "Low" | "Medium" | "High",
      "breakEvenTime": "X-X months",
      "icon": "emoji representing the business"
    }
  ]
}

IMPORTANT:
- All ideas must be within the user's budget range
- Tailor recommendations to their interest area (${userProfile.interest})
- Consider market conditions in ${userProfile.city}
- Adjust complexity based on experience level (${userProfile.experience})
- Return ONLY valid JSON, no additional text`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

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
            error: "AI credits exhausted. Please add more credits.",
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
    const content = data.choices?.[0]?.message?.content;

    console.log("AI response:", content);

    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON");
    }

    const ideas = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(ideas), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-recommendations:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
