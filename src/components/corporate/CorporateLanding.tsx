import Link from "next/link";
import { CorporateHeader } from "@/components/corporate/CorporateHeader";
import {
  CORPORATE_CONTACT,
  CORPORATE_HERO,
  CORPORATE_PROCESS,
  CORPORATE_SERVICES,
  CORPORATE_WHY,
  CORPORATE_BRAND,
} from "@/lib/corporate-site";
import { cn } from "@/lib/utils/cn";

function SectionTitle({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={cn(center && "mx-auto max-w-2xl text-center")}>
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7eb8e8]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function CorporateLanding() {
  return (
    <div className="corporate-site relative scroll-smooth overflow-x-hidden bg-[#020610] text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(100dvh,52rem)] overflow-hidden"
        aria-hidden
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#030812] via-[#0a1830] to-[#02040a]" />
        <div className="login-grid absolute inset-0 opacity-30" />
        <div className="login-orb absolute -left-32 top-[10%] h-56 w-56 rounded-full bg-[#0F4C81]/20 blur-[80px] sm:h-64 sm:w-64 sm:blur-[100px]" />
        <div className="login-orb login-orb-delay absolute -right-20 top-[55%] h-48 w-48 rounded-full bg-[#1a6aad]/15 blur-[80px] sm:h-56 sm:w-56" />
      </div>

      <CorporateHeader />

      <main className="relative z-10">
        <section
          id="hero"
          className="relative mx-auto max-w-6xl px-4 pb-8 pt-8 sm:px-6 sm:pb-10 sm:pt-10 lg:pt-12"
        >
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-[#0F4C81]/40 bg-[#0F4C81]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#9ecae8]">
              {CORPORATE_BRAND.name}
            </p>
            <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
              {CORPORATE_HERO.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
              {CORPORATE_HERO.subtitle}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={CORPORATE_CONTACT.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#0F4C81] px-6 text-sm font-semibold text-white shadow-lg shadow-[#0F4C81]/35 transition-colors hover:bg-[#1a6aad] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a9fd4]"
              >
                {CORPORATE_CONTACT.whatsappLabel}
              </a>
              <a
                href="#iletisim"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#0F4C81]/50 bg-[#0F4C81]/15 px-6 text-sm font-semibold text-[#9ecae8] transition-colors hover:bg-[#0F4C81]/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a9fd4]"
              >
                Bize Ulaşın
              </a>
              <a
                href="#hizmetler"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a9fd4]"
              >
                Hizmetleri İncele
              </a>
            </div>
          </div>
        </section>

        <section
          id="hizmetler"
          className="scroll-mt-20 border-t border-white/[0.06] bg-[#030812]/40 py-10 sm:py-12"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle
              eyebrow="Hizmetlerimiz"
              title="Sigorta hasarından teslime kadar"
              description="Hasar süreçlerinizi tek çatı altında, kurumsal disiplinle yönetiyoruz."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CORPORATE_SERVICES.map((service) => (
                <article
                  key={service.title}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:border-[#0F4C81]/40 hover:bg-[#0F4C81]/10"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0F4C81]/25 text-[#9ecae8]">
                    <span className="text-lg" aria-hidden>
                      ◆
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {service.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="surec"
          className="scroll-mt-20 pb-6 pt-10 sm:pb-8 sm:pt-12"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle
              eyebrow="Süreç"
              title="Süreç Nasıl İşliyor?"
              description="Her adımı şeffaf biçimde planlayarak aracınızı güvenle teslim ediyoruz."
              center
            />
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {CORPORATE_PROCESS.map((item, index) => (
                <li
                  key={item.title}
                  className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5"
                >
                  <span className="text-xs font-bold uppercase tracking-widest text-[#4a9fd4]">
                    Adım {item.step}
                  </span>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {item.title}
                  </p>
                  {index < CORPORATE_PROCESS.length - 1 ? (
                    <span
                      className="absolute -right-2 top-1/2 hidden h-px w-4 bg-[#0F4C81]/50 lg:block"
                      aria-hidden
                    />
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="iletisim"
          className="scroll-mt-24 border-t border-white/[0.08] bg-[#030812]/60 pb-10 pt-16 md:scroll-mt-28 md:pt-20 md:pb-12"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionTitle
              eyebrow="İletişim"
              title="Bize Ulaşın"
              description="Randevu ve bilgi için ekibimiz hasar süreciniz hakkında sizi yönlendirmek için hazır."
              center
            />
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    İş yeri telefonu
                  </p>
                  <a
                    href={CORPORATE_CONTACT.phoneHref}
                    className="mt-1 inline-flex text-lg font-semibold text-[#9ecae8] hover:text-white"
                  >
                    {CORPORATE_CONTACT.phoneDisplay}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    WhatsApp / Cep
                  </p>
                  <a
                    href={CORPORATE_CONTACT.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex text-lg font-semibold text-[#9ecae8] hover:text-white"
                  >
                    {CORPORATE_CONTACT.mobileDisplay}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Adres
                  </p>
                  <address className="mt-2 space-y-0.5 text-sm not-italic leading-relaxed text-white/75">
                    {CORPORATE_CONTACT.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                    Çalışma saatleri
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {CORPORATE_CONTACT.workingHours.map((row) => (
                      <li
                        key={row.label}
                        className="flex justify-between gap-4 text-sm text-white/75"
                      >
                        <span className="text-white/55">{row.label}</span>
                        <span className="font-medium text-white/90">
                          {row.value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                  <a
                    href={CORPORATE_CONTACT.phoneHref}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Ara
                  </a>
                  <a
                    href={CORPORATE_CONTACT.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#0F4C81] text-sm font-semibold text-white hover:bg-[#1a6aad]"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
              <div className="flex flex-col rounded-2xl border border-dashed border-white/20 bg-[#0a1830]/50 p-4 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Konum
                </p>
                <address className="mt-2 space-y-0.5 text-sm not-italic leading-relaxed text-white/70">
                  {CORPORATE_CONTACT.addressLines.map((line) => (
                    <span key={`map-${line}`} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 sm:aspect-video">
                  <iframe
                    title="Seferoğulları Otomotiv — Google Maps"
                    src={CORPORATE_CONTACT.mapsEmbedSrc}
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="hakkimizda"
          className="scroll-mt-20 border-t border-white/[0.06] py-10 sm:py-12"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <SectionTitle
                eyebrow="Hakkımızda"
                title="Neden Seferoğulları?"
                description="Sigorta hasar süreçlerinde güven, hız ve kurumsal şeffaflık önceliğimizdir."
              />
              <ul className="space-y-2 sm:space-y-3">
                {CORPORATE_WHY.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-2.5 sm:py-3"
                  >
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0F4C81]/30 text-xs text-[#9ecae8]"
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span className="text-sm font-medium text-white/85 sm:text-base">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.08] bg-[#010408] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-xs text-white/45 sm:flex-row sm:px-6 sm:text-left">
          <p>
            © {new Date().getFullYear()} {CORPORATE_BRAND.name}. Tüm hakları
            saklıdır.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/kvkk" className="hover:text-white/70">
              KVKK
            </Link>
            <Link href="/gizlilik" className="hover:text-white/70">
              Gizlilik
            </Link>
            <Link
              href="/login"
              className="font-medium text-[#7eb8e8] hover:text-white"
            >
              Personel Girişi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
