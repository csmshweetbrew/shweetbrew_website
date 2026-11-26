// Checks that the Content-Security-Policy in netlify.toml still allows the inline scripts in the built
// index.html (it lists their SHA-256). Run after a build: node scripts/check-csp.mjs. Prints the hashes it needs.
import { readFileSync } from "node:fs"; import { createHash } from "node:crypto";
const html = readFileSync(new URL("../dist/public/index.html", import.meta.url), "utf8"), toml = readFileSync(new URL("../netlify.toml", import.meta.url), "utf8");
const need = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => `'sha256-${createHash("sha256").update(m[1]).digest("base64")}'`);
const missing = need.filter((h) => !toml.includes(h));
console.log(need.join(" "));
if (missing.length) { console.error("netlify.toml's Content-Security-Policy is missing:", missing.join(" ")); process.exit(1); }
console.log("CSP covers every inline script");
