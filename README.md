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

The database is built from the numbered files in `supabase/migrations/` (`0001_…` to `0012_…`, more later). To apply one: Supabase Dashboard → **SQL Editor** → paste the file → **Run**. Run new files in number order, each one once.

- Never edit a file that has already been run. Changes go in a new file with the next number.
- `supabase/seed.sql` loads the starting products and delivery zones (`npx tsx scripts/generate-supabase-seed.ts` regenerates it from the site's product list). It only adds missing rows, so re-running it is safe.

### One-time Netlify setup

Netlify → your site → **Site configuration**:

1. **Build & deploy → Continuous deployment**: repository `csmshweetbrew/shweetbrew_website`, production branch **`main`**. Build settings come from `netlify.toml`.
2. **Environment variables**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (same values as your `.env`). Only these two. Then **Deploys → Trigger deploy** once so the site picks them up.
3. **Domain management**: your domain should be listed here, and its DNS should point to Netlify.

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
