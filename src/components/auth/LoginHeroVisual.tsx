import type { CSSProperties } from "react";

const HOLOGRAM_SRC = "/login/blueprint-car-transparent.png";

const BUBBLES = [
  { angle: 0, label: "Dosya", delay: "0s" },
  { angle: 60, label: "İş Emri", delay: "1.1s" },
  { angle: 120, label: "Sigorta", delay: "2.2s" },
  { angle: 180, label: "Grafik", delay: "3.3s" },
  { angle: 240, label: "Parça", delay: "4.4s" },
  { angle: 300, label: "Kullanıcı", delay: "5.5s" },
] as const;

const iconClass =
  "h-4 w-4 shrink-0 text-[#8ec5f0] drop-shadow-[0_0_3px_rgba(126,200,255,0.35)]";

function BubbleIcon({ label }: { label: (typeof BUBBLES)[number]["label"] }) {
  switch (label) {
    case "Dosya":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path
            d="M7 4h7l5 5v11a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path d="M14 4v5h5" stroke="currentColor" strokeWidth="1.75" />
        </svg>
      );
    case "İş Emri":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <rect
            x="9"
            y="3"
            width="6"
            height="4"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.75"
          />
        </svg>
      );
    case "Sigorta":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path
            d="M12 3l8 4v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Grafik":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path
            d="M4 19V5M4 19h16M8 15l3-3 3 2 4-5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Parça":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <path
            d="M12 2l2.4 4.8L20 8l-3.6 3.5.9 5.5L12 15.2 6.7 17l.9-5.5L4 8l5.6-1.2L12 2z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Kullanıcı":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={iconClass} aria-hidden>
          <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

/** Sol hero — blueprint araç görseli ve orbit baloncukları (login akışına dokunmaz) */
export function LoginHeroVisual() {
  return (
    <div
      className="login-hologram-stage relative mx-auto mb-1 hidden w-full max-w-[900px] lg:block"
      aria-hidden
    >
      <div className="login-hologram-car relative mt-5 w-full -translate-x-[3%] translate-y-[4%]">
        <div className="login-hologram-glow pointer-events-none absolute left-1/2 top-[50%] z-0 h-[64%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,rgba(74,159,212,0.26),rgba(26,106,173,0.09)_52%,transparent_76%)]" />

        <div className="pointer-events-none absolute left-1/2 bottom-[9%] z-[1] h-[24%] w-[70%] -translate-x-1/2">
          <div className="login-hologram-platform login-hologram-platform-outer h-full w-full rounded-[50%] border border-cyan-400/[0.07]" />
        </div>
        <div className="pointer-events-none absolute left-1/2 bottom-[12%] z-[1] h-[15%] w-[50%] -translate-x-1/2">
          <div className="login-hologram-platform login-hologram-platform-inner h-full w-full rounded-[50%] border border-blue-400/[0.05]" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
          <div className="login-hologram-ring login-hologram-ring-trace h-[78%] w-[92%] rounded-[50%] border border-cyan-400/[0.03]" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[12]">
          <div className="login-hologram-orbit-track relative h-full w-full">
            {BUBBLES.map((bubble) => (
              <span
                key={bubble.label}
                className="login-hologram-bubble-node"
                style={
                  {
                    "--orbit-angle": `${bubble.angle}deg`,
                    "--orbit-delay": bubble.delay,
                  } as CSSProperties
                }
              >
                <span className="login-hologram-bubble" title={bubble.label}>
                  <BubbleIcon label={bubble.label} />
                </span>
              </span>
            ))}
          </div>
        </div>

        <img
          src={HOLOGRAM_SRC}
          alt=""
          className="login-hologram-car-image relative z-10 mx-auto block h-auto w-full object-contain"
        />
      </div>
    </div>
  );
}
