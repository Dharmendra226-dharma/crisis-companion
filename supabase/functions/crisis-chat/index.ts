import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { message, userId } = await req.json();
    if (!message || !userId) throw new Error("Missing message or userId");

    // Fetch recent chat history for context
    const { data: chatHistory } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(20);

    // Fetch user's latest monitoring data for context
    const { data: latestLog } = await supabase
      .from("monitoring_logs")
      .select("lpg_status, stock_status, price_data, ai_insights")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    const { data: user } = await supabase
      .from("users")
      .select("pincode, email")
      .eq("id", userId)
      .single();

    // Store user message
    await supabase.from("chat_messages").insert({
      user_id: userId,
      role: "user",
      content: message,
    });

    const contextData = latestLog?.[0]
      ? `Current monitoring data for PIN ${user?.pincode || "unknown"}:
LPG: ${JSON.stringify(latestLog[0].lpg_status)}
Stock: ${JSON.stringify(latestLog[0].stock_status)}
Prices: ${JSON.stringify(latestLog[0].price_data)}
AI Insights: ${JSON.stringify(latestLog[0].ai_insights)}`
      : "No monitoring data available yet.";

    const historyMessages = (chatHistory || []).map((m: any) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are Crisis Companion AI, a helpful assistant specialized in supply chain crises, LPG availability, essential goods pricing, and emergency preparedness in India.

You have access to the user's real-time monitoring data:
${contextData}

Guidelines:
- Be concise, practical, and actionable
- Reference the user's actual data when relevant
- Provide specific advice for their location (PIN: ${user?.pincode || "unknown"})
- Help with questions about LPG, fuel, grocery prices, stock availability
- Suggest alternatives when items are unavailable
- Warn about price gouging and suggest best times to buy
- Keep responses under 200 words unless the query needs detail`,
          },
          ...historyMessages,
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: unknown) {
    console.error("Chat error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
