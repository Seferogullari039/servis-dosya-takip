import Link from "next/link";
import { redirect } from "next/navigation";
import { SetupForm } from "@/components/setup/SetupForm";
import { hasSupabaseEnv } from "@/lib/supabase/env";

interface PageProps {
  searchParams: Promise<{ saved?: string }>;
}

export default async function SetupPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV === "production") {
    redirect("/login");
  }

  const { saved } = await searchParams;
  const ready = hasSupabaseEnv();

  if (ready && saved === "1") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted p-4">
      <div className="w-full max-w-lg space-y-4">
        <SetupForm saved={saved === "1"} />
        {saved === "1" && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
            <p className="font-medium">Kaydedildi.</p>
            <p className="mt-2 text-sm text-green-900">
              Admin kullanıcı oluşturuldu. Dev sunucuyu yeniden başlatın:
            </p>
            <pre className="mt-2 overflow-x-auto rounded bg-white/80 p-2 text-xs">
              Ctrl+C{"\n"}npm run dev
            </pre>
            <p className="mt-2 text-sm">
              Giriş: <strong>seferogullari@servis.com</strong> /{" "}
              <strong>Alper123</strong>
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block font-medium text-green-800 underline"
            >
              Login sayfasına git →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
