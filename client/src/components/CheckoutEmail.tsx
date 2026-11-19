/*
 * CHECKOUT EMAIL: order without signing up, with a confirmed email.
 *
 * Not signed in: email → "Send code" → the 6-digit code from the email →
 * confirmed. Confirming signs the visitor in with a password-free account, so
 * every order has a real address and they can log back in later with just a
 * code to track it. A "Sign up" link offers a normal account with a password.
 *
 * Signed in: one line saying which email the order goes under.
 */

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import EmailCodeInput from "./EmailCodeInput";
import { CODE_LENGTH, EMAIL_PATTERN, problemText, sendEmailCode, toProblem, verifyEmailCode } from "@/lib/auth";

const RESEND_SECONDS = 30;

export default function CheckoutEmail({ error, idPrefix = "cart" }: { error?: string; idPrefix?: string }) {
  const { user, openAuth, enabled } = useAuth();
  const { language } = useLanguage();
  const he = language === "he";
  const L = (en: string, hebrew: string) => (he ? hebrew : en);

  const [stage, setStage] = useState<"enter" | "code">("enter");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const [cooldown, setCooldown] = useState(0);
  // The right code: the boxes turn green and a check pops before it switches to "Ordering as …"
  const [celebrating, setCelebrating] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!enabled) return null;

  if (user && !celebrating) {
    return (
      <div className="checkout-email is-confirmed">
        <span className="checkout-email-tick" aria-hidden="true"><Check className="w-3.5 h-3.5" strokeWidth={3.5} /></span>
        <span>
          {L("Ordering as", "מזמינים בתור")} <strong dir="ltr">{user.email}</strong>
        </span>
      </div>
    );
  }

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setProblem("");
    try {
      await action();
    } catch (err) {
      setProblem(problemText(toProblem(err).kind, he));
    } finally {
      setBusy(false);
    }
  };

  const send = () => {
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) return setProblem(problemText("email_invalid", he));
    void run(async () => {
      await sendEmailCode(value, { createUser: true, language });
      setEmail(value);
      setCode("");
      setStage("code");
      setCooldown(RESEND_SECONDS);
    });
  };

  const verify = (value: string) => {
    if (value.length !== CODE_LENGTH) return setProblem(L(`Enter the ${CODE_LENGTH}-digit code.`, `הזינו את הקוד בן ${CODE_LENGTH} הספרות.`));
    setCelebrating(true);
    void run(async () => {
      try {
        await verifyEmailCode(email, value);
        // Signed in now. Let the green wave play, then this turns into "Ordering as …"
        setDone(true);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.setTimeout(() => {
          setCelebrating(false);
          setDone(false);
        }, reduce ? 0 : 1100);
      } catch (err) {
        setCelebrating(false);
        setCode("");
        throw err;
      }
    });
  };

  const shown = problem || error || "";

  return (
    <fieldset className="checkout-email">
      <legend>{L("Your email", "האימייל שלכם")}</legend>

      {stage === "enter" ? (
        <>
          <div className="checkout-email-row">
            <input
              id={`${idPrefix}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              spellCheck={false}
              dir="ltr"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (problem) setProblem(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
              aria-label={L("Email", "אימייל")}
              aria-invalid={shown ? "true" : undefined}
              aria-describedby={`${idPrefix}-email-hint`}
            />
            <button type="button" className="checkout-email-send" onClick={send} disabled={busy}>
              {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : L("Send code", "שליחת קוד")}
            </button>
          </div>
          <p id={`${idPrefix}-email-hint`} className="checkout-email-hint">
            {L(
              `No account needed. We'll email you a ${CODE_LENGTH}-digit code to confirm it's you. Confirming also lets you log in later with just this email, no password, to track your order.`,
              `לא צריך חשבון. נשלח לכם קוד בן ${CODE_LENGTH} ספרות למייל כדי לוודא שזה אתם. האימות גם מאפשר לכם להתחבר אחר כך עם המייל הזה בלבד, בלי סיסמה, ולעקוב אחרי ההזמנה.`
            )}{" "}
            <button type="button" className="checkout-email-link" onClick={() => openAuth()}>
              {L("Prefer a password? Sign up", "מעדיפים סיסמה? הירשמו")}
            </button>
          </p>
        </>
      ) : (
        <>
          <p className="checkout-email-hint">
            {L(`Enter the ${CODE_LENGTH}-digit code we sent to`, `הזינו את הקוד בן ${CODE_LENGTH} הספרות שנשלח אל`)} <strong dir="ltr">{email}</strong>{" "}
            <button type="button" className="checkout-email-link" onClick={() => { setStage("enter"); setProblem(""); }}>
              {L("Change", "שינוי")}
            </button>
          </p>
          <div className="checkout-email-row">
            <EmailCodeInput
              id={`${idPrefix}-email-code`}
              label={L("Code", "קוד")}
              value={code}
              onChange={(v) => { setCode(v); if (problem) setProblem(""); }}
              onComplete={verify}
              disabled={busy}
              invalid={!!shown}
              busy={busy}
              done={done}
              compact
            />
          </div>
          <button type="button" className="checkout-email-link" onClick={() => cooldown <= 0 && send()} disabled={cooldown > 0 || busy}>
            {cooldown > 0 ? L(`Send a new code in ${cooldown}s`, `קוד חדש בעוד ${cooldown} שניות`) : L("Send a new code", "שליחת קוד חדש")}
          </button>
        </>
      )}

      {shown && <span className="cart-err" role="alert">{shown}</span>}
    </fieldset>
  );
}
