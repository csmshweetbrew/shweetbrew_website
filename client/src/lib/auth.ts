/*
 * Login helpers around Supabase Auth.
 *
 * The flow is "email first" (as on Airbnb): the popup asks for an email, then
 * `emailHasAccount` decides whether the next step asks for a password or for a
 * new customer's name and password. Everything else is Supabase's own auth
 * (password sign-in, sign-up, reset link, Google) called from the browser.
 */

import { getSupabase, supabasePublic } from "./supabase";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;
/** Supabase → Authentication → Sign In / Providers → Email → "Email OTP Length" must be 6 */
export const CODE_LENGTH = 6;

/** 0–3: something typed, the 8-character minimum, then a number or symbol on top. Only the minimum is required. */
export const passwordScore = (value: string) =>
  (value ? 1 : 0) + (value.length >= MIN_PASSWORD ? 1 : 0) + (value.length >= MIN_PASSWORD && /[\d\W_]/.test(value) ? 1 : 0);

/** Where Supabase's email links (confirm address, reset password) bring people back to. */
export const returnUrl = () => `${window.location.origin}/`;

export async function emailHasAccount(email: string): Promise<boolean> {
  const sb = await getSupabase();
  if (!sb) throw new AuthProblem("unavailable");
  const { data, error } = await sb.rpc("email_has_account", { p_email: email });
  if (error) throw new AuthProblem(/TOO_MANY_TRIES/.test(error.message) ? "too_many" : /INVALID_INPUT/.test(error.message) ? "email_invalid" : "network");
  return Boolean(data);
}

/**
 * Emails a 6-digit login code. `createUser` lets a new address in too (checkout without
 * signing up): confirming the code then creates a password-free account for it.
 */
export async function sendEmailCode(email: string, opts: { createUser: boolean; language: string }) {
  const sb = await getSupabase();
  if (!sb) throw new AuthProblem("unavailable");
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: opts.createUser, emailRedirectTo: returnUrl(), data: opts.createUser ? { language: opts.language } : undefined },
  });
  if (error) throw error;
}

/** Checks the 6-digit code; on success the visitor is signed in. */
export async function verifyEmailCode(email: string, code: string, kind: "login" | "signup" = "login") {
  const sb = await getSupabase();
  if (!sb) throw new AuthProblem("unavailable");
  let { data, error } = await sb.auth.verifyOtp({ email, token: code, type: "email" });
  // Older projects issue sign-up confirmation codes under the "signup" type
  if (error && kind === "signup") ({ data, error } = await sb.auth.verifyOtp({ email, token: code, type: "signup" }));
  if (error) throw error;
  return data.user;
}

/** Sends the sign-up confirmation code again. */
export async function resendSignupCode(email: string) {
  const sb = await getSupabase();
  if (!sb) throw new AuthProblem("unavailable");
  const { error } = await sb.auth.resend({ type: "signup", email, options: { emailRedirectTo: returnUrl() } });
  if (error) throw error;
}

export type SocialProvider = "google" | "facebook";

/** Which social logins are switched on in Supabase. Both buttons always show; one that's off says "coming soon". */
export async function enabledProviders(): Promise<Record<SocialProvider, boolean>> {
  const none = { google: false, facebook: false };
  if (!supabasePublic.url) return none;
  try {
    const res = await fetch(`${supabasePublic.url}/auth/v1/settings`, { headers: { apikey: supabasePublic.key } });
    const json = await res.json();
    return { google: Boolean(json?.external?.google), facebook: Boolean(json?.external?.facebook) };
  } catch {
    return none;
  }
}

/* ---------- errors ---------- */

export type AuthProblemKind =
  | "wrong_password"
  | "not_confirmed"
  | "weak_password"
  | "email_taken"
  | "email_invalid"
  | "too_many"
  | "signup_closed"
  | "same_password"
  | "link_expired"
  | "code_wrong"
  | "email_blocked"
  | "no_account"
  | "unavailable"
  | "network";

