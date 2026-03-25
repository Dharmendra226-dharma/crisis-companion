import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function sendViaGmailSMTP(to: string, subject: string, htmlBody: string, textBody?: string) {
  const GMAIL_USER = Deno.env.get("GMAIL_USER");
  const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) throw new Error("Gmail SMTP credentials not configured");

  const conn = await Deno.connectTls({ hostname: "smtp.gmail.com", port: 465 });
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  async function readLine(): Promise<string> {
    const buf = new Uint8Array(4096);
    const n = await conn.read(buf);
    return n ? decoder.decode(buf.subarray(0, n)) : "";
  }

  async function send(cmd: string) {
    await conn.write(encoder.encode(cmd + "\r\n"));
  }

  await readLine();
  await send("EHLO localhost");
  await readLine();

  await send("AUTH LOGIN");
  await readLine();
  await send(btoa(GMAIL_USER));
  await readLine();
  await send(btoa(GMAIL_APP_PASSWORD));
  const authResp = await readLine();
  if (!authResp.startsWith("235")) throw new Error("SMTP auth failed: " + authResp);

  await send(`MAIL FROM:<${GMAIL_USER}>`);
  await readLine();
  await send(`RCPT TO:<${to}>`);
  await readLine();
  await send("DATA");
  await readLine();

  const boundary = "----=_Part_" + crypto.randomUUID().replace(/-/g, "");
  const message = [
    `From: Crisis Companion <${GMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    textBody || "Please view this email in an HTML-compatible client.",
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    htmlBody || `<p>${textBody || subject}</p>`,
    ``,
    `--${boundary}--`,
    `.`,
  ].join("\r\n");

  await conn.write(encoder.encode(message + "\r\n"));
  await readLine();
  await send("QUIT");
  conn.close();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { to, subject, htmlBody, textBody } = await req.json();
    if (!to || !subject) throw new Error("Missing required fields: to, subject");

    await sendViaGmailSMTP(to, subject, htmlBody, textBody);

    return new Response(JSON.stringify({ success: true, message: `Email sent to ${to}` }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Email send error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
