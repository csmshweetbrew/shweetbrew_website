#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Deploy the Shweet Brew site.
#
#   npm run deploy
#
# Netlify builds and publishes the site from the `main` branch, so deploying
# means: check everything, then push your branch to `main`.
#
# 1. Stops if you have uncommitted changes (commit first, so you know what goes live).
# 2. Type-checks and builds, exactly like Netlify will.
# 3. Lists any database migrations that change with this deploy: run those in
#    the Supabase SQL editor BEFORE you confirm.
# 4. Shows what's going live and asks you to confirm.
# 5. Pushes to main (only if it's a plain fast-forward; it never overwrites).
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
TARGET="main"

say()  { printf '\n\033[1m%s\033[0m\n' "$*"; }
fail() { printf '\n\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

say "1/5  Checking your working copy"
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  git status --short --untracked-files=no
  fail "You have uncommitted changes. Commit them first, then run this again."
fi
[ -f .env ] || fail "No .env file. Copy .env.example to .env and fill in your Supabase keys."
git fetch --quiet origin "$TARGET"
if ! git merge-base --is-ancestor "origin/$TARGET" HEAD; then
  fail "origin/$TARGET has commits your branch doesn't. Pull/merge them first: git merge origin/$TARGET"
fi
AHEAD="$(git rev-list --count "origin/$TARGET..HEAD")"
[ "$AHEAD" -gt 0 ] || { say "Nothing new to deploy: $TARGET already has everything on $BRANCH."; exit 0; }
echo "✓ Clean, and $AHEAD commit(s) ahead of $TARGET"

say "2/5  Type check and production build (same as Netlify)"
npx tsc --noEmit
npx vite build --logLevel warn
node scripts/check-csp.mjs >/dev/null || fail "netlify.toml's Content-Security-Policy doesn't match the scripts in index.html: run node scripts/check-csp.mjs"
echo "✓ Build OK"

say "3/5  Database changes in this deploy"
MIGRATIONS="$(git diff --name-only --diff-filter=AM "origin/$TARGET..HEAD" -- supabase/migrations | sort)"
if [ -n "$MIGRATIONS" ]; then
  echo "These migration files are new or changed. Run them in order in the"
  echo "Supabase SQL editor (Dashboard → SQL Editor) BEFORE confirming below,"
  echo "skipping any you've already run:"
  echo "$MIGRATIONS" | sed 's/^/   • /'
else
  echo "✓ None"
fi

say "4/5  Going live"
git log --oneline "origin/$TARGET..HEAD"
printf '\nDeploy these to the live site? [y/N] '
read -r answer
[ "$answer" = "y" ] || [ "$answer" = "Y" ] || fail "Cancelled. Nothing was pushed."

say "5/5  Pushing $BRANCH → $TARGET"
git push origin "HEAD:$TARGET"
echo
echo "✓ Pushed. Netlify is building now (usually 1–2 minutes)."
echo "  Watch it: Netlify dashboard → your site → Deploys."
