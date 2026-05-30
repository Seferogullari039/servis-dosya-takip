import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { OperasyonMerkeziDashboard } from "@/components/ops-center/OperasyonMerkeziDashboard";
import { ErrorState, LoadingState } from "@/components/ui/DataState";
import { requireAuth } from "@/lib/auth/require-auth";
import { getOpsCenterDashboardData } from "@/lib/data/ops-center-dashboard";

async function DashboardIcerik() {
  await requireAuth();
  const result = await getOpsCenterDashboardData();

  if (!result.ok) {
    return (
      <ErrorState
        title="Dashboard yüklenemedi"
        description={result.error}
      />
    );
  }

  return <OperasyonMerkeziDashboard data={result.data} />;
}

export default function OperasyonMerkeziPage() {
  return (
    <AppShell title="Operasyon Merkezi">
      <Suspense fallback={<LoadingState message="Dashboard yükleniyor…" />}>
        <DashboardIcerik />
      </Suspense>
    </AppShell>
  );
}
