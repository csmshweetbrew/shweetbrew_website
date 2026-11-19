/*
 * LOGIN POPUP: "email first", one question per step, kept minimal.
 *
 *   email      "Log in or sign up": email, Continue; or Google / Facebook
 *   password   the email has an account → "Welcome back": password, Log in
 *              (+ "Email me a code" · "Forgot password?")
 *   create     no account yet → "Create a password"
 *   name       → "What's your name?" (first + last), then the code is emailed
 *   code       the 6-digit code: confirms a sign-up, or logs in without a password
 *   forgot     send a reset link → inbox ("Check your email")
 *   reset      back from the reset email: choose a new password
 *   done       "You're in, Dana", then the popup closes itself
 *
 * Motion (adapted from the neighbour-s login): steps fade up into place while the
 * panel eases to its new height; a progress bar runs through a new customer's
 * steps; the button draws in to a spinner and turns into a green check; the code
 * boxes ripple while checking and turn green in a wave; errors shake the field.
 * Hebrew is right-to-left; email, password and code stay left-to-right.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, Eye, EyeOff, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { getSupabase } from "@/lib/supabase";
import { lockPageScroll } from "@/lib/smoothScroll";
import EmailCodeInput from "./EmailCodeInput";
import {
  AuthProblem,
  CODE_LENGTH,
  EMAIL_PATTERN,
  MIN_PASSWORD,
  emailHasAccount,
  enabledProviders,
  passwordScore,
  problemText,
  resendSignupCode,
  returnUrl,
  sendEmailCode,
  toProblem,
  verifyEmailCode,
  type SocialProvider,
} from "@/lib/auth";

export type AuthStep = "email" | "password" | "create" | "name" | "code" | "inbox" | "forgot" | "reset" | "done";

const SUCCESS_MS = 450; // the button shows its check this long before the next step
const CODE_SUCCESS_MS = 850; // the code boxes' green wave + check get a little longer
const DONE_CLOSE_MS = 1300; // "You're in" stays this long, then the popup closes
const RESEND_SECONDS = 30;

/** Progress through a new customer's way in; 0 hides the bar (a normal login) */
const PROGRESS: Partial<Record<AuthStep, number>> = { email: 20, create: 40, name: 60, code: 80, done: 100 };

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.23 2.68.23v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12Z" />
  </svg>
);

