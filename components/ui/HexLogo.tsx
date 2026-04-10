/** Inline SVG of the VentureNex hex logo mark. Accepts className for sizing. */
export default function HexLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}>
      <defs>
        <linearGradient id="vnBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="108" ry="108" fill="url(#vnBg)" />
      <polygon points="256,130 365,193 365,319 256,382 147,319 147,193" fill="none" stroke="#ffffff" strokeWidth="16" />
      <polyline points="204,110 256,80 308,110" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="356,138 408,168 408,228" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="408,284 408,344 356,374" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="308,402 256,432 204,402" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="156,374 104,344 104,284" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="104,228 104,168 156,138" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="256" cy="130" r="18" fill="#8b5cf6" />
      <circle cx="365" cy="193" r="18" fill="#8b5cf6" />
      <circle cx="365" cy="319" r="18" fill="#8b5cf6" />
      <circle cx="256" cy="382" r="18" fill="#8b5cf6" />
      <circle cx="147" cy="319" r="18" fill="#8b5cf6" />
      <circle cx="147" cy="193" r="18" fill="#8b5cf6" />
      <circle cx="256" cy="130" r="15" fill="#ffffff" />
      <circle cx="365" cy="193" r="15" fill="#ffffff" />
      <circle cx="365" cy="319" r="15" fill="#ffffff" />
      <circle cx="256" cy="382" r="15" fill="#ffffff" />
      <circle cx="147" cy="319" r="15" fill="#ffffff" />
      <circle cx="147" cy="193" r="15" fill="#ffffff" />
      <path d="M188 200 L246 318 L246 200" fill="none" stroke="#ffffff" strokeWidth="20" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M246 318 L246 200 L324 318 L324 200" fill="none" stroke="#ffffff" strokeWidth="20" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
