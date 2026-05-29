import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

export type MetricVariant =
  | "default"
  | "operation"
  | "warning"
  | "info"
  | "success"
  | "danger";

const variants: Record<MetricVariant, string> = {
  default: "border-l-accent",
  operation: "border-l-blue-500",
  warning: "border-l-orange-500",
  info: "border-l-sky-500",
  success: "border-l-emerald-500",
  danger: "border-l-red-500",
};

interface MetricCardProps {
  title: string;
  value: number;
  variant?: MetricVariant;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  variant = "default",
  subtitle,
}: MetricCardProps) {
  return (
    <Card className={cn("border-l-4", variants[variant])}>
      <p className="text-sm text-ink-muted">{title}</p>
      <p className="mt-1 text-3xl font-bold text-ink">{value}</p>
      {subtitle && (
        <p className="mt-1 text-xs text-ink-faint">{subtitle}</p>
      )}
    </Card>
  );
}
