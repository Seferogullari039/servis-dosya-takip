import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-border/60", className)}
      aria-hidden
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Dashboard yükleniyor">
      <SkeletonBlock className="h-9 w-48" />
      <Card className="p-4">
        <SkeletonBlock className="mb-3 h-5 w-40" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-20" />
          <SkeletonBlock className="h-20" />
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <SkeletonBlock className="mb-2 h-3 w-20" />
            <SkeletonBlock className="h-7 w-12" />
          </Card>
        ))}
      </div>
      <SkeletonBlock className="h-12 w-full rounded-xl" />
    </div>
  );
}
