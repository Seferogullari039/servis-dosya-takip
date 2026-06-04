"use client";

import { useTheme } from "@/components/layout/ThemeProvider";
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
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { GrafikVerisi } from "@/types/dashboard";

const DURUM_COLORS = [
  "#3b82f6",
  "#f97316",
  "#8b5cf6",
  "#eab308",
  "#06b6d4",
  "#ef4444",
  "#22c55e",
  "#71717a",
  "#b45309",
  "#dc2626",
];

const DURUM_COLOR_BY_NAME: Record<string, string> = {
  "Pert İncelemesinde": "#b45309",
  "Pert Onaylandı": "#dc2626",
};

const ODEME_COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

interface DashboardChartsProps {
  grafikler: GrafikVerisi;
}

export function DashboardCharts({ grafikler }: DashboardChartsProps) {
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

  const hasDurum = grafikler.durumDagilimi.some((d) => d.value > 0);
  const hasOdeme = grafikler.odemeDagilimi.some((d) => d.value > 0);
  const hasGunluk = grafikler.gunlukAcilanDosya.some((d) => d.adet > 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="min-h-[280px]">
        <CardHeader>
          <CardTitle className="text-base">Durum Dağılımı</CardTitle>
        </CardHeader>
        {hasDurum ? (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={grafikler.durumDagilimi}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {grafikler.durumDagilimi.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={
                        DURUM_COLOR_BY_NAME[entry.name] ??
                        DURUM_COLORS[i % DURUM_COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: isDark ? "#a1a1aa" : "#52525b" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-ink-muted">Veri yok</p>
        )}
      </Card>

      <Card className="min-h-[280px]">
        <CardHeader>
          <CardTitle className="text-base">Ödeme Dağılımı</CardTitle>
        </CardHeader>
        {hasOdeme ? (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={grafikler.odemeDagilimi}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                >
                  {grafikler.odemeDagilimi.map((_, i) => (
                    <Cell
                      key={i}
                      fill={ODEME_COLORS[i % ODEME_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: isDark ? "#a1a1aa" : "#52525b" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-ink-muted">Veri yok</p>
        )}
      </Card>

      <Card className="min-h-[280px] lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle className="text-base">Günlük Açılan Dosya</CardTitle>
        </CardHeader>
        {hasGunluk || grafikler.gunlukAcilanDosya.length > 0 ? (
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grafikler.gunlukAcilanDosya}>
                <XAxis
                  dataKey="tarih"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <Bar
                  dataKey="adet"
                  fill={isDark ? "#60a5fa" : "#3b82f6"}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-ink-muted">Veri yok</p>
        )}
      </Card>
    </div>
  );
}
