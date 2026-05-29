import { Suspense } from "react";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { DelayedFilesTable } from "@/components/dashboard/DelayedFilesTable";
import { FinanceCard } from "@/components/dashboard/FinanceCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentEventsPanel } from "@/components/dashboard/RecentEventsPanel";
import { StaffActivityList } from "@/components/dashboard/StaffActivityList";
import { TodayTasks } from "@/components/dashboard/TodayTasks";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import type { OperasyonDashboardData } from "@/types/dashboard";
import type { TodayTasksData } from "@/types/operations";

interface OperasyonDashboardProps {
  data: OperasyonDashboardData;
  todayTasks: TodayTasksData;
}

export function OperasyonDashboard({
  data,
  todayTasks,
}: OperasyonDashboardProps) {
  const { operasyon, finans, gecikenDosyalar, personel, sonAktiviteler, grafikler } =
    data;

  return (
    <div className="space-y-6">
      <Suspense fallback={null}>
        <DashboardFilters />
      </Suspense>

      <TodayTasks data={todayTasks} />

      <section aria-label="Özet metrikler">
        <h2 className="mb-3 text-sm font-semibold text-ink">Günün özeti</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            title="Aktif dosya"
            value={operasyon.toplamAktif}
            variant="operation"
          />
          <MetricCard
            title="Bugün açılan"
            value={operasyon.bugunAcilan}
            variant="info"
          />
          <MetricCard
            title="Ödeme bekleyen"
            value={finans.odemeBekleyen}
            variant="warning"
          />
          <MetricCard
            title="Geciken"
            value={gecikenDosyalar.length}
            variant={gecikenDosyalar.length > 0 ? "warning" : "success"}
          />
        </div>
      </section>

      {gecikenDosyalar.length > 0 && (
        <DelayedFilesTable dosyalar={gecikenDosyalar} />
      )}

      <CollapsibleSection
        title="Detaylı rapor ve grafikler"
        summary="Finans, grafikler, personel aktivitesi ve son hareketler"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <MetricCard title="Tedarik" value={operasyon.tedarikSurecinde} variant="warning" />
            <MetricCard title="Eksper bekleyen" value={operasyon.eksperBekleyen} variant="warning" />
            <MetricCard title="Onarımda" value={operasyon.onarimda} variant="operation" />
            <MetricCard title="Bugün kapanan" value={operasyon.bugunKapanan} variant="success" />
          </div>
          <FinanceCard finans={finans} />
          <DashboardCharts grafikler={grafikler} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {gecikenDosyalar.length === 0 && (
              <DelayedFilesTable dosyalar={gecikenDosyalar} />
            )}
            <StaffActivityList aktivite={personel} />
          </div>
          <RecentEventsPanel events={sonAktiviteler} />
        </div>
      </CollapsibleSection>
    </div>
  );
}
