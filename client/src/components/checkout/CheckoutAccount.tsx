/*
 * One quiet line at the top of the checkout details (owner, 2026-11-24:
 * ordering as a guest is the default, logging in is optional).
 *
 *   Guest:      "Have an account? Log in"  (logging in fills in saved details)
 *   Signed in:  green tick + "Ordering as dana@example.com"
 */

import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CheckoutAccount() {
  const { user, openAuth, enabled } = useAuth();
  const { language } = useLanguage();
  const L = (en: string, hebrew: string) => (language === "he" ? hebrew : en);

  if (!enabled) return null;

  if (user) {
    return (
      <p className="checkout-account">
        <span className="checkout-account-tick" aria-hidden="true"><Check className="w-3.5 h-3.5" strokeWidth={3.5} /></span>
        <span>
          {L("Ordering as", "מזמינים בתור")} <strong dir="ltr">{user.email}</strong>
        </span>
      </p>
    );
  }

  return (
    <p className="checkout-account">
      {L("Have an account?", "יש לכם חשבון?")}
      <button type="button" className="checkout-account-link" onClick={() => openAuth()}>
        {L("Log in", "התחברו")}
      </button>
    </p>
  );
}
