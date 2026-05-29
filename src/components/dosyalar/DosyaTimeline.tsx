import { EventBadge } from "@/components/dosyalar/EventBadge";
import { EventChangeDetails } from "@/components/dosyalar/EventChangeDetails";
import { EmptyState, ErrorState } from "@/components/ui/DataState";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatTarihSaat } from "@/lib/utils/format";
import type { PaginatedEvents } from "@/types/events";

interface DosyaTimelineProps {
  events: PaginatedEvents | null;
  error?: string | null;
}

export function DosyaTimeline({ events, error }: DosyaTimelineProps) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hareket Geçmişi</CardTitle>
        </CardHeader>
        <ErrorState
          title="Geçmiş yüklenemedi"
          description={error}
        />
      </Card>
    );
  }

  if (!events || events.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hareket Geçmişi</CardTitle>
        </CardHeader>
        <EmptyState
          title="Henüz hareket yok"
          description="Bu dosyada kayıtlı bir işlem geçmişi bulunmuyor."
        />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>Hareket Geçmişi</CardTitle>
        <span className="text-xs text-ink-muted">
          {events.total} kayıt
        </span>
      </CardHeader>

      <ol className="relative space-y-0">
        {events.items.map((event, index) => (
          <li
            key={event.id}
            className="relative flex gap-3 pb-6 pl-1 last:pb-0"
          >
            {index < events.items.length - 1 && (
              <span
                className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-border"
                aria-hidden
              />
            )}
            <span
              className="relative z-10 mt-1.5 h-[22px] w-[22px] shrink-0 rounded-full border-2 border-surface bg-accent"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{event.title}</p>
                  {event.description && (
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {event.description}
                    </p>
                  )}
                </div>
                <EventBadge type={event.eventType} />
              </div>
              <p className="mt-2 text-xs text-ink-faint">
                {event.userFullName} · {formatTarihSaat(event.createdAt)}
              </p>
              <EventChangeDetails
                oldValue={event.oldValue}
                newValue={event.newValue}
              />
            </div>
          </li>
        ))}
      </ol>

      {events.hasMore && (
        <p className="mt-4 border-t border-border pt-3 text-center text-xs text-ink-muted">
          Daha fazla kayıt mevcut (sayfa {events.page}, {events.pageSize}/
          sayfa)
        </p>
      )}
    </Card>
  );
}
