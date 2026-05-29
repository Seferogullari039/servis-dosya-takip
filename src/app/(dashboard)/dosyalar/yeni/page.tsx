import { DosyaForm } from "@/components/dosyalar/DosyaForm";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

export default function YeniDosyaPage() {
  return (
    <AppShell title="Yeni Servis Dosyası">
      <Card>
        <CardHeader>
          <CardTitle>Dosya Bilgileri</CardTitle>
          <p className="text-sm text-ink-muted">
            Yeni servis dosyası Supabase veritabanına kaydedilir.
          </p>
        </CardHeader>
        <DosyaForm />
      </Card>
    </AppShell>
  );
}
