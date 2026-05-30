/** İş emri PDF / yazdırma — kurumsal marka (#0F4C81) */
export function IsEmriPrintLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id="isEmriLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a6aad" />
          <stop offset="100%" stopColor="#0F4C81" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill="url(#isEmriLogoBg)" />
      <path
        d="M 18 40 A 14 14 0 0 1 46 40"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text
        x="32"
        y="36"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Segoe UI, system-ui, sans-serif"
        fontSize="26"
        fontWeight="700"
      >
        S
      </text>
    </svg>
  );
}
