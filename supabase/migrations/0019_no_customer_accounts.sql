-- ===========================================================================
-- 0019 · No customer accounts
--
-- Owner's decision (2026-11-24): customers don't need accounts. The site has
-- no login any more; every order is a guest order (0015 to 0017).
--
-- This removes the "does this email have an account?" check (0013), which the
-- login popup used and anyone could call. Profiles, roles and the admin
-- functions stay: the admin app will need an admin to log in.
--
-- Also do, in the dashboard: Authentication → Sign In / Providers → switch off
-- "Allow new users to sign up" (add admins by hand: Authentication → Users).
-- ===========================================================================

drop function if exists public.email_has_account(text);
drop table if exists public.auth_email_checks;
