// Runs the order-emails Edge Function (supabase/functions/order-emails) on
// http://localhost:54400 against the stand-in (:54399), with a fake Resend
// that saves each email as an HTML file in tools/supabase-standin/outbox/
// instead of sending it. Local testing only.
//
//   npx tsx tools/supabase-standin/order-emails-local.mjs
//   ORDER_WEBHOOK_URL=http://localhost:54400/ ORDER_WEBHOOK_SECRET=local-secret \
//     node tools/supabase-standin/standin-server.mjs . 54399
import http from "node:http";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { handleRequest } from "../../supabase/functions/order-emails/index.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const outbox = path.join(here, "outbox");
mkdirSync(outbox, { recursive: true });
const PORT = 54400;

const env = {
  ORDER_WEBHOOK_SECRET: "local-secret",
  RESEND_API_KEY: "re_local_test",
  RESEND_API_URL: `http://localhost:${PORT}/resend`,
  OWNER_EMAIL: "owner@example.test",
  ORDER_EMAIL_FROM: "Shweet Brew <orders@shweetbrew.com>",
  SITE_URL: "https://shweetbrew.com",
  SUPABASE_URL: "http://localhost:54399",
  SUPABASE_SERVICE_ROLE_KEY: "local-service-key",
};

let n = 0;
http.createServer(async (req, res) => {
  let body = ""; for await (const c of req) body += c;
  if (req.url === "/resend") {
    const m = JSON.parse(body);
    const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
    const file = `${stamp}-${String(++n).padStart(2, "0")}-${m.to.join("_").replace(/[^\w.@-]/g, "")}.html`;
    const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    writeFileSync(path.join(outbox, file),
      `<!doctype html><meta charset="utf-8"><title>${esc(m.subject)}</title>` +
      `<pre style="font:13px monospace;padding:8px 12px;margin:0;background:#eee">${esc(`From: ${m.from}\nTo: ${m.to.join(", ")}\nReply-To: ${(m.reply_to || []).join(", ")}\nSubject: ${m.subject}`)}</pre>${m.html}`);
    console.log(`  email → ${m.to.join(", ")}: ${m.subject}  (outbox/${file})`);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ id: `local-${n}` }));
  }
  const r = await handleRequest(
    new Request(`http://localhost:${PORT}${req.url}`, { method: req.method, headers: req.headers, body: req.method === "POST" ? body : undefined }),
    env,
  );
  res.writeHead(r.status, { "Content-Type": "application/json" });
  res.end(await r.text());
}).listen(PORT, () => console.log(`order-emails (local) on http://localhost:${PORT}, emails saved to ${outbox}`));
