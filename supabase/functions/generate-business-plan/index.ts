import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { userProfile, selectedBusiness, selectedProduct } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const API_KEY = LOVABLE_API_KEY || OPENROUTER_API_KEY;

    if (!API_KEY) {
      throw new Error(
        "API Key configuration missing. Set LOVABLE_API_KEY or OPENROUTER_API_KEY.",
      );
    }

    const authHeader = req.headers.get("Authorization");
    const globalHeaders = authHeader
      ? { headers: { Authorization: authHeader } }
      : {};

    // Initialize Supabase Client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: globalHeaders },
    );

    // --- FETCH REAL DATA IF PRODUCT IS SELECTED ---
    let realDataContext = "";

    if (selectedProduct) {
      console.log("Fetching real data for product:", selectedProduct.name);

      // Helper function to check if string is a valid UUID
      const isValidUUID = (uuid: string) => {
        const regex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return regex.test(uuid);
      };

      // 1. Fetch Raw Materials for these Products
      // ONLY query if we have valid UUIDs in our product list (AI/custom products will fail the DB query)
      const allProductIds = String(selectedProduct.id).split(",");
      const validUuidProductIds = allProductIds.filter(isValidUUID);

      let productMaterials: any[] | null = null;
      let matError = null;

      if (validUuidProductIds.length > 0) {
        const result = await supabaseClient
          .from("product_materials")
          .select(
            `
              quantity_required,
              raw_materials ( id, name, unit, avg_cost_per_unit, category )
            `,
          )
          .in("product_id", validUuidProductIds);

        productMaterials = result.data;
        matError = result.error;
      } else {
        console.log(
          "No valid UUIDs found for product_materials query. Skipping DB fetch for raw materials.",
        );
      }

      if (matError) console.error("Error fetching materials:", matError);

      // 2. Fetch Suppliers for these Materials
      let relevantSuppliers = [];
      if (productMaterials && productMaterials.length > 0) {
        const materialIds = productMaterials.map((pm) => pm.raw_materials.id);

        const { data: supplierData, error: supError } = await supabaseClient
          .from("supplier_materials")
          .select(
            `
            price_offer,
            suppliers ( id, enterprise_name, district, state, contact_phone )
          `,
          )
          .in("material_id", materialIds)
          .limit(5); // Limit to top 5 matches

        if (supError) console.error("Error fetching suppliers:", supError);
        relevantSuppliers = supplierData || [];
      }

      // 3. Construct Context String for AI
      if (productMaterials && productMaterials.length > 0) {
        realDataContext = `\n\nREAL-TIME DATABASE DATA (YOU MUST USE THIS):
        
        1. REQUIRED RAW MATERIALS for ${selectedProduct.name}:
        ${productMaterials
          .map((pm) =>
            pm.raw_materials
              ? `- ${pm.raw_materials.name}: ${pm.quantity_required} ${pm.raw_materials.unit} per unit (Approx cost: ₹${pm.raw_materials.avg_cost_per_unit}/${pm.raw_materials.unit})`
              : "",
          )
          .filter(Boolean)
          .join("\n")}
        
        2. VERIFIED SUPPLIERS FOR THESE MATERIALS:
        ${
          relevantSuppliers.length > 0
            ? relevantSuppliers
                .map((s) =>
                  s.suppliers
                    ? `- ${s.suppliers.enterprise_name} (${s.suppliers.district}, ${s.suppliers.state}) - Contact: ${s.suppliers.contact_phone} ${s.price_offer ? `| Offer: ₹${s.price_offer}` : ""}`
                    : "",
                )
                .filter(Boolean)
                .join("\n")
            : "No specific suppliers found in database. Suggest general local markets."
        }
        
        INSTRUCTIONS: 
        - In the 'rawMaterials' section of the JSON, use the EXACT material names and costs listed above.
        - In the 'rawMaterials' -> 'sourceType' or 'tips', mention the specific suppliers listed above as "Verified Partner" and include their name.
        - ENSURE YOU PRIORITIZE THESE EXACT MATERIALS AND SUPPLIERS.
        `;
      }
    }

    const API_URL = LOVABLE_API_KEY
      ? "https://ai.gateway.lovable.dev/v1/chat/completions"
      : "https://openrouter.ai/api/v1/chat/completions";

    console.log("Generating business plan for:", selectedBusiness.name);

    const systemPrompt = `You are an expert business advisor specializing in small-scale businesses and startups in India.
You create detailed, practical business plans for beginners with limited budgets.

RULES:
- Provide realistic, actionable advice based on Indian market conditions
- Avoid motivational or generic content
- Use simple language for beginners
- All costs and estimates should be in Indian Rupees (₹)
- Consider the specific city/region for location advice
- Provide specific, practical tips
- Focus on low-budget, high-impact strategies`;

    const userPrompt = `Create a highly tailored business plan for the following business idea.
CRITICAL INSTRUCTION: You MUST build the ENTIRE business plan specifically around the PRODUCT FOCUS. 
If the user selected a specific product (e.g., "Custom lipsticks" or "Pani Puri"), the raw materials, workforce, location, pricing, and marketing MUST be exactly tailored to creating and selling THAT specific product, NOT just the general business category.

BUSINESS: ${selectedBusiness.name}
PRODUCT FOCUS: ${selectedProduct ? selectedProduct.name : "General"}
DESCRIPTION: ${selectedBusiness.description}
BUDGET: ₹${parseInt(userProfile.budget).toLocaleString("en-IN")}
CITY: ${userProfile.city}
INTEREST: ${userProfile.interest}
EXPERIENCE: ${userProfile.experience}
INVESTMENT RANGE: ${selectedBusiness.investmentRange}
${realDataContext}

Generate a complete business plan in the following JSON format:
{
  "rawMaterials": [
    {
      "name": "Specific Material exactly for the PRODUCT FOCUS",
      "sourceType": "Where to source (local market/wholesale/online)",
      "estimatedCost": "₹X,XXX - ₹X,XXX/month",
      "tips": "Practical sourcing tip"
    }
  ],
  "productionPlan": [
    {
      "step": "Step Title (e.g., Making Masala, Wholesale Sourcing, Store Setup)",
      "description": "Detailed instructions on HOW to make the product. IF the business does NOT manufacture products (like a Phone Store or Tech Shop), use this section to explain EXACTLY how to source the items wholesale and how to set up the retail/hardware/software environment.",
      "costVsTime": "Cost/Time tradeoff (e.g. Making yourself saves ₹XX OR Buying direct from distributor saves ₹XX)"
    }
  ],
  "workforce": [
    {
      "role": "Job Role",
      "skillLevel": "Required skill level",
      "count": 1,
      "estimatedSalary": "₹X,XXX - ₹X,XXX/month"
    }
  ],
  "location": {
    "areaType": "Type of area recommended",
    "shopSize": "Size recommendation",
    "rentEstimate": "₹X,XXX - ₹X,XXX/month",
    "setupNeeds": ["List of setup requirements"]
  },
  "pricing": {
    "costComponents": ["List of cost breakdown items with percentages"],
    "costPrice": "₹XX-XX per unit (average)",
    "marketPriceRange": "₹XX-XX per unit",
    "suggestedPrice": "₹XX-XX per unit",
    "profitMargin": "XX-XX% after all expenses"
  },
  "marketing": {
    "launchPlan": ["Week 1: ...", "Week 2: ...", "Week 3: ...", "Week 4: ..."],
    "onlineStrategies": ["Strategy 1", "Strategy 2"],
    "offlineStrategies": ["Strategy 1", "Strategy 2"],
    "lowBudgetIdeas": ["Idea 1", "Idea 2"]
  },
  "growth": {
    "month1to3": ["Action 1", "Action 2"],
    "month4to6": ["Action 1", "Action 2"],
    "expansionIdeas": ["Idea 1", "Idea 2"],
    "mistakesToAvoid": ["Mistake 1", "Mistake 2"]
  }
}

REQUIREMENTS:
- Provide at least 3 items in each array
- Make all advice specific to ${userProfile.city} and the ${userProfile.interest} sector
- Tailor complexity to ${userProfile.experience} experience level
- Keep within the budget of ₹${parseInt(userProfile.budget).toLocaleString("en-IN")}
- Return ONLY valid JSON, no additional text`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct",
        max_tokens: 3000,
        temperature: 0.6,
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

    // Extract JSON array from text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let planText = jsonMatch ? jsonMatch[0] : content;

    let plan;
    try {
      plan = JSON.parse(planText);
    } catch (parseError) {
      console.warn(
        "JSON parse failed, attempting to fix truncated JSON...",
        parseError,
      );
      // More robust fallback for Llama-3 sometimes leaving unescaped characters or truncating
      try {
        const lastValidIndex = planText.lastIndexOf("}");
        if (lastValidIndex > -1 && lastValidIndex !== planText.length - 1) {
          planText = planText.substring(0, lastValidIndex + 1);
          plan = JSON.parse(planText);
        } else {
          // Very hacky last-resort recovery.
          const roughFix = planText + "\n}\n}";
          plan = JSON.parse(roughFix);
        }
      } catch (recoveryError) {
        console.error("Failed to recover truncated JSON:", planText);
        // We will return a 400 status error so the frontend displays a clearer message instead of generic 500
        return new Response(
          JSON.stringify({
            error:
              "AI returned an incomplete or malformed business plan. Please try again.",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    // Combine the selected business idea with the generated plan
    const fullPlan = {
      idea: selectedBusiness,
      product: selectedProduct, // Add product info to the plan
      ...plan,
    };

    return new Response(JSON.stringify(fullPlan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-business-plan:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
