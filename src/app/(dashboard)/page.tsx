import { Suspense } from "react";
import { OperasyonDashboard } from "@/components/dashboard/OperasyonDashboard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/ui/DataState";
import { getOperasyonDashboard } from "@/lib/data/dashboard";
import { deriveTodayTasksData } from "@/lib/data/operations-summary";
import type { DashboardPeriod } from "@/types/dashboard";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

function parsePeriod(raw?: string): DashboardPeriod {
  if (raw === "today" || raw === "7" || raw === "30") return raw;
  return "7";
}

async function DashboardContent({ period }: { period: DashboardPeriod }) {
  const result = await getOperasyonDashboard(period);

  if (!result.ok) {
    return (
      <ErrorState
        title="Dashboard yüklenemedi"
        description={result.error}
      />
    );
  }

  const todayTasks = deriveTodayTasksData(result.data, result.data.dosyalar);

  return <OperasyonDashboard data={result.data} todayTasks={todayTasks} />;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const { period: rawPeriod } = await searchParams;
  const period = parsePeriod(rawPeriod);

  return (
    <AppShell title="Operasyon Dashboard">
      <Suspense key={period} fallback={<DashboardSkeleton />}>
        <DashboardContent period={period} />
      </Suspense>
    </AppShell>
  );
}
