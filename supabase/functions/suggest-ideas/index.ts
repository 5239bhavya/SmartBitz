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
    const { userIdea, budget, city, interest, experience } = await req.json();

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

    console.log(`Generating ideas for: ${userIdea || "general"} in ${city}`);

    const prompt = `You are a business consultant for Indian entrepreneurs. ${userIdea ? `The user has this idea: "${userIdea}".` : "Suggest trending business ideas."}

User Profile:
- Budget: ${budget}
- City: ${city}
- Interest: ${interest}
- Experience: ${experience}

Generate 5 business ideas as a JSON array. Each idea should have:
- id: lowercase-hyphenated-id
- name: Business name
- description: 2-3 sentences explaining the business
- investmentRange: Investment range in INR
- expectedRevenue: Monthly revenue potential in INR
- profitMargin: Profit margin percentage
- riskLevel: "Low", "Medium", or "High"
- breakEvenTime: Time to break even
- icon: Single emoji representing the business
- whyNow: Why this is a good idea right now (trending, demand, etc.)
- marketTrend: Current market trend description

${userIdea ? "Refine and expand on the user's idea, plus suggest 4 related alternatives." : "Focus on trending, low-investment ideas suitable for beginners."}

Return ONLY valid JSON array, no other text.`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You are a business consultant API that returns JSON data only. Focus on practical, actionable business ideas for the Indian market.",
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

    let ideas;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      ideas = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      console.error("Failed to parse ideas:", content);
      ideas = [];
    }

    console.log(`Generated ${ideas.length} business ideas`);

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in suggest-ideas:", error);
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
