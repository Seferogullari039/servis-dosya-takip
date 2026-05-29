import Link from "next/link";
import { EventBadge } from "@/components/dosyalar/EventBadge";
import { EmptyState } from "@/components/ui/DataState";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatTarihSaat } from "@/lib/utils/format";
import type { ServiceFileEvent } from "@/types/events";

interface RecentEventsPanelProps {
  events: ServiceFileEvent[];
}

export function RecentEventsPanel({ events }: RecentEventsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Son Hareketler</CardTitle>
      </CardHeader>

      {events.length === 0 ? (
        <EmptyState title="Hareket yok" description="Henüz kayıt bulunmuyor." />
      ) : (
        <ol className="space-y-3">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="flex flex-col gap-2 rounded-lg border border-border/60 p-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <EventBadge type={ev.eventType} />
                  <Link
                    href={`/dosyalar/${ev.serviceFileId}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    {ev.title}
                  </Link>
                </div>
                {ev.description && (
                  <p className="mt-1 text-sm text-ink-muted">{ev.description}</p>
                )}
                <p className="mt-1 text-xs text-ink-faint">
                  {ev.userFullName}
                </p>
              </div>
              <time className="shrink-0 text-xs text-ink-faint">
                {formatTarihSaat(ev.createdAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
