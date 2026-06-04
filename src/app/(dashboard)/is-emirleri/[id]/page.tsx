import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { EntityAuditHistory } from "@/components/audit/EntityAuditHistory";
import { IsEmriDetayClient } from "@/components/is-emri/IsEmriDetayClient";
import { ErrorState, LoadingState } from "@/components/ui/DataState";
import { requireAuth } from "@/lib/auth/require-auth";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getDosyaMetaByPlaka } from "@/lib/data/dosyalar";
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
  const workOrderPromise = getIsEmriById(id);
  const [result, imagesResult, profile, dosyaMetaResult] = await Promise.all([
    workOrderPromise,
    listWorkOrderImages(id),
    getCurrentProfile(),
    workOrderPromise.then((wo) =>
      wo.ok && wo.data
        ? getDosyaMetaByPlaka(wo.data.plaka)
        : Promise.resolve({ ok: true as const, data: null })
    ),
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
        <div className="space-y-6">
          <IsEmriDetayClient
            kayit={result.data}
            dosyaMeta={dosyaMetaResult.ok ? dosyaMetaResult.data : null}
            images={imagesResult.ok ? imagesResult.data : []}
            isAdmin={profile?.role === "admin"}
            autoPrint={yazdir === "1"}
          />
          <EntityAuditHistory
            entityType="work_order"
            entityId={id}
            title="Bu iş emrine ait son işlemler"
          />
        </div>
      </Suspense>
    </AppShell>
  );
}
