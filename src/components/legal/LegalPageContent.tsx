import Link from "next/link";

interface LegalPageContentProps {
  title: string;
  children: React.ReactNode;
}

export function LegalPageContent({ title, children }: LegalPageContentProps) {
  return (
    <div className="min-h-screen bg-[#03060c] text-white">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          href="/login"
          className="text-sm font-medium text-[#5ba3d4] hover:text-white"
        >
          ← Giriş sayfası
        </Link>
        <h1 className="mt-6 text-2xl font-bold">{title}</h1>
        <div className="prose prose-invert mt-8 max-w-none space-y-6 text-sm leading-relaxed text-white/85">
          {children}
        </div>
        <p className="mt-10 text-xs text-white/40">
          Seferoğulları Otomotiv — Servis Dosya Takip Sistemi
        </p>
      </div>
    </div>
  );
}
