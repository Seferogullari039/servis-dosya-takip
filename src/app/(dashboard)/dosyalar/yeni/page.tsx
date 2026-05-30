import { DosyaForm } from "@/components/dosyalar/DosyaForm";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { requireAuth } from "@/lib/auth/require-auth";

export default async function YeniDosyaPage() {
  const { profile } = await requireAuth();

  return (
    <AppShell title="Yeni Servis Dosyası">
      <Card>
        <CardHeader>
          <CardTitle>Dosya Bilgileri</CardTitle>
          <p className="text-sm text-ink-muted">
            Yeni servis dosyası Supabase veritabanına kaydedilir.
          </p>
        </CardHeader>
        <DosyaForm isAdmin={profile.role === "admin"} />
      </Card>
    </AppShell>
  );
}
