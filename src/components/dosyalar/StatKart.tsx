import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface StatKartProps {
  baslik: string;
  deger: number;
  vurgu?: "default" | "warning" | "info";
}

const vurguBorder = {
  default: "border-l-accent",
  warning: "border-l-amber-500",
  info: "border-l-blue-500",
};

export function StatKart({ baslik, deger, vurgu = "default" }: StatKartProps) {
  return (
    <Card className={cn("border-l-4", vurguBorder[vurgu])}>
      <p className="text-sm text-ink-muted">{baslik}</p>
      <p className="mt-1 text-3xl font-bold text-ink">{deger}</p>
    </Card>
  );
}
