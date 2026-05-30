"use client";

import { useTheme } from "@/components/layout/ThemeProvider";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { OpsCenterCharts } from "@/types/ops-center-dashboard";
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

const BRAND = "#0F4C81";
const PIE_COLORS = [
  "#0F4C81",
  "#1a6aad",
  "#3b82f6",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#8b5cf6",
  "#71717a",
];

interface OpsCenterChartsProps {
  charts: OpsCenterCharts;
}

export function OpsCenterChartsPanel({ charts }: OpsCenterChartsProps) {
  const { isDark } = useTheme();
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: isDark ? "#18181b" : "#ffffff",
      border: `1px solid ${isDark ? "#3f3f46" : "#e4e4e7"}`,
      borderRadius: 10,
      color: isDark ? "#fafafa" : "#18181b",
      fontSize: 12,
    },
  };

  return (
    <section className="space-y-4" aria-label="Rapor ve grafikler">
      <h2 className="text-lg font-semibold text-ink">Rapor ve Grafikler</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Son 30 Gün Dosya Sayısı">
          <BarChartResponsive
            data={charts.son30GunDosya}
            name="Dosya"
            color={BRAND}
            tooltipStyle={tooltipStyle}
          />
        </ChartCard>

        <ChartCard title="İş Emri Durum Dağılımı">
          <PieChartResponsive
            data={charts.isEmriDurum}
            tooltipStyle={tooltipStyle}
          />
        </ChartCard>

        <ChartCard title="Tedarik Durum Dağılımı">
          <PieChartResponsive
            data={charts.tedarikDurum}
            tooltipStyle={tooltipStyle}
          />
        </ChartCard>

        <ChartCard title="Günlük İşlem Yoğunluğu">
          <BarChartResponsive
            data={charts.gunlukIslem}
            name="İşlem"
            color="#1a6aad"
            tooltipStyle={tooltipStyle}
          />
        </ChartCard>
      </div>
    </section>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="min-h-[300px] border-border/80 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.02]">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <div className="h-[240px] w-full px-2 pb-4">{children}</div>
    </Card>
  );
}

function BarChartResponsive({
  data,
  name,
  color,
  tooltipStyle,
}: {
  data: { label: string; adet: number }[];
  name: string;
  color: string;
  tooltipStyle: object;
}) {
  const hasData = data.some((d) => d.adet > 0);
  if (!hasData) {
    return <EmptyChart />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
          minTickGap={8}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="adet" name={name} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieChartResponsive({
  data,
  tooltipStyle,
}: {
  data: { name: string; value: number }[];
  tooltipStyle: object;
}) {
  const filtered = data.filter((d) => d.value > 0);
  if (filtered.length === 0) {
    return <EmptyChart />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={filtered}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={72}
          label={({ name, percent }) =>
            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {filtered.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function EmptyChart() {
  return (
    <p className="flex h-full items-center justify-center text-sm text-ink-muted">
      Veri bulunamadı.
    </p>
  );
}
