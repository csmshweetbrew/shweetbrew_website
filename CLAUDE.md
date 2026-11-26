# CLAUDE.md

## Design system

Before building or changing any page or component, read `design-system.md` and follow it:

- Use its colors, fonts, spacing, radius, shadows and component patterns.
- Prefer the CSS tokens (`var(--accent)`, `bg-card`, `text-foreground` and so on) over new raw `oklch()` or hex values.
- Where the doc lists an unresolved inconsistency, don't pick a side yourself. Follow the user's decision if it's recorded there; otherwise ask.
- If you change the design (a new color, component style or token), update `design-system.md` in the same change.
