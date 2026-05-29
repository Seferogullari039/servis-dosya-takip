import { notFound } from "next/navigation";
import { DosyaDetay } from "@/components/dosyalar/DosyaDetay";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/ui/DataState";
import { requireAuth } from "@/lib/auth/require-auth";
import { listDocumentsByServiceFileId } from "@/lib/data/documents";
import { listEventsByServiceFileId } from "@/lib/data/events";
import { getDosyaById } from "@/lib/data/dosyalar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DosyaDetayPage({ params }: PageProps) {
  const { id } = await params;
  const { profile } = await requireAuth();

  const [dosyaResult, eventsResult, documentsResult] = await Promise.all([
    getDosyaById(id),
    listEventsByServiceFileId(id, { page: 1, pageSize: 20 }),
    listDocumentsByServiceFileId(id, {
      page: 1,
      pageSize: 24,
      includeSignedUrls: true,
    }),
  ]);

  if (!dosyaResult.ok) {
    return (
      <AppShell title="Dosya Detayı">
        <ErrorState
          title="Dosya yüklenemedi"
          description={dosyaResult.error}
        />
      </AppShell>
    );
  }

  if (!dosyaResult.data) {
    notFound();
  }

  return (
    <AppShell title="Dosya Detayı">
      <DosyaDetay
        dosya={dosyaResult.data}
        timeline={eventsResult.ok ? eventsResult.data : null}
        timelineError={eventsResult.ok ? null : eventsResult.error}
        documents={documentsResult.ok ? documentsResult.data : null}
        documentsError={documentsResult.ok ? null : documentsResult.error}
        isAdmin={profile.role === "admin"}
      />
    </AppShell>
  );
}
