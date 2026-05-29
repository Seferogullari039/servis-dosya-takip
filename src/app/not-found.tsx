import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted p-4">
      <h1 className="text-2xl font-bold text-ink">Sayfa bulunamadı</h1>
      <p className="text-ink-muted">Aradığınız dosya veya sayfa mevcut değil.</p>
      <Link href="/" className="text-sm font-medium text-accent hover:underline">
        Dashboard&apos;a dön
      </Link>
    </div>
  );
}
