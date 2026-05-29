import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { getSupabaseEnvIssue } from "@/lib/supabase/env";

export function SetupRequired() {
  const issue = getSupabaseEnvIssue();

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Kurulum gerekli</CardTitle>
        <p className="mt-2 text-sm text-ink-muted">
          Supabase bağlantı bilgileri bulunamadı veya geçersiz. Giriş için
          önce ortam değişkenlerini düzeltmeniz gerekiyor.
        </p>
        {issue && (
          <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            {issue}
          </p>
        )}
      </CardHeader>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-muted">
        <li>
          <a href="/setup" className="font-medium text-accent underline">
            /setup
          </a>{" "}
          sayfasından Supabase anon + service_role key&apos;lerini yapıştırın
          (en kolay yol)
        </li>
        <li>
          Veya proje kökünde{" "}
          <code className="rounded bg-surface-muted px-1">.env.local</code>{" "}
          dosyasını düzenleyin (URL + anon key)
        </li>
        <li>
          Terminal:{" "}
          <code className="rounded bg-surface-muted px-1">
            npm run db:migrate
          </code>{" "}
          ve{" "}
          <code className="rounded bg-surface-muted px-1">npm run seed:admin</code>
        </li>
        <li>
          Sunucuyu{" "}
          <strong>npm run dev</strong> ile başlatın (düz <code>next dev</code>{" "}
          değil), sonra Ctrl+C → tekrar <code>npm run dev</code>
        </li>
      </ol>
      <p className="mt-4 text-xs text-ink-faint">
        Giriş: seferogullari@servis.com / Alper123 (kurulum sonrası)
      </p>
    </Card>
  );
}
