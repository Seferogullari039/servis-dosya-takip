import { OpsBoardColumns } from "@/components/ops-center/OpsBoardColumns";
import { OpsCenterChartsPanel } from "@/components/ops-center/OpsCenterCharts";
import { OpsKpiGrid } from "@/components/ops-center/OpsKpiGrid";
import type { OpsCenterDashboardData } from "@/types/ops-center-dashboard";

interface OperasyonMerkeziDashboardProps {
  data: OpsCenterDashboardData;
}

export function OperasyonMerkeziDashboard({
  data,
}: OperasyonMerkeziDashboardProps) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-ink-muted">
          Canlı operasyon özeti — dosya, iş emri ve tahsilat
        </p>
      </div>
      <OpsKpiGrid kpis={data.kpis} />
      <OpsBoardColumns columns={data.columns} />
      <OpsCenterChartsPanel charts={data.charts} />
    </div>
  );
}
