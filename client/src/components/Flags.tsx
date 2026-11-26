/*
 * Small drawn flags and the kosher star for the hero trust row.
 * Drawn as SVG because flag emoji don't render on Windows (they show as letters).
 */

type Props = { className?: string };

export function FlagIsrael({ className }: Props) {
  return (
    <svg viewBox="0 0 30 22" className={className} aria-hidden="true">
      <rect width="30" height="22" rx="2" fill="#fff" />
      <rect y="2.5" width="30" height="3" fill="#0038b8" />
      <rect y="16.5" width="30" height="3" fill="#0038b8" />
      <g fill="none" stroke="#0038b8" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M15 6.6l3.4 5.9h-6.8z" />
        <path d="M15 15.4l-3.4-5.9h6.8z" />
      </g>
    </svg>
  );
}

export function FlagSouthAfrica({ className }: Props) {
  return (
    <svg viewBox="0 0 30 22" className={className} aria-hidden="true">
      <rect width="30" height="11" fill="#e03c31" />
      <rect y="11" width="30" height="11" fill="#001489" />
      {/* white-edged green Y */}
      <path d="M-1 -1 L13.5 11 L-1 23" fill="none" stroke="#fff" strokeWidth="6" />
      <path d="M13.5 11 H31" stroke="#fff" strokeWidth="6.5" />
      <path d="M-1 -1 L13.5 11 L-1 23" fill="none" stroke="#007749" strokeWidth="3.6" />
      <path d="M13.5 11 H31" stroke="#007749" strokeWidth="4" />
      {/* gold-edged black triangle */}
      <path d="M0 3 L9.5 11 L0 19 Z" fill="#000" stroke="#ffb612" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function FlagUSA({ className }: Props) {
  return (
    <svg viewBox="0 0 30 22" className={className} aria-hidden="true">
      <rect width="30" height="22" fill="#fff" />
      <g fill="#b22234">
        {[0, 3.4, 6.8, 10.2, 13.6, 17, 20.3].map((y) => (
          <rect key={y} y={y} width="30" height="1.7" />
        ))}
      </g>
      <rect width="13" height="11.9" fill="#3c3b6e" />
      <g fill="#fff">
        {[[2.5, 2.5], [6.5, 2.5], [10.5, 2.5], [4.5, 5.5], [8.5, 5.5], [2.5, 8.5], [6.5, 8.5], [10.5, 8.5]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.6" />
        ))}
      </g>
    </svg>
  );
}

export function KosherStar({ className }: Props) {
  return (
    <svg viewBox="0 0 26 26" className={className} aria-hidden="true">
      <g fill="none" stroke="var(--brand-gold)" strokeWidth="2.2" strokeLinejoin="round">
        <path d="M13 2.5l9.1 15.75H3.9z" />
        <path d="M13 23.5L3.9 7.75h18.2z" />
      </g>
    </svg>
  );
}