export default function AuthModal({ open, initialStep, onClose }: { open: boolean; initialStep: AuthStep; onClose: () => void }) {
  const { language } = useLanguage();
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);

  const [step, setStep] = useState<AuthStep>(initialStep);
  const [email, setEmail] = useState("");
  const [typedEmail, setTypedEmail] = useState("");
  const [password, setPassword] = useState(""); // login / reset
  const [newPassword, setNewPassword] = useState(""); // sign-up: kept while moving between its steps
  const [showPassword, setShowPassword] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [name, setName] = useState(""); // for "You're in, Dana"
  const [code, setCode] = useState("");
  const [codeFor, setCodeFor] = useState<"signup" | "login">("signup");
  const [doneFor, setDoneFor] = useState<"login" | "reset">("login");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<Record<SocialProvider, boolean>>({ google: false, facebook: false });
  const [cooldown, setCooldown] = useState(0);
  const [isNew, setIsNew] = useState(false); // on the sign-up path: shows the progress bar
  const [shaking, setShaking] = useState(false);
  const [bump, setBump] = useState(false);
  const lastProgress = useRef(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  /* ---------- open / close ---------- */
  useEffect(() => {
    if (!open) return;
    setStep(initialStep);
    setIsNew(false);
    lastProgress.current = 0;
    setName("");
    setCode("");
    setError("");
    setPassword("");
    setNewPassword("");
    setShowPassword(false);
    setBusy(false);
    setSuccess(false);
    void enabledProviders().then(setProviders);
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [open, initialStep]);

  useEffect(() => {
    lockPageScroll(open);
    return () => lockPageScroll(false);
  }, [open]);

  const close = useCallback(() => {
    if (!busy) onClose();
  }, [busy, onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  /* ---------- the panel eases to each step's height ---------- */
  useLayoutEffect(() => {
    const vp = viewportRef.current;
    const inner = innerRef.current;
    if (!open || !vp || !inner) return;
    const fit = () => (vp.style.height = `${inner.offsetHeight}px`);
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [open]);

  // Each step starts on its first field
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      // (skips the hidden username field that's only there for password managers)
      innerRef.current?.querySelector<HTMLElement>("input:not([type=hidden]):not([hidden]), [data-autofocus]")?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [open, step]);

  // An error shakes the field it's about (once per error)
  useEffect(() => {
    if (!error) return;
    setShaking(true);
    const t = window.setTimeout(() => setShaking(false), 420);
    return () => clearTimeout(t);
  }, [error]);

  // Each step forward flashes the bar's edge as it springs longer
  const progress = step === "email" || isNew ? PROGRESS[step] ?? 0 : 0;
  useEffect(() => {
    if (!open) return;
    if (progress > lastProgress.current && lastProgress.current > 0) {
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 800);
      lastProgress.current = progress;
      return () => clearTimeout(t);
    }
    if (progress) lastProgress.current = progress;
  }, [open, progress]);

  // "Send a new code" waits 30s between sends
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const go = (next: AuthStep) => {
    setError("");
    setCode("");
    setPassword("");
    setShowPassword(false);
    setStep(next);
  };

  /** Busy button while `action` runs; any failure lands in the step's error line. */
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(problemText(toProblem(err).kind, he));
    } finally {
      setBusy(false);
    }
  };

  /** The button (or the code boxes) show their check for a moment, then `next` runs. */
  const succeed = (next: () => void) => {
    setSuccess(true);
    later(() => {
      setSuccess(false);
      next();
    }, reducedMotion() ? 0 : step === "code" ? CODE_SUCCESS_MS : SUCCESS_MS);
  };

  const finishSignedIn = (displayName: string, kind: "login" | "reset" = "login") =>
    succeed(() => {
      setName(displayName);
      setDoneFor(kind);
      go("done");
      later(onClose, DONE_CLOSE_MS);
    });

  const supabase = async () => {
    const sb = await getSupabase();
    if (!sb) throw new AuthProblem("unavailable");
    return sb;
  };

  /* ---------- steps ---------- */

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const value = typedEmail.trim();
    if (!EMAIL_PATTERN.test(value)) return setError(problemText("email_invalid", he));
    void run(async () => {
      const exists = await emailHasAccount(value);
      setEmail(value);
      setIsNew(!exists);
      go(exists ? "password" : "create");
    });
  };

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return setError(L("Enter your password.", "הזינו סיסמה."));
    void run(async () => {
      const sb = await supabase();
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        // Signed up but never confirmed the address: a fresh code goes out
        if (error.code === "email_not_confirmed") {
          await resendSignupCode(email);
          setCodeFor("signup");
          setCooldown(RESEND_SECONDS);
          go("code");
          return;
        }
        throw error;
      }
      const meta = data.user?.user_metadata ?? {};
      finishSignedIn(String(meta.first_name || String(meta.full_name || "").split(" ")[0] || ""));
    });
  };

  // Sign-up, step 1 of 2: the password (checked here, sent with the name)
  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD) return setError(L(`Use at least ${MIN_PASSWORD} characters.`, `לפחות ${MIN_PASSWORD} תווים.`));
    succeed(() => go("name"));
  };

  // Sign-up, step 2 of 2: the name, then the account is created and the code emailed
  const submitName = (e: React.FormEvent) => {
    e.preventDefault();
    const f = first.trim();
    const l = last.trim();
    if (!f || !l) return setError(L("Add your first and last name.", "הוסיפו שם פרטי ושם משפחה."));
    void run(async () => {
      const sb = await supabase();
      const { data, error } = await sb.auth.signUp({
        email,
        password: newPassword,
        options: {
          emailRedirectTo: returnUrl(),
          data: { first_name: f, last_name: l, full_name: `${f} ${l}`, language },
        },
      });
      if (error) throw error;
      // Supabase hides "already registered" behind an empty identity list
      if (data.user && data.user.identities?.length === 0) throw new AuthProblem("email_taken");
      if (data.session) return finishSignedIn(f);
      setName(f);
      setCodeFor("signup");
      setCooldown(RESEND_SECONDS);
      succeed(() => go("code"));
    });
  };

  /** "Email me a code": no password needed (also how checkout guests log back in). */
  const emailMeCode = () =>
    void run(async () => {
      setIsNew(false);
      await sendEmailCode(email, { createUser: false, language });
      setCodeFor("login");
      setCooldown(RESEND_SECONDS);
      go("code");
    });

  const submitCode = (value: string) => {
    if (value.length !== CODE_LENGTH) return setError(L(`Enter the ${CODE_LENGTH}-digit code.`, `הזינו את הקוד בן ${CODE_LENGTH} הספרות.`));
    void run(async () => {
      try {
        const u = await verifyEmailCode(email, value, codeFor);
        const meta = u?.user_metadata ?? {};
        // `name` is only trusted for the sign-up it was typed in, never carried over from an earlier one
        let firstName = String(meta.first_name || String(meta.full_name || "").split(" ")[0] || (codeFor === "signup" ? name : "") || "");
        // Password-free (checkout) accounts keep their name on the profile, saved with their first order
        if (!firstName && u) {
          const sb = await supabase();
          const { data } = await sb.from("profiles").select("full_name").eq("id", u.id).maybeSingle();
          firstName = String(data?.full_name || "").trim().split(/\s+/)[0] || "";
        }
        finishSignedIn(firstName);
      } catch (err) {
        setCode("");
        throw err;
      }
    });
  };

  const resendCode = () => {
    if (cooldown > 0 || busy) return;
    void run(async () => {
      if (codeFor === "signup") await resendSignupCode(email);
      else await sendEmailCode(email, { createUser: false, language });
      setCooldown(RESEND_SECONDS);
    });
  };

  const submitForgot = (e: React.FormEvent) => {
    e.preventDefault();
    const value = (typedEmail || email).trim();
    if (!EMAIL_PATTERN.test(value)) return setError(problemText("email_invalid", he));
    void run(async () => {
      const sb = await supabase();
      const { error } = await sb.auth.resetPasswordForEmail(value, { redirectTo: returnUrl() });
      if (error) throw error;
      setEmail(value);
      setCooldown(RESEND_SECONDS);
      succeed(() => go("inbox"));
    });
  };

  const resendReset = () => {
    if (cooldown > 0 || busy) return;
    void run(async () => {
      const sb = await supabase();
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: returnUrl() });
      if (error) throw error;
      setCooldown(RESEND_SECONDS);
    });
  };

  const submitReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setError(L(`Use at least ${MIN_PASSWORD} characters.`, `לפחות ${MIN_PASSWORD} תווים.`));
    void run(async () => {
      const sb = await supabase();
      const { data, error } = await sb.auth.updateUser({ password });
      if (error) throw error;
      const meta = data.user?.user_metadata ?? {};
      finishSignedIn(String(meta.first_name || ""), "reset");
    });
  };

  /** Google / Facebook: real login once switched on in Supabase, a "coming soon" note until then. */
  const continueWith = (provider: SocialProvider) => {
    const label = provider === "google" ? "Google" : "Facebook";
    if (!providers[provider]) {
      toast(L(`Logging in with ${label} is coming soon.`, `התחברות עם ${label} תגיע בקרוב.`));
      return;
    }
    void run(async () => {
      const sb = await supabase();
      const { error } = await sb.auth.signInWithOAuth({ provider, options: { redirectTo: returnUrl() } });
      if (error) throw error;
      // the browser now leaves for the provider; keep the button busy until it does
      await new Promise(() => {});
    });
  };

  if (!open) return null;

  /* ---------- pieces ---------- */

  const errorLine = error ? (
    <p className="auth-error" role="alert">
      {error}
    </p>
  ) : null;

  const submitButton = (label: string) => (
    <button type="submit" className={`auth-primary ${busy ? "is-busy" : ""} ${success ? "is-done" : ""}`} disabled={busy || success} aria-busy={busy}>
      <span className="auth-primary-label">{label}</span>
      {busy && <Loader2 className="auth-primary-icon animate-spin" aria-hidden="true" />}
      {success && <Check className="auth-primary-icon" strokeWidth={3} aria-hidden="true" />}
    </button>
  );

  const head = (title: string, back?: AuthStep) => (
    <div className="auth-head">
      {back && (
        <button type="button" className="auth-back" onClick={() => go(back)} aria-label={L("Back", "חזרה")}>
          <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
      )}
      <h2 className="auth-title" id="auth-title">
        {title}
      </h2>
    </div>
  );

  // The address being used, with a way to change it
  const emailChip = (
    <p className="auth-chip">
      <span dir="ltr">{email}</span>
      <button type="button" className="auth-link" onClick={() => go("email")}>
        {L("Change", "שינוי")}
      </button>
    </p>
  );

  // A field with its label for screen readers only; the placeholder says what goes in
  const field = (id: string, label: string, input: React.ReactNode) => (
    <div className="auth-field">
      <label htmlFor={id} className="sr-only">{label}</label>
      {input}
    </div>
  );

  const passwordField = (
    value: string,
    onChange: (v: string) => void,
    autoComplete: "current-password" | "new-password",
    placeholder: string,
    withStrength = false
  ) => (
    <div className="auth-field">
      <label htmlFor="auth-password" className="sr-only">{L("Password", "סיסמה")}</label>
      <div className="auth-password">
        <input
          id="auth-password"
          type={showPassword ? "text" : "password"}
          autoComplete={autoComplete}
          dir="ltr"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          maxLength={128}
        />
        <button
          type="button"
          className="auth-eye"
          onClick={() => setShowPassword((s) => !s)}
          aria-label={showPassword ? L("Hide password", "הסתרת סיסמה") : L("Show password", "הצגת סיסמה")}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {withStrength && (
        <div className="auth-strength" data-score={passwordScore(value)} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );

  /* ---------- steps ---------- */

  let body: React.ReactNode;
  if (step === "email") {
    body = (
      <>
        {head(L("Log in or sign up", "התחברות או הרשמה"))}
        <form className="auth-form" onSubmit={submitEmail} noValidate>
          {field(
            "auth-email",
            L("Email", "אימייל"),
            <input
              id="auth-email"
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
              dir="ltr"
              placeholder={L("Email", "אימייל")}
              value={typedEmail}
              onChange={(e) => setTypedEmail(e.target.value)}
              aria-invalid={error ? true : undefined}
            />
          )}
          {errorLine}
          {submitButton(L("Continue", "המשך"))}
        </form>
        <div className="auth-or" role="separator">
          <span>{L("or", "או")}</span>
        </div>
        <div className="auth-socials">
          <button type="button" className="auth-social" onClick={() => continueWith("google")} disabled={busy}>
            <GoogleIcon />
            <span>{L("Continue with Google", "המשך עם Google")}</span>
          </button>
          <button type="button" className="auth-social" onClick={() => continueWith("facebook")} disabled={busy}>
            <FacebookIcon />
            <span>{L("Continue with Facebook", "המשך עם Facebook")}</span>
          </button>
        </div>
      </>
    );
  } else if (step === "password") {
    body = (
      <>
        {head(L("Welcome back", "ברוכים השבים"), "email")}
        {emailChip}
        <form className="auth-form" onSubmit={submitPassword} noValidate>
          <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
          {passwordField(password, setPassword, "current-password", L("Password", "סיסמה"))}
          {errorLine}
          {submitButton(L("Log in", "התחברות"))}
        </form>
        <p className="auth-links">
          <button type="button" className="auth-link" onClick={emailMeCode} disabled={busy}>
            {L("Email me a code", "שלחו לי קוד")}
          </button>
          <span aria-hidden="true">·</span>
          <button type="button" className="auth-link" onClick={() => { setTypedEmail(email); go("forgot"); }}>
            {L("Forgot password?", "שכחתם סיסמה?")}
          </button>
        </p>
      </>
    );
  } else if (step === "create") {
    body = (
      <>
        {head(L("Create a password", "בחרו סיסמה"), "email")}
        {emailChip}
        <form className="auth-form" onSubmit={submitCreate} noValidate>
          <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
          {passwordField(newPassword, setNewPassword, "new-password", L(`At least ${MIN_PASSWORD} characters`, `לפחות ${MIN_PASSWORD} תווים`), true)}
          {errorLine}
          {submitButton(L("Continue", "המשך"))}
        </form>
      </>
    );
  } else if (step === "name") {
    body = (
      <>
        {head(L("What's your name?", "איך קוראים לכם?"), "create")}
        <form className="auth-form" onSubmit={submitName} noValidate>
          <div className="auth-names">
            {field(
              "auth-first",
              L("First name", "שם פרטי"),
              <input id="auth-first" autoComplete="given-name" maxLength={60} placeholder={L("First name", "שם פרטי")} value={first} onChange={(e) => setFirst(e.target.value)} aria-invalid={error && !first.trim() ? true : undefined} />
            )}
            {field(
              "auth-last",
              L("Last name", "שם משפחה"),
              <input id="auth-last" autoComplete="family-name" maxLength={60} placeholder={L("Last name", "שם משפחה")} value={last} onChange={(e) => setLast(e.target.value)} aria-invalid={error && !last.trim() ? true : undefined} />
            )}
          </div>
          {errorLine}
          {submitButton(L("Agree and continue", "מסכימים וממשיכים"))}
          <p className="auth-agree">{L("You confirm you're 18 or older.", "אתם מאשרים שאתם בני 18 ומעלה.")}</p>
        </form>
      </>
    );
  } else if (step === "code") {
    body = (
      <>
        {head(codeFor === "signup" ? L("Check your email", "בדקו את המייל") : L("Enter your code", "הזינו את הקוד"), codeFor === "signup" ? "name" : "password")}
        <p className="auth-sub">
          {L("Code sent to", "הקוד נשלח אל")} <strong dir="ltr">{email}</strong>
        </p>
        <form className="auth-form" onSubmit={(e) => { e.preventDefault(); submitCode(code); }} noValidate>
          <EmailCodeInput
            id="auth-code"
            label={L("Code", "קוד")}
            value={code}
            onChange={(v) => { setCode(v); if (error) setError(""); }}
            onComplete={submitCode}
            disabled={busy || success}
            invalid={!!error}
            busy={busy}
            done={success}
          />
          {errorLine}
          {/* no button: the 6th digit sends it (Enter works too) */}
        </form>
        <p className="auth-links">
          <button type="button" className="auth-link" onClick={resendCode} disabled={cooldown > 0 || busy}>
            {cooldown > 0 ? L(`Send a new code in ${cooldown}s`, `קוד חדש בעוד ${cooldown} שניות`) : L("Send a new code", "שליחת קוד חדש")}
          </button>
        </p>
      </>
    );
  } else if (step === "inbox") {
    body = (
      <div className="auth-centre">
        {head(L("Check your email", "בדקו את המייל"))}
        <p className="auth-sub">
          {L("Reset link sent to", "קישור לאיפוס נשלח אל")} <strong dir="ltr">{email}</strong>
        </p>
        {errorLine}
        <p className="auth-links">
          <button type="button" className="auth-link" onClick={resendReset} disabled={cooldown > 0 || busy} data-autofocus>
            {cooldown > 0 ? L(`Send again in ${cooldown}s`, `שליחה חוזרת בעוד ${cooldown} שניות`) : L("Send again", "שליחה חוזרת")}
          </button>
        </p>
      </div>
    );
  } else if (step === "forgot") {
    body = (
      <>
        {head(L("Reset your password", "איפוס סיסמה"), email ? "password" : "email")}
        <form className="auth-form" onSubmit={submitForgot} noValidate>
          {field(
            "auth-email",
            L("Email", "אימייל"),
            <input id="auth-email" type="email" autoComplete="username" inputMode="email" dir="ltr" placeholder={L("Email", "אימייל")} value={typedEmail} onChange={(e) => setTypedEmail(e.target.value)} aria-invalid={error ? true : undefined} />
          )}
          {errorLine}
          {submitButton(L("Send reset link", "שליחת קישור לאיפוס"))}
        </form>
      </>
    );
  } else if (step === "reset") {
    body = (
      <>
        {head(L("Choose a new password", "בחרו סיסמה חדשה"))}
        <form className="auth-form" onSubmit={submitReset} noValidate>
          {passwordField(password, setPassword, "new-password", L(`At least ${MIN_PASSWORD} characters`, `לפחות ${MIN_PASSWORD} תווים`), true)}
          {errorLine}
          {submitButton(L("Save password", "שמירת סיסמה"))}
        </form>
      </>
    );
  } else {
    body = (
      <div className="auth-centre auth-done" role="status">
        <svg className="auth-check" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" />
          <path d="M15 27l7 7 15-16" />
        </svg>
        <h2 className="auth-title" id="auth-title">
          {doneFor === "reset"
            ? L("Password saved", "הסיסמה נשמרה")
            : name
              ? L(`You're in, ${name}`, `התחברתם, ${name}`)
              : L("You're in", "התחברתם")}
        </h2>
      </div>
    );
  }

  return createPortal(
    <div className="auth-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="auth-panel" role="dialog" aria-modal="true" aria-labelledby="auth-title" dir={he ? "rtl" : "ltr"} data-lenis-prevent>
        <button type="button" className="auth-close" onClick={close} aria-label={L("Close", "סגירה")}>
          <X className="w-5 h-5" />
        </button>
        <div className={`auth-progress${progress ? "" : " is-hidden"}${bump ? " is-bump" : ""}${progress === 100 ? " is-complete" : ""}`} aria-hidden="true">
          <span style={{ width: `${progress || lastProgress.current || 20}%` }} />
        </div>
        <div ref={viewportRef} className="auth-viewport">
          <div ref={innerRef}>
            <section key={step} className={`auth-step${shaking ? " is-shaking" : ""}`} data-step={step}>
              {body}
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
