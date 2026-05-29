import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

export function SetupRequired() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Kurulum gerekli</CardTitle>
        <p className="mt-2 text-sm text-ink-muted">
          Supabase bağlantı bilgileri bulunamadı. Giriş yapabilmek için önce
          ortam değişkenlerini ayarlamanız gerekiyor.
        </p>
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
          düzenleyin
        </li>
        <li>
          SQL migration dosyalarını (001–007) Supabase SQL Editor&apos;da
          çalıştırın
        </li>
        <li>
          Terminal:{" "}
          <code className="rounded bg-surface-muted px-1">npm run seed:admin</code>
        </li>
        <li>Dev sunucusunu yeniden başlatın: Ctrl+C sonra npm run dev</li>
      </ol>
      <p className="mt-4 text-xs text-ink-faint">
        Giriş: seferogullari@servis.com / Alper123 (kurulum sonrası)
      </p>
    </Card>
  );
}
