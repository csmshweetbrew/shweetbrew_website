// Runs the site's dev server on port 3002 pointed at the local Supabase stand-in
// (standin-server.mjs on :54399). Env vars set here win over .env, so the real
// .env and any normal dev server on :3000 are left alone.
//   node tools/supabase-standin/dev-against-standin.mjs
import { fileURLToPath } from "node:url";
import path from "node:path";

process.env.VITE_SUPABASE_URL = "http://localhost:54399";
process.env.VITE_SUPABASE_PUBLISHABLE_KEY = "local-test-key";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..").replace(/\\/g, "/");
process.argv = [process.argv[0], `${root}/node_modules/vite/bin/vite.js`, "--config", `${root}/vite.config.ts`, "--port", "3002", "--strictPort"];
await import(`file:///${root}/node_modules/vite/bin/vite.js`);
