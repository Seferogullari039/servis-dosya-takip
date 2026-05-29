import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { IsEmirleriFilters } from "@/components/is-emri/IsEmirleriFilters";
import { IsEmirleriList } from "@/components/is-emri/IsEmirleriList";
import { ErrorState, LoadingState } from "@/components/ui/DataState";
import { requireAuth } from "@/lib/auth/require-auth";
import { listeleIsEmirleri } from "@/lib/data/work-orders";
import { isAracDurumu } from "@/types/vehicle-status";
import type { IsEmriListFilters } from "@/types/is-emri";

interface PageProps {
  searchParams: Promise<{
    q?: string;
    durum?: string;
    baslangic?: string;
    bitis?: string;
  }>;
}

function parseFilters(params: {
  q?: string;
  durum?: string;
  baslangic?: string;
  bitis?: string;
}): IsEmriListFilters {
  const filters: IsEmriListFilters = {};
  if (params.q?.trim()) filters.arama = params.q.trim();
  if (params.durum && isAracDurumu(params.durum)) {
    filters.aracDurumu = params.durum;
  }
  if (params.baslangic) filters.baslangic = params.baslangic;
  if (params.bitis) filters.bitis = params.bitis;
  return filters;
}

async function IsEmirleriIcerik({
  filters,
  hasFilters,
}: {
  filters: IsEmriListFilters;
  hasFilters: boolean;
}) {
  const { profile } = await requireAuth();
  const result = await listeleIsEmirleri(filters);

  if (!result.ok) {
    return (
      <ErrorState
        title="İş emirleri yüklenemedi"
        description={result.error}
      />
    );
  }

  return (
    <IsEmirleriList
      kayitlar={result.data}
      role={profile.role}
      hasFilters={hasFilters}
    />
  );
}

export default async function IsEmirleriPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const hasFilters = Boolean(
    filters.arama || filters.aracDurumu || filters.baslangic || filters.bitis
  );

  return (
    <AppShell title="İş Emirleri">
      <div className="space-y-4">
        <Suspense fallback={null}>
          <IsEmirleriFilters />
        </Suspense>
        <Suspense
          key={JSON.stringify(filters)}
          fallback={<LoadingState message="İş emirleri yükleniyor…" />}
        >
          <IsEmirleriIcerik filters={filters} hasFilters={hasFilters} />
        </Suspense>
      </div>
    </AppShell>
  );
}
