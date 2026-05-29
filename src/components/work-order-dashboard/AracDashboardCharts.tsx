"use client";

import { useTheme } from "@/components/layout/ThemeProvider";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { VEHICLE_STATUS_STYLES } from "@/lib/vehicle-status/styles";
import type {
  DurumDagilimNokta,
  GunlukIsEmriNokta,
} from "@/types/work-order-dashboard";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AracDashboardChartsProps {
  gunlukIsEmirleri: GunlukIsEmriNokta[];
  durumDagilimi: DurumDagilimNokta[];
}

export function AracDashboardCharts({
  gunlukIsEmirleri,
  durumDagilimi,
}: AracDashboardChartsProps) {
  const { isDark } = useTheme();
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: isDark ? "#27272a" : "#ffffff",
      border: `1px solid ${isDark ? "#3f3f46" : "#e4e4e7"}`,
      borderRadius: 8,
      color: isDark ? "#fafafa" : "#18181b",
      fontSize: 12,
    },
  };

  const hasGunluk = gunlukIsEmirleri.some((d) => d.adet > 0);
  const hasDurum = durumDagilimi.some((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="min-h-[300px]">
        <CardHeader>
          <CardTitle className="text-base">Günlük İş Emri Sayısı</CardTitle>
        </CardHeader>
        {hasGunluk ? (
          <div className="h-[240px] w-full px-2 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gunlukIsEmirleri}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={56}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Bar
                  dataKey="adet"
                  name="İş emri"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="px-4 pb-6 text-sm text-ink-muted">
            Son 7 günde kayıt bulunamadı.
          </p>
        )}
      </Card>

      <Card className="min-h-[300px]">
        <CardHeader>
          <CardTitle className="text-base">Durum Dağılımı</CardTitle>
        </CardHeader>
        {hasDurum ? (
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={durumDagilimi.filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={78}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {durumDagilimi
                    .filter((d) => d.value > 0)
                    .map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={VEHICLE_STATUS_STYLES[entry.name].chart}
                      />
                    ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="px-4 pb-6 text-sm text-ink-muted">
            Henüz iş emri kaydı yok.
          </p>
        )}
      </Card>
    </div>
  );
}
