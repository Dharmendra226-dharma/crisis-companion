import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GMAIL_USER = Deno.env.get("GMAIL_USER");
    const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) throw new Error("Gmail SMTP not configured");

    const { to, type } = await req.json();
    if (!to) throw new Error("Missing recipient email");

    let subject: string;
    let htmlBody: string;

    if (type === "welcome") {
      subject = "🎉 Welcome to Crisis Companion — You're All Set!";
      htmlBody = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
    <tr><td style="background:linear-gradient(135deg,#1e293b,#334155);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:26px;">⚡ Crisis Companion</h1>
      <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;">Your intelligent supply monitoring agent</p>
    </td></tr>
    <tr><td style="padding:32px;">
      <h2 style="color:#1e293b;margin:0 0 16px;">Welcome aboard! 🎉</h2>
      <p style="color:#475569;line-height:1.6;margin:0 0 20px;">
        You've successfully activated <strong>Crisis Companion Agent</strong>. Here's what happens next:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:12px 16px;background:#f0fdf4;border-radius:8px;margin-bottom:8px;">
          <strong style="color:#16a34a;">✅ Real-time Monitoring Active</strong>
          <p style="color:#475569;margin:4px 0 0;font-size:13px;">We'll scan LPG availability, stock levels & prices every 30 minutes.</p>
        </td></tr>
      </table>
      <div style="height:12px;"></div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:12px 16px;background:#eff6ff;border-radius:8px;">
          <strong style="color:#2563eb;">📊 Personalized Alerts</strong>
          <p style="color:#475569;margin:4px 0 0;font-size:13px;">You'll only receive emails when something important changes — no spam, ever.</p>
        </td></tr>
      </table>
      <div style="height:12px;"></div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:12px 16px;background:#fefce8;border-radius:8px;">
          <strong style="color:#ca8a04;">🤖 AI-Powered Insights</strong>
          <p style="color:#475569;margin:4px 0 0;font-size:13px;">Our AI analyzes trends and sends actionable recommendations tailored to your location.</p>
        </td></tr>
      </table>
      <div style="height:24px;"></div>
      <p style="color:#475569;line-height:1.6;">
        <strong>What you'll be notified about:</strong>
      </p>
      <ul style="color:#475569;line-height:1.8;padding-left:20px;">
        <li>LPG cylinder restocking near your area</li>
        <li>Price spikes or deals on essentials</li>
        <li>Induction stove availability changes</li>
        <li>Crisis-related news affecting your region</li>
      </ul>
      <p style="color:#475569;line-height:1.6;margin:20px 0;">
        You can also ask our AI assistant any crisis-related questions directly from your dashboard.
      </p>
      <p style="color:#64748b;font-size:13px;margin:24px 0 0;border-top:1px solid #e2e8f0;padding-top:16px;">
        Stay safe and stay informed.<br/>
        <strong>— Crisis Companion Team</strong>
      </p>
    </td></tr>
    <tr><td style="background:#f8fafc;padding:16px 32px;text-align:center;color:#94a3b8;font-size:11px;">
      Crisis Companion Agent · Continuous monitoring for your peace of mind
    </td></tr>
  </table>
</body></html>`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown email type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const client = new SmtpClient();
    await client.connectTLS({ hostname: "smtp.gmail.com", port: 465, username: GMAIL_USER, password: GMAIL_APP_PASSWORD });
    await client.send({ from: GMAIL_USER, to, subject, content: "Welcome to Crisis Companion!", html: htmlBody });
    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Welcome email error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
