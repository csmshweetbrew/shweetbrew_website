/*
 * The 6-digit email code: six boxes over one real input (so typing, pasting and
 * the phone's "from Mail" autofill all work). Motion adapted from the
 * neighbour-s login:
 *   - each digit drops into its box as it's typed; the next empty box carries a
 *     blinking caret and a red glow
 *   - the 6th digit submits it; while it's checked a ripple runs along the boxes
 *   - wrong: the boxes turn red and the row shakes
 *   - right: the boxes turn green in a wave and a check pops in the middle
 */

import { useEffect, useRef, useState } from "react";
import { CODE_LENGTH } from "@/lib/auth";

export default function EmailCodeInput({
  id,
  label,
  value,
  onChange,
  onComplete,
  disabled,
  invalid,
  busy,
  done,
  compact,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onComplete: (code: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  busy?: boolean;
  done?: boolean;
  /** smaller boxes (the cart drawer) */
  compact?: boolean;
}) {
  // Shake once each time it turns invalid
  const [shaking, setShaking] = useState(false);
  const wasInvalid = useRef(false);
  useEffect(() => {
    if (invalid && !wasInvalid.current) {
      setShaking(true);
      const t = window.setTimeout(() => setShaking(false), 420);
      wasInvalid.current = true;
      return () => clearTimeout(t);
    }
    if (!invalid) wasInvalid.current = false;
  }, [invalid]);

  const active = Math.min(value.length, CODE_LENGTH - 1);
  const cls = ["code-field", compact && "is-compact", busy && "is-busy", done && "is-done", shaking && "is-shaking"].filter(Boolean).join(" ");

  return (
    <div className={cls}>
      <label htmlFor={id} className="code-label">{label}</label>
      <div className="code-box">
        <input
          id={id}
          className="code-input"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={CODE_LENGTH}
          dir="ltr"
          value={value}
          readOnly={busy || done}
          disabled={disabled && !busy && !done}
          aria-invalid={invalid ? true : undefined}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
            onChange(digits);
            if (digits.length === CODE_LENGTH) onComplete(digits);
          }}
        />
        <div className="code-cells" aria-hidden="true" dir="ltr">
          {Array.from({ length: CODE_LENGTH }, (_, i) => (
            <span key={i} className={`code-cell${i < value.length ? " is-filled" : ""}${i === active ? " is-active" : ""}`} style={{ ["--i" as string]: i }}>
              {/* keyed by the digit, so only a changed box re-runs its drop-in */}
              {value[i] && <span key={`${i}-${value[i]}`} className="code-digit">{value[i]}</span>}
            </span>
          ))}
        </div>
        <span className="code-tick" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 5 5 9-10" />
          </svg>
        </span>
      </div>
    </div>
  );
}
