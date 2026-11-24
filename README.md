# Shweet Brew website

Bilingual (English / Hebrew) shop for Shweet Brew: South African biltong, boerewors, drywors, Holy Land Jerky, shots and sauces, delivered across Israel.

| Part | What | Where it runs |
|---|---|---|
| Website | React + Vite + Tailwind (static files) | **Netlify**, built from the `main` branch |
| Database + logins | Products, stock, orders, users, all order checks | **Supabase** |
| Payments (coming) | PayPlus payment link + confirmation | Supabase Edge Functions |

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

`.env` is git-ignored: never commit it, never paste the secret key into Netlify. PayPlus keys, when we add them, go into Supabase (Dashboard → Edge Functions → Secrets), not here.

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

The database is built from the numbered files in `supabase/migrations/` (`0001_…` to `0017_…`, more later). To apply one: Supabase Dashboard → **SQL Editor** → paste the file → **Run**. Run new files in number order, each one once.

- Never edit a file that has already been run. Changes go in a new file with the next number.
- `supabase/seed.sql` loads the starting products and delivery zones (`npx tsx scripts/generate-supabase-seed.ts` regenerates it from the site's product list). It only adds missing rows, so re-running it is safe.

### One-time Netlify setup

Netlify → your site → **Site configuration**:

1. **Build & deploy → Continuous deployment**: repository `csmshweetbrew/shweetbrew_website`, production branch **`main`**. Build settings come from `netlify.toml`.
2. **Environment variables**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (same values as your `.env`). Only these two. Then **Deploys → Trigger deploy** once so the site picks them up.
3. **Domain management**: your domain should be listed here, and its DNS should point to Netlify.

### Logins and emails

How customers get in:
- **Password:** sign up with name + password, confirm the email with a **6-digit code**.
- **Code only:** "Email me a login code instead", no password needed.
- **Ordering as a guest (the default):** no account, no code. Name + email typed twice (+ address, + phone if they want); the email gets the order confirmation (required since migration `0016`; the site suggests a fix for typos like `gamil.com`). The phone is optional since migration `0017`. You call or message every customer to confirm anyway (migration `0015`).
- **Google:** "Continue with Google", once you switch it on (below).

#### 1. Supabase basics (Authentication)

1. **URL Configuration:** Site URL = your live domain (e.g. `https://shweetbrew.co.il`). Redirect URLs: the same domain with `/**`, plus `http://localhost:3000/**` and `http://localhost:4173/**` for testing.
2. **Sign In / Providers → Email:** "Confirm email" **on**, **Email OTP Length = 6**, **Email OTP Expiration = 600** seconds (10 minutes).
3. Run migrations `0013` to `0017` in the SQL editor if you haven't (`0015` lets guests order without a code, `0016` makes their email required, `0017` makes the phone optional: redeploy the `order-emails` function before `0017`).

#### 2. Your own email sender (do this before launch)

Supabase's built-in sender is for testing only: a few emails an hour, often in spam. Use a real one. Resend is the simplest (free: 3,000 emails a month, 100 a day).

1. **Resend:** sign up at resend.com → **Domains → Add domain** → your domain (e.g. `shweetbrew.co.il`).
2. **DNS:** Resend shows 3–4 records (TXT for SPF, TXT for DKIM, MX). Add them where you bought the domain (DNS settings), then press **Verify** in Resend. It can take a few minutes to an hour.
3. **API key:** Resend → **API Keys → Create** (sending access). Copy it.
4. **Supabase → Authentication → Emails → SMTP Settings → Enable custom SMTP:**
   - Sender email: `hello@your-domain` (any address on the verified domain)
   - Sender name: `Shweet Brew`
   - Host `smtp.resend.com`, port `465`, username `resend`, password = the API key
5. **Authentication → Rate Limits:** raise "Emails sent per hour" (e.g. to 100). With custom SMTP the default is low.
6. **Emails → Templates:** paste our branded, bilingual templates from `supabase/email-templates/`:

   | Supabase template | File | Subject |
   |---|---|---|
   | Confirm signup | `confirm-signup.html` | `Your Shweet Brew code: {{ .Token }}` |
   | Magic link | `magic-link.html` | `Your Shweet Brew login code: {{ .Token }}` |
   | Reset password | `reset-password.html` | `Reset your Shweet Brew password` |

   The code templates **must** contain `{{ .Token }}` (that's the 6-digit code); Supabase's defaults only have a link.
7. **Test:** on the site, Log in → your email → "Email me a login code instead". The code should arrive within a minute, not in spam.

#### 3. Google login

1. **Google Cloud:** go to console.cloud.google.com → create a project ("Shweet Brew").
2. **Google Auth Platform → Branding:** app name `Shweet Brew`, your support email, optionally the logo. **Audience:** External. **Data access:** the default `email`, `profile`, `openid` are enough. Then **Publish app** (otherwise only listed test users can log in).
3. **Clients → Create client → Web application:**
   - Authorized JavaScript origins: `https://your-domain` and `http://localhost:3000`
   - Authorized redirect URIs: `https://<your-project-ref>.supabase.co/auth/v1/callback` (your project URL from `.env` + `/auth/v1/callback`)
4. Copy the **Client ID** and **Client secret** → Supabase → **Authentication → Sign In / Providers → Google** → enable, paste both → Save.
5. Reload the site: **Continue with Google** appears in the login popup by itself.

Google's screen will say "continue to <your-project-ref>.supabase.co" unless you add a custom domain to Supabase (a paid add-on). It works the same either way.

### Order emails

Every new website order sends two emails: **"New order SB-1001 · ₪155 · Hasharon Area"** to you (customer, phone with a WhatsApp link, area, address, note, items, total; reply goes to the customer), and an **order confirmation** to the customer in their language (order number, items, total, next delivery day; reply comes to you). It's a Supabase Edge Function, `supabase/functions/order-emails/index.ts`, started by a Database Webhook. It sends through **Resend**, so do "Your own email sender" above first (same API key, same verified domain).

1. **Secrets:** Supabase → **Edge Functions → Secrets** → add:
   - `RESEND_API_KEY` = your Resend API key
   - `OWNER_EMAIL` = where new-order alerts go (several: comma-separated)
   - `ORDER_EMAIL_FROM` = `Shweet Brew <orders@your-domain>` (any address on the domain you verified in Resend)
   - `ORDER_WEBHOOK_SECRET` = a long random password you make up (e.g. from a password generator). Keep it for step 3.
   - `SITE_URL` = your live address, e.g. `https://shweetbrew.com`
2. **Function:** **Edge Functions → Deploy a new function → Via Editor**. Name it exactly `order-emails`, delete the sample code, paste the whole of `supabase/functions/order-emails/index.ts`, **Deploy**. Then open the function → **Details** and switch **Enforce JWT verification** off (the webhook proves itself with the secret instead).
3. **Webhook:** **Database → Webhooks → Create a new hook**:
   - Name `order-emails`, table **orders**, events **Insert** only
   - Type **Supabase Edge Functions**, function **order-emails**, method POST
   - HTTP Headers → add `x-webhook-secret` = the same value as `ORDER_WEBHOOK_SECRET`
   - Create.
4. **Test:** place an order on the site with your own email. Both emails should arrive within a minute. If not: **Edge Functions → order-emails → Logs** shows the reason (wrong secret = 401; Resend refused = the Resend message).

Orders you log by hand as an admin (WhatsApp/phone) only email the customer (if it has an email), not you.

### First admin

Sign up on the site (or Supabase → Authentication → Add user), then in the SQL editor:

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
