# Supabase stand-in (local testing only)

Test the database and the login/checkout flows without touching the real Supabase project.
Both use **PGlite** (Postgres in WebAssembly) running the real `supabase/migrations/*.sql` + `seed.sql`.
PGlite isn't a project dependency. Install it once, in this folder only (not in the project root, which uses pnpm):

```bash
npm i --no-save --no-package-lock --prefix tools/supabase-standin @electric-sql/pglite@0.2.17
```

| File | What it does |
|---|---|
| `db-tests.mjs` | 71 checks: security rules, pricing, stock, cancel/restore, flood guard, photo uploads, the email check, the confirmed-email order gate. `node tools/supabase-standin/db-tests.mjs .` |
| `standin-server.mjs` | A fake Supabase on `http://localhost:54399`: catalogue, `place_order`, `email_has_account`, profile reads/updates, and the Auth endpoints the popup uses (password, sign-up, email codes, reset). **Every email code is `123456`.** Add `confirm` to require email confirmation like the real default: `node tools/supabase-standin/standin-server.mjs . 54399 confirm` |
| `dev-against-standin.mjs` | The site on `http://localhost:3002`, pointed at the stand-in (leaves `.env` and `:3000` alone). |
| `order-emails-local.mjs` | Runs the `order-emails` Edge Function on `http://localhost:54400` with a fake Resend: each email is saved as an HTML file in `outbox/` (git-ignored) instead of sent. Start it with `npx tsx tools/supabase-standin/order-emails-local.mjs`, and start the stand-in with `ORDER_WEBHOOK_URL=http://localhost:54400/ ORDER_WEBHOOK_SECRET=local-secret` so it calls the function after every order, like the real Database Webhook. |

Seeded test accounts: `dana@example.test` / `biltong123` (confirmed, has a saved address) and `pending@example.test` / `biltong123` (never confirmed). It has no realtime (websocket errors in the console are expected) and Google/Facebook can't complete locally.
