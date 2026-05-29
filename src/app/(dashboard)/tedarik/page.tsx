import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TedarikFilters } from "@/components/tedarik/TedarikFilters";
import { TedarikTakipClient } from "@/components/tedarik/TedarikTakipClient";
import { ErrorState, LoadingState } from "@/components/ui/DataState";
import { requireAuth } from "@/lib/auth/require-auth";
import { listeleTedarikParcalari } from "@/lib/data/tedarik";
import { isTedarikDurumu } from "@/types/tedarik";
import type { TedarikListFilters } from "@/types/tedarik";

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
}): TedarikListFilters {
  const filters: TedarikListFilters = {};
  if (params.q?.trim()) filters.arama = params.q.trim();
  if (params.durum && isTedarikDurumu(params.durum)) {
    filters.tedarikDurumu = params.durum;
  }
  if (params.baslangic) filters.baslangic = params.baslangic;
  if (params.bitis) filters.bitis = params.bitis;
  return filters;
}

async function TedarikIcerik({ filters }: { filters: TedarikListFilters }) {
  await requireAuth();
  const result = await listeleTedarikParcalari(filters);

  if (!result.ok) {
    return (
      <ErrorState title="Tedarik listesi yüklenemedi" description={result.error} />
    );
  }

  return <TedarikTakipClient kayitlar={result.data} />;
}

export default async function TedarikPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);

  return (
    <AppShell title="Sigorta Tedarik Takibi">
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">
          Hasar dosyası parça tedarik sürecini plaka, müşteri ve duruma göre takip
          edin.
        </p>
        <Suspense fallback={null}>
          <TedarikFilters />
        </Suspense>
        <Suspense
          key={JSON.stringify(filters)}
          fallback={<LoadingState message="Tedarik verileri yükleniyor…" />}
        >
          <TedarikIcerik filters={filters} />
        </Suspense>
      </div>
    </AppShell>
  );
}
