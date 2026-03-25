import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all users
    const { data: users, error: usersError } = await supabase.from("users").select("*");
    if (usersError) throw usersError;

    const results = [];

    for (const user of users || []) {
      // Simulate data collection (in production, integrate real scraping services)
      const lpgStatus = generateLpgData(user.pincode);
      const stockStatus = generateStockData();
      const priceData = generatePriceData();

      // Get previous log to compare
      const { data: prevLogs } = await supabase
        .from("monitoring_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const prevLog = prevLogs?.[0];

      // Call AI to analyze changes and generate insights
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a crisis monitoring AI agent. Analyze supply data and generate actionable insights. 
              Be concise and practical. Only flag important changes. 
              Output JSON with: { shouldAlert: boolean, urgency: "low"|"medium"|"high", summary: string, recommendations: string[] }
              Set shouldAlert=true ONLY if there are significant changes worth notifying the user about.`,
            },
            {
              role: "user",
              content: `User PIN: ${user.pincode || "Unknown"}
              
Current data:
LPG: ${JSON.stringify(lpgStatus)}
Stock: ${JSON.stringify(stockStatus)}
Prices: ${JSON.stringify(priceData)}

Previous data: ${prevLog ? JSON.stringify({ lpg: prevLog.lpg_status, stock: prevLog.stock_status, price: prevLog.price_data }) : "No previous data (first scan)"}

Analyze changes and determine if the user should be alerted.`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "analyze_crisis",
                description: "Return analysis of crisis data",
                parameters: {
                  type: "object",
                  properties: {
                    shouldAlert: { type: "boolean" },
                    urgency: { type: "string", enum: ["low", "medium", "high"] },
                    summary: { type: "string" },
                    recommendations: { type: "array", items: { type: "string" } },
                  },
                  required: ["shouldAlert", "urgency", "summary", "recommendations"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "analyze_crisis" } },
        }),
      });

      if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error(`AI gateway error for user ${user.id}:`, aiResponse.status, errText);
        
        if (aiResponse.status === 429) {
          results.push({ userId: user.id, status: "rate_limited" });
          continue;
        }
        if (aiResponse.status === 402) {
          results.push({ userId: user.id, status: "payment_required" });
          continue;
        }
        results.push({ userId: user.id, status: "ai_error" });
        continue;
      }

      const aiData = await aiResponse.json();
      let insights = { shouldAlert: false, urgency: "low", summary: "No significant changes", recommendations: [] };

      try {
        const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          insights = JSON.parse(toolCall.function.arguments);
        }
      } catch (e) {
        console.error("Failed to parse AI response:", e);
      }

      // Store monitoring log
      await supabase.from("monitoring_logs").insert({
        user_id: user.id,
        lpg_status: lpgStatus,
        stock_status: stockStatus,
        price_data: priceData,
        ai_insights: insights,
      });

      // Send alert if needed
      if (insights.shouldAlert) {
        const alertMessage = `${insights.summary}\n\nRecommendations:\n${insights.recommendations.map((r: string) => `• ${r}`).join("\n")}`;

        await supabase.from("alerts").insert({
          user_id: user.id,
          type: insights.urgency === "high" ? "price" : "stock",
          message: alertMessage,
        });
      }

      results.push({ userId: user.id, status: "processed", alerted: insights.shouldAlert });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Agent error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Simulated data generators (replace with real scraping services in production)
function generateLpgData(pincode: string | null) {
  const statuses = ["available", "low", "out_of_stock"];
  return {
    dealers: [
      { name: `HP Gas Agency - ${pincode || "Local"}`, status: statuses[Math.floor(Math.random() * 3)], queue: `~${Math.floor(Math.random() * 60)} min` },
      { name: "Bharat Gas - Main Road", status: statuses[Math.floor(Math.random() * 3)], queue: `~${Math.floor(Math.random() * 60)} min` },
      { name: "Indane Gas Centre", status: statuses[Math.floor(Math.random() * 3)], queue: `~${Math.floor(Math.random() * 60)} min` },
    ],
  };
}

function generateStockData() {
  return {
    platforms: [
      { name: "Blinkit", items: [{ name: "Induction Stove (Prestige)", inStock: Math.random() > 0.3, price: `₹${2200 + Math.floor(Math.random() * 500)}`, eta: "10 min" }] },
      { name: "Zepto", items: [{ name: "Induction Stove (Pigeon)", inStock: Math.random() > 0.5, price: `₹${1700 + Math.floor(Math.random() * 400)}`, eta: "15 min" }] },
      { name: "Amazon", items: [{ name: "Induction Cooktop (Philips)", inStock: Math.random() > 0.2, price: `₹${2800 + Math.floor(Math.random() * 500)}`, eta: "2 days" }] },
    ],
  };
}

function generatePriceData() {
  const lpgBase = 860;
  const lpgCurrent = lpgBase + Math.floor(Math.random() * 100 - 20);
  const stoveBase = 2499;
  const stoveCurrent = stoveBase + Math.floor(Math.random() * 400 - 300);
  const riceBase = 340;
  const riceCurrent = riceBase + Math.floor(Math.random() * 40 - 10);

  return {
    items: [
      { name: "LPG Cylinder (14.2kg)", current: lpgCurrent, baseline: lpgBase, change: +((lpgCurrent - lpgBase) / lpgBase * 100).toFixed(1), label: lpgCurrent > lpgBase * 1.05 ? "spike" : lpgCurrent < lpgBase * 0.95 ? "deal" : "normal" },
      { name: "Induction Stove (Avg)", current: stoveCurrent, baseline: stoveBase, change: +((stoveCurrent - stoveBase) / stoveBase * 100).toFixed(1), label: stoveCurrent < stoveBase * 0.9 ? "deal" : stoveCurrent > stoveBase * 1.2 ? "spike" : "normal" },
      { name: "Rice (5kg)", current: riceCurrent, baseline: riceBase, change: +((riceCurrent - riceBase) / riceBase * 100).toFixed(1), label: riceCurrent > riceBase * 1.15 ? "spike" : "normal" },
    ],
  };
}
