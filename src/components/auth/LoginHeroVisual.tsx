/** Sol hero — hologram araç görseli (SVG + CSS, login akışına dokunmaz) */

const scanPoints = [
  { id: "hood", cx: 210, cy: 112, delay: "0s" },
  { id: "bumper", cx: 368, cy: 152, delay: "1.2s" },
  { id: "fender", cx: 72, cy: 158, delay: "2.4s" },
  { id: "door", cx: 228, cy: 128, delay: "3.6s" },
] as const;

const orbitIcons = [
  {
    label: "Dosya",
    className: "login-hero-orbit-icon left-[6%] top-[12%] [animation-delay:0s]",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden>
        <path
          d="M6 3h5l4 4v10H6V3z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path d="M11 3v4h4M8 11h5M8 14h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Anahtar",
    className: "login-hero-orbit-icon right-[8%] top-[10%] [animation-delay:0.8s]",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden>
        <circle cx="7" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.3" />
        <path
          d="M9.5 9.5L16 16M12 13l1.5 1.5M13.5 11.5l1.5 1.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "İş emri",
    className: "login-hero-orbit-icon left-[4%] bottom-[18%] [animation-delay:1.6s]",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden>
        <rect x="5" y="3" width="10" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 7h4M8 10h4M8 13h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Finans",
    className: "login-hero-orbit-icon right-[6%] bottom-[16%] [animation-delay:2.4s]",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden>
        <path
          d="M3 15V8M7 15V5M11 15v-4M15 15V6"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Sigorta",
    className: "login-hero-orbit-icon right-[2%] top-[42%] [animation-delay:3.2s]",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden>
        <path
          d="M10 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path d="M7.5 10l2 2 3.5-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
] as const;

const CAR_BODY_PATH =
  "M55 155 Q55 130 95 118 L145 108 Q175 98 210 98 Q260 98 295 108 L345 118 Q385 128 390 148 L395 158 Q398 168 388 172 L358 175 L342 175 Q338 188 310 188 L110 188 Q82 188 78 175 L62 175 L32 172 Q22 168 25 158 Z";

export function LoginHeroVisual() {
  return (
    <div
      className="login-hero-visual relative mx-auto mb-3 w-full max-w-lg xl:max-w-xl"
      aria-hidden
    >
      <div className="login-hero-visual-glow pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_70%_60%_at_50%_55%,rgba(74,159,212,0.22),transparent_70%)]" />

      <ul className="login-hero-particles pointer-events-none absolute inset-0">
        {[
          "left-[18%] top-[22%]",
          "left-[72%] top-[28%]",
          "left-[58%] top-[68%]",
          "left-[32%] top-[74%]",
          "left-[84%] top-[52%]",
          "left-[12%] top-[48%]",
        ].map((pos, i) => (
          <li
            key={pos}
            className={`login-hero-particle absolute h-1 w-1 rounded-full bg-[#7ec8ff]/50 ${pos}`}
            style={{ animationDelay: `${i * 1.1}s` }}
          />
        ))}
      </ul>

      {orbitIcons.map((item) => (
        <div key={item.label} className={`absolute z-20 opacity-75 ${item.className}`}>
          <span
            title={item.label}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#4a9fd4]/20 bg-[#0a1830]/70 text-[#8ec5f0]/90 shadow-[0_0_10px_rgba(74,159,212,0.15)] backdrop-blur-sm"
          >
            {item.icon}
          </span>
        </div>
      ))}

      <div className="login-hero-car-float relative z-10 mx-auto w-full scale-90 px-2">
        <div className="login-hero-scan-mask relative overflow-hidden rounded-2xl">
          <div className="login-hero-scan-line pointer-events-none absolute inset-x-0 top-0 z-30 h-[2px] bg-gradient-to-r from-transparent via-[#d4eeff] to-transparent shadow-[0_0_12px_#7ec8ff,0_0_24px_#4a9fd4,0_0_40px_rgba(74,159,212,0.6)]" />
          <div className="login-hero-scan-band pointer-events-none absolute inset-x-[4%] top-0 z-20 h-14 bg-gradient-to-b from-[#7ec8ff]/35 via-[#4a9fd4]/12 to-transparent" />
          <div className="login-hero-scan-band-glow pointer-events-none absolute inset-x-[12%] top-0 z-10 h-20 bg-gradient-to-b from-[#b8e0ff]/15 to-transparent blur-sm" />

          <svg
            viewBox="0 0 420 240"
            fill="none"
            className="login-hero-car-svg h-auto w-full drop-shadow-[0_0_32px_rgba(74,159,212,0.2)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="login-car-line" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4a9fd4" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#b8e0ff" stopOpacity="1" />
                <stop offset="100%" stopColor="#4a9fd4" stopOpacity="0.55" />
              </linearGradient>
              <radialGradient id="login-car-body-inner" cx="48%" cy="42%" r="58%">
                <stop offset="0%" stopColor="#7ec8ff" stopOpacity="0.06" />
                <stop offset="55%" stopColor="#4a9fd4" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#7ec8ff" stopOpacity="0.38" />
              </radialGradient>
              <linearGradient id="login-car-edge-glow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#b8e0ff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#0F4C81" stopOpacity="0.35" />
              </linearGradient>
              <filter id="login-car-neon-blur" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <pattern id="login-blueprint-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#4a9fd4"
                  strokeOpacity="0.07"
                  strokeWidth="0.5"
                />
                <circle cx="0" cy="0" r="0.75" fill="#4a9fd4" fillOpacity="0.12" />
              </pattern>
            </defs>

            <rect width="420" height="240" fill="url(#login-blueprint-grid)" />

            <ellipse cx="210" cy="188" rx="150" ry="18" fill="#0F4C81" fillOpacity="0.12" />

            <path
              d={CAR_BODY_PATH}
              fill="url(#login-car-body-inner)"
              stroke="url(#login-car-line)"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
            <path
              className="login-hero-body-neon-edge"
              d={CAR_BODY_PATH}
              fill="none"
              stroke="url(#login-car-edge-glow)"
              strokeWidth="1.2"
              strokeLinejoin="round"
              filter="url(#login-car-neon-blur)"
              opacity="0.85"
            />
            <path
              className="login-hero-body-flash"
              d={CAR_BODY_PATH}
              fill="#7ec8ff"
              stroke="none"
            />

            <path
              d="M118 108 L158 98 L248 98 L288 108 L278 138 L142 138 Z"
              fill="#0F4C81"
              fillOpacity="0.15"
              stroke="#7ec8ff"
              strokeWidth="1.3"
              strokeLinejoin="round"
              strokeOpacity="0.75"
            />

            <path
              d="M168 98 L188 88 L232 88 L252 98"
              stroke="#7ec8ff"
              strokeWidth="1"
              strokeLinecap="round"
              strokeOpacity="0.55"
            />

            <line x1="210" y1="98" x2="210" y2="138" stroke="#4a9fd4" strokeOpacity="0.22" strokeWidth="0.75" strokeDasharray="4 4" />
            <line x1="95" y1="118" x2="345" y2="118" stroke="#4a9fd4" strokeOpacity="0.18" strokeWidth="0.75" strokeDasharray="3 5" />

            {scanPoints.map((point) => (
              <g key={point.id} className="login-hero-scan-point" style={{ animationDelay: point.delay }}>
                <circle cx={point.cx} cy={point.cy} r="10" fill="#4a9fd4" fillOpacity="0.06" />
                <circle cx={point.cx} cy={point.cy} r="4" fill="#7ec8ff" fillOpacity="0.35" />
                <circle cx={point.cx} cy={point.cy} r="1.5" fill="#b8e0ff" />
              </g>
            ))}

            <g className="login-hero-wheel" transform="translate(118 176)">
              <circle className="login-hero-wheel-glow" cx="0" cy="0" r="30" fill="#4a9fd4" fillOpacity="0.1" />
              <circle cx="0" cy="0" r="26" fill="#0a1830" fillOpacity="0.65" stroke="#4a9fd4" strokeWidth="1.5" />
              <circle
                className="login-hero-wheel-ring"
                cx="0"
                cy="0"
                r="10"
                fill="none"
                stroke="#7ec8ff"
                strokeWidth="1"
                strokeOpacity="0.55"
                strokeDasharray="4 6"
              />
              <circle cx="0" cy="0" r="14" fill="none" stroke="#7ec8ff" strokeWidth="0.75" strokeOpacity="0.45" />
              <circle cx="0" cy="0" r="3.5" fill="#b8e0ff" fillOpacity="0.85" />
            </g>

            <g className="login-hero-wheel" transform="translate(302 176)">
              <circle
                className="login-hero-wheel-glow"
                cx="0"
                cy="0"
                r="30"
                fill="#4a9fd4"
                fillOpacity="0.1"
                style={{ animationDelay: "0.6s" }}
              />
              <circle cx="0" cy="0" r="26" fill="#0a1830" fillOpacity="0.65" stroke="#4a9fd4" strokeWidth="1.5" />
              <circle
                className="login-hero-wheel-ring"
                cx="0"
                cy="0"
                r="10"
                fill="none"
                stroke="#7ec8ff"
                strokeWidth="1"
                strokeOpacity="0.55"
                strokeDasharray="4 6"
                style={{ animationDelay: "0.6s" }}
              />
              <circle cx="0" cy="0" r="14" fill="none" stroke="#7ec8ff" strokeWidth="0.75" strokeOpacity="0.45" />
              <circle cx="0" cy="0" r="3.5" fill="#b8e0ff" fillOpacity="0.85" />
            </g>

            <path
              d="M62 148 L78 142 M358 142 L374 148"
              stroke="#4a9fd4"
              strokeWidth="0.75"
              strokeOpacity="0.45"
              strokeLinecap="round"
            />
            <path
              d="M145 108 L145 98 M275 108 L275 98"
              stroke="#7ec8ff"
              strokeWidth="0.75"
              strokeOpacity="0.35"
              strokeLinecap="round"
            />

            <rect x="298" y="142" width="28" height="8" rx="2" fill="#7ec8ff" fillOpacity="0.3" stroke="#4a9fd4" strokeWidth="0.75" />
            <rect x="94" y="142" width="22" height="8" rx="2" fill="#7ec8ff" fillOpacity="0.18" stroke="#4a9fd4" strokeWidth="0.75" strokeOpacity="0.55" />

            <path
              d="M30 172 L390 172"
              stroke="#4a9fd4"
              strokeWidth="0.5"
              strokeOpacity="0.12"
              strokeDasharray="2 6"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
