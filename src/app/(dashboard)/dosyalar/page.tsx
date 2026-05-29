import { Suspense } from "react";
import { DosyaListesiClient } from "@/components/operations/DosyaListesiClient";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/ui/DataState";
import { requireAuth } from "@/lib/auth/require-auth";
import { listeleDosyalar } from "@/lib/data/dosyalar";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

async function DosyalarIcerik({ arama }: { arama?: string }) {
  const { profile } = await requireAuth();
  const result = await listeleDosyalar(arama);

  if (!result.ok) {
    return (
      <ErrorState
        title="Dosyalar yüklenemedi"
        description={result.error}
      />
    );
  }

  return (
    <DosyaListesiClient
      initialDosyalar={result.data}
      arama={arama ?? ""}
      role={profile.role}
    />
  );
}

export default async function DosyalarPage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <AppShell title="Servis Dosyaları">
      <Suspense
        key={q ?? ""}
        fallback={<LoadingState message="Dosyalar yükleniyor…" />}
      >
        <DosyalarIcerik arama={q} />
      </Suspense>
    </AppShell>
  );
}
