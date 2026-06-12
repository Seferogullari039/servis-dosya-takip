import { LoginHeroVisual } from "@/components/auth/LoginHeroVisual";
import { cn } from "@/lib/utils/cn";

const features = [
  {
    title: "Akıllı Dosya Takibi",
    description: "Hasar dosyalarını plaka, sigorta ve durum bazında anlık izleyin.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M7 4h7l5 5v11a1 1 0 01-1 1H7a1 1 0 01-1-1V5a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M14 4v5h5M9 13h6M9 17h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "İş Emri Yönetimi",
    description: "Parça, işçilik ve onarım süreçlerini tek ekrandan yönetin.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="9"
          y="3"
          width="6"
          height="4"
          rx="1"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M9 12h6M9 16h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Finans & Tahsilat Kontrolü",
    description: "Tahsilat durumu, ödemeler ve finans metriklerini takip edin.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path
          d="M4 19V5M4 19h16M8 15l3-3 3 2 4-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 7h.01"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

interface LoginHeroProps {
  className?: string;
  compact?: boolean;
}

export function LoginHero({ className, compact = false }: LoginHeroProps) {
  return (
    <section
      className={cn(
        "flex flex-col justify-center px-4 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16",
        className
      )}
      aria-label="Platform tanıtımı"
    >
      <div className="mx-auto w-full max-w-xl lg:mx-0 lg:max-w-none">
        {!compact ? (
          <div className="hidden lg:block">
            <LoginHeroVisual />
          </div>
        ) : null}

        <p className="inline-flex items-center gap-2 rounded-full border border-[#4a9fd4]/25 bg-[#0F4C81]/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8ec5f0]">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#4a9fd4] shadow-[0_0_8px_#4a9fd4]"
            aria-hidden
          />
          Otomotiv Servis Platformu
        </p>

        <h2
          className={cn(
            "font-bold tracking-tight text-white",
            compact
              ? "mt-5 text-2xl leading-tight sm:text-3xl"
              : "mt-1 text-3xl leading-[1.1] sm:text-4xl xl:text-[2.65rem]"
          )}
        >
          Hasar Süreçlerinin{" "}
          {compact ? (
            <span className="bg-gradient-to-r from-[#7ec8ff] via-[#b8e0ff] to-[#4a9fd4] bg-clip-text text-transparent">
              Dijital Merkezi
            </span>
          ) : (
            <span className="login-typewriter inline-block align-bottom">
              <span className="login-typewriter-inner bg-gradient-to-r from-[#7ec8ff] via-[#b8e0ff] to-[#4a9fd4] bg-clip-text text-transparent">
                Dijital Merkezi
              </span>
              <span className="login-typewriter-cursor" aria-hidden />
            </span>
          )}
        </h2>

        <p
          className={cn(
            "max-w-lg text-sm leading-relaxed text-white/65 sm:text-base",
            compact ? "mt-3 text-sm" : "mt-2.5"
          )}
        >
          Servis dosyaları, iş emirleri, tedarik ve tahsilat süreçlerini tek
          panelden yönetin.
        </p>

        <ul
          className={cn(
            "grid gap-2",
            compact ? "mt-5" : "mt-4"
          )}
        >
          {features.map((feature) => (
            <li
              key={feature.title}
              className={cn(
                "login-feature-card group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm transition-[border-color,background-color,transform] duration-300",
                "hover:border-[#4a9fd4]/30 hover:bg-white/[0.06]",
                compact ? "p-3 sm:p-4" : "px-3 py-2.5"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#0F4C81]/40 to-[#1a6aad]/20 text-[#8ec5f0] ring-1 ring-[#4a9fd4]/20 transition-transform duration-300 group-hover:scale-105 [&_svg]:h-4 [&_svg]:w-4">
                  {feature.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="text-[0.8125rem] font-semibold leading-tight text-white sm:text-sm">
                    {feature.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-0.5 line-clamp-2 text-[11px] leading-snug text-white/55 sm:text-xs",
                      compact && "text-xs"
                    )}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
