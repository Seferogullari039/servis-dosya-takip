import { memo } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/DataState";
import type { TodayTasksData } from "@/types/operations";

interface TodayTasksProps {
  data: TodayTasksData;
}

function TaskList({
  title,
  items,
  empty,
}: {
  title: string;
  items: TodayTasksData["geciken"];
  empty: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-muted">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-ink-faint">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm hover:bg-surface-muted"
              >
                <span className="font-medium text-accent">
                  {item.dosyaNo}
                </span>
                <span className="text-xs text-ink-muted">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const TodayTasks = memo(function TodayTasks({ data }: TodayTasksProps) {
  const total =
    data.geciken.length +
    data.odemeBekleyen.length +
    data.tedarik.length +
    data.pertIncelemesinde.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bugünün Görevleri</CardTitle>
        {total > 0 && (
          <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
            {total} görev
          </span>
        )}
      </CardHeader>

      {total === 0 ? (
        <EmptyState
          title="Bekleyen görev yok"
          description="Operasyon akışı güncel görünüyor."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <TaskList
            title="Geciken dosyalar"
            items={data.geciken}
            empty="Geciken yok"
          />
          <TaskList
            title="Ödeme bekleyenler"
            items={data.odemeBekleyen}
            empty="Ödeme bekleyen yok"
          />
          <TaskList
            title="Tedarik sürecinde"
            items={data.tedarik}
            empty="Tedarik bekleyen yok"
          />
          <TaskList
            title="Pert incelemesinde"
            items={data.pertIncelemesinde}
            empty="Pert incelemesi yok"
          />
        </div>
      )}
    </Card>
  );
});
