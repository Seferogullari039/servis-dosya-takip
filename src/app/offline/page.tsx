import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-ink-muted">
        {BRAND.companyName}
      </p>
      <h1 className="mt-2 text-xl font-bold text-ink">Çevrimdışı</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        İnternet bağlantınız yok. Bağlantı gelince sayfayı yenileyin veya uygulamayı
        tekrar açın.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white"
      >
        Dashboard
      </Link>
    </main>
  );
}