export class AuthProblem extends Error {
  constructor(public kind: AuthProblemKind) {
    super(kind);
  }
}

/** Supabase's error codes, sorted into the handful of messages the popup knows how to say. */
export function toProblem(err: unknown): AuthProblem {
  if (err instanceof AuthProblem) return err;
  const e = err as { code?: string; status?: number; message?: string } | undefined;
  switch (e?.code) {
    case "invalid_credentials":
      return new AuthProblem("wrong_password");
    case "email_not_confirmed":
      return new AuthProblem("not_confirmed");
    case "weak_password":
      return new AuthProblem("weak_password");
    case "user_already_exists":
    case "email_exists":
      return new AuthProblem("email_taken");
    case "email_address_invalid":
      return new AuthProblem("email_invalid");
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return new AuthProblem("too_many");
    case "signup_disabled":
      return new AuthProblem("signup_closed");
    case "same_password":
      return new AuthProblem("same_password");
    case "otp_expired":
      return new AuthProblem("code_wrong");
    case "flow_state_expired":
      return new AuthProblem("link_expired");
    // Supabase's built-in test sender only emails the project's own team; real customers
    // need the custom SMTP sender set up (README → Logins and emails)
    case "email_address_not_authorized":
      return new AuthProblem("email_blocked");
    case "otp_disabled":
    case "user_not_found":
      return new AuthProblem("no_account");
  }
  if (e?.status === 429) return new AuthProblem("too_many");
  if (/not authorized/i.test(e?.message ?? "")) return new AuthProblem("email_blocked");
  return new AuthProblem("network");
}

export function problemText(kind: AuthProblemKind, he: boolean): string {
  const L = (en: string, hebrew: string) => (he ? hebrew : en);
  switch (kind) {
    case "wrong_password":
      return L("That password isn't right. Try again, or reset it below.", "הסיסמה שגויה. נסו שוב, או אפסו אותה למטה.");
    case "not_confirmed":
      return L("Confirm your email first: we've sent you a new link.", "קודם צריך לאשר את המייל: שלחנו לכם קישור חדש.");
    case "weak_password":
      return L("Pick a stronger password: at least 8 characters.", "בחרו סיסמה חזקה יותר: לפחות 8 תווים.");
    case "email_taken":
      return L("That email already has an account. Log in instead.", "למייל הזה כבר יש חשבון. התחברו במקום.");
    case "email_invalid":
      return L("Check the email address.", "בדקו את כתובת המייל.");
    case "too_many":
      return L("Too many tries. Wait a few minutes and try again.", "יותר מדי ניסיונות. חכו כמה דקות ונסו שוב.");
    case "signup_closed":
      return L("New accounts are closed right now.", "ההרשמה סגורה כרגע.");
    case "same_password":
      return L("That's your current password. Choose a new one.", "זו הסיסמה הנוכחית. בחרו סיסמה חדשה.");
    case "link_expired":
      return L("That link has expired. Ask for a new one.", "הקישור פג תוקף. בקשו קישור חדש.");
    case "code_wrong":
      return L("That code isn't right or has expired. Check the email or send a new one.", "הקוד שגוי או שפג תוקפו. בדקו את המייל או שלחו קוד חדש.");
    case "email_blocked":
      return L("We can't send emails to this address yet. Please try again later or contact us.", "עדיין לא ניתן לשלוח מייל לכתובת הזו. נסו שוב מאוחר יותר או צרו איתנו קשר.");
    case "no_account":
      return L("There's no account with that email yet.", "עדיין אין חשבון עם המייל הזה.");
    case "unavailable":
      return L("Accounts aren't available right now.", "חשבונות לא זמינים כרגע.");
    default:
      return L("Something went wrong. Check your connection and try again.", "משהו השתבש. בדקו את החיבור ונסו שוב.");
  }
}
