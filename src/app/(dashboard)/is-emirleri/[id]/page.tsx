import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { IsEmriDetayClient } from "@/components/is-emri/IsEmriDetayClient";
import { ErrorState, LoadingState } from "@/components/ui/DataState";
import { requireAuth } from "@/lib/auth/require-auth";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { listWorkOrderImages } from "@/lib/data/work-order-images";
import { getIsEmriById } from "@/lib/data/work-orders";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ yazdir?: string }>;
}

export default async function IsEmriDetayPage({ params, searchParams }: PageProps) {
  await requireAuth();
  const { id } = await params;
  const { yazdir } = await searchParams;
  const [result, imagesResult, profile] = await Promise.all([
    getIsEmriById(id),
    listWorkOrderImages(id),
    getCurrentProfile(),
  ]);

  if (!result.ok) {
    return (
      <AppShell title="İş Emri">
        <ErrorState title="Kayıt yüklenemedi" description={result.error} />
      </AppShell>
    );
  }

  if (!result.data) {
    return (
      <AppShell title="İş Emri">
        <ErrorState
          title="İş emri bulunamadı"
          description="Kayıt silinmiş veya erişiminiz olmayabilir."
        />
      </AppShell>
    );
  }

  return (
    <AppShell title={`İş Emri · ${result.data.isEmriNo}`}>
      <Suspense fallback={<LoadingState message="İş emri yükleniyor…" />}>
        <IsEmriDetayClient
          kayit={result.data}
          images={imagesResult.ok ? imagesResult.data : []}
          isAdmin={profile?.role === "admin"}
          autoPrint={yazdir === "1"}
        />
      </Suspense>
    </AppShell>
  );
}
