import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AracDashboard } from "@/components/work-order-dashboard/AracDashboard";
import { ErrorState, LoadingState } from "@/components/ui/DataState";
import { requireAuth } from "@/lib/auth/require-auth";
import { getAracDashboardData } from "@/lib/data/work-order-dashboard";

async function DashboardIcerik() {
  await requireAuth();
  const result = await getAracDashboardData();

  if (!result.ok) {
    return (
      <ErrorState
        title="Dashboard yüklenemedi"
        description={result.error}
      />
    );
  }

  return <AracDashboard data={result.data} />;
}

export default function AracDurumDashboardPage() {
  return (
    <AppShell title="Araç Durum Takibi">
      <Suspense fallback={<LoadingState message="Dashboard yükleniyor…" />}>
        <DashboardIcerik />
      </Suspense>
    </AppShell>
  );
}
