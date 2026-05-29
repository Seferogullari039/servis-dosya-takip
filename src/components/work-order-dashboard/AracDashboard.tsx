import { AracDashboardCharts } from "@/components/work-order-dashboard/AracDashboardCharts";
import { AracStatCards } from "@/components/work-order-dashboard/AracStatCards";
import { CanliDurumPaneli } from "@/components/work-order-dashboard/CanliDurumPaneli";
import { TedarikStatCards } from "@/components/work-order-dashboard/TedarikStatCards";
import { WorkOrderImageStatCards } from "@/components/work-order-dashboard/WorkOrderImageStatCards";
import { PushEnableCard } from "@/components/push/PushEnableCard";
import { PushRegisterDebug } from "@/components/push/PushRegisterDebug";
import { PushStatusCard } from "@/components/push/PushStatusCard";
import type { AracDashboardData } from "@/types/work-order-dashboard";

interface AracDashboardProps {
  data: AracDashboardData;
}

export function AracDashboard({ data }: AracDashboardProps) {
  return (
    <div className="space-y-6">
      <PushEnableCard />
      <AracStatCards stats={data.stats} />
      <TedarikStatCards stats={data.tedarik} />
      <WorkOrderImageStatCards stats={data.gorsel} />
      <PushStatusCard />
      <PushRegisterDebug />
      <AracDashboardCharts
        gunlukIsEmirleri={data.gunlukIsEmirleri}
        durumDagilimi={data.durumDagilimi}
      />
      <CanliDurumPaneli satirlar={data.canliPanel} />
    </div>
  );
}
