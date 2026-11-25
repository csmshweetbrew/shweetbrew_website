# Shweet Brew website

Bilingual (English / Hebrew) shop for Shweet Brew: South African biltong, boerewors, drywors, Holy Land Jerky, shots and sauces, delivered across Israel.

| Part | What | Where it runs |
|---|---|---|
| Website | React + Vite + Tailwind (static files) | **Netlify**, built from the `main` branch |
| Database | Products, stock, orders, all order checks | **Supabase** |
| Payments | Bit / PayBox, bank transfer, or cash in Modiin, outside the site | No service needed |

There is no other hosting. GitHub Pages is switched off (see [Shutting down old deployments](#shutting-down-old-deployments)).

More detail for developers: `HANDOFF.md` (how the code fits together), `design-system.md` (the look), `PRODUCT.md` (who it's for).

---

## Run it on your computer

```bash
npx -y pnpm@10.4.1 install     # once, and after package changes
cp .env.example .env            # once, then fill in your Supabase keys
npx vite                        # http://localhost:3000
```

Restart `npx vite` after editing `.env` (it only reads it at start).

## Keys (`.env`)

| Key | Secret? | Used by |
|---|---|---|
| `VITE_SUPABASE_URL` | No | The website |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | No (safe in the browser; the database rules decide what it can do) | The website |
| `SUPABASE_SECRET_KEY` | **Yes** | Admin scripts on your computer only |
| `SUPABASE_JWKS` | No (public keys for checking logins) | Reference |

`.env` is git-ignored: never commit it, never paste the secret key into Netlify.

---

## Deploy

```bash
npm run deploy
```

The script (`scripts/deploy.sh`):
1. stops if you have uncommitted changes, so you always know what goes live;
2. type-checks and builds, exactly like Netlify will;
3. **lists any database migrations in this deploy**: run those first (below);
4. shows the commits going live and asks you to confirm;
5. pushes your branch to `main`. Netlify builds and publishes it in 1–2 minutes.

It only fast-forwards `main`; it never overwrites it. If someone else pushed to `main`, it tells you to merge first.

### Database changes (migrations)

The database is built from the numbered files in `supabase/migrations/` (`0001_…` to `0020_…`, more later). To apply one: Supabase Dashboard → **SQL Editor** → paste the file → **Run**. Run new files in number order, each one once.

- Never edit a file that has already been run. Changes go in a new file with the next number.
- `supabase/seed.sql` loads the starting products and delivery zones (`npx tsx scripts/generate-supabase-seed.ts` regenerates it from the site's product list). It only adds missing rows, so re-running it is safe.

### One-time Netlify setup

Netlify → your site → **Site configuration**:

1. **Build & deploy → Continuous deployment**: repository `csmshweetbrew/shweetbrew_website`, production branch **`main`**. Build settings come from `netlify.toml`.
2. **Environment variables**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (same values as your `.env`). Only these two. Then **Deploys → Trigger deploy** once so the site picks them up.
3. **Domain management**: your domain should be listed here, and its DNS should point to Netlify.

### No customer accounts

Customers never log in (owner, 2026-11-24). They give a name and an email typed twice (the site suggests a fix for typos like `gamil.com`), an address, and a phone if they want. Migration `0019` removes the old login check from the database. In Supabase:

1. **Authentication → Sign In / Providers:** switch **off** "Allow new users to sign up". Google/Facebook off too, if they were on.
2. Only admins have a login (for the admin app to come): add them under Authentication → Users → **Add user**.

### Your own email sender

Order emails go out through **Resend** (free: 3,000 emails a month, 100 a day).

1. **Resend:** sign up at resend.com → **Domains → Add domain** → your domain (`shweetbrew.com` is done).
2. **DNS:** Resend shows 3–4 records (TXT for SPF, TXT for DKIM, MX). Add them where your DNS is, then press **Verify** in Resend. It can take a few minutes to an hour.
3. **API key:** Resend → **API Keys → Create** (sending access). It goes into Supabase → Edge Functions → Secrets (below).

### Order emails

Every new website order sends two emails: **"New order SB-1001 · ₪155 · Hasharon Area"** to you (customer, phone with a WhatsApp link, area, address, note, items, total; reply goes to the customer), and **"We've got your order SB-1001: awaiting confirmation"** to the customer in their language, as soon as the order is placed, whether or not they press I've paid (order number, items, total, next delivery day; reply comes to you). It's a Supabase Edge Function, `supabase/functions/order-emails/index.ts`, started by a Database Webhook. It sends through **Resend**, so do "Your own email sender" above first (same API key, same verified domain).

1. **Secrets:** Supabase → **Edge Functions → Secrets** → add:
   - `RESEND_API_KEY` = your Resend API key
   - `OWNER_EMAIL` = where new-order alerts go (several: comma-separated)
   - `ORDER_EMAIL_FROM` = `Shweet Brew <orders@your-domain>` (any address on the domain you verified in Resend)
   - `ORDER_WEBHOOK_SECRET` = a long random password you make up (e.g. from a password generator). Keep it for step 3.
   - `SITE_URL` = your live address, e.g. `https://shweetbrew.com`
2. **Function:** **Edge Functions → Deploy a new function → Via Editor**. Name it exactly `order-emails`, delete the sample code, paste the whole of `supabase/functions/order-emails/index.ts`, **Deploy**. Then open the function → **Details** and switch **Enforce JWT verification** off (the webhook proves itself with the secret instead).
3. **Webhook:** **Database → Webhooks → Create a new hook**:
   - Name `order-emails`, table **orders**, events **Insert** and **Update** (Update is for "I've paid" and "Choose another way to pay"; every other change is ignored)
   - Type **Supabase Edge Functions**, function **order-emails**, method POST
   - HTTP Headers → add `x-webhook-secret` = the same value as `ORDER_WEBHOOK_SECRET`
   - Create.
4. **Test:** place an order on the site with your own email. Both emails should arrive within a minute. If not: **Edge Functions → order-emails → Logs** shows the reason (wrong secret = 401; Resend refused = the Resend message).

If a customer picks another way to pay after ordering you get **"SB-1001: now paying by Bank transfer"**. When they press **I've paid** you get **"SB-1001: customer says paid · ₪155 · Bit or PayBox"**. Nothing confirms a personal Bit or PayBox payment by itself: check the app, then mark the order paid (`update public.orders set payment_status = 'paid' where reference = 'SB-1001';` until there's an admin app).

When an order is marked paid, the customer gets **"We've got your payment for SB-1001"** with the whole order (the webhook's Update event sends it).

**Switching this on for an existing project** (needs migration `0018`): paste the new `order-emails` code and deploy, tick **Update** on the webhook, then run `0018_payment_method.sql` once. The site works before that too; the choice just isn't kept and "I've paid" and "Choose another way to pay" don't show.

The number and the PayBox link are in `client/src/lib/payMethods.ts` (the number is also in `order-emails`). If you join PayBox for business, put your personal link in `PAYBOX_LINK` there.

Orders you log by hand as an admin (WhatsApp/phone) only email the customer (if it has an email), not you.

### First admin

Supabase → Authentication → Users → Add user, then in the SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

---

## Shutting down old deployments

The site used to be published to **GitHub Pages** as well. That copy uploaded the source without building it, so it never worked properly. The workflow that published it (`.github/workflows/static.yml`) is deleted, so nothing new goes there. To take the old copy offline:

1. GitHub → the repo → **Settings → Pages** → **Unpublish site**. Or set **Source** to **None**.
2. Optional cleanup: **Settings → Environments** → delete **github-pages**.

Check Netlify for leftovers too: in the Netlify dashboard, every site except the one with your domain is old and can be deleted (**Site configuration → General → Delete site**).

Supabase: one project is all you need. Delete any spare test projects in the Supabase dashboard (**Project Settings → General → Delete project**) so they don't count against the free plan.
