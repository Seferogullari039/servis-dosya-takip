import { createClient } from "@/lib/supabase/server";
import { mapEventRow } from "@/lib/events/map-event-row";
import { measureGuardedQuery } from "@/lib/performance/guardrails";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import {
  DEFAULT_EVENTS_PAGE_SIZE,
  MAX_EVENTS_PAGE_SIZE,
  type PaginatedEvents,
} from "@/types/events";
import type { ServiceFileEventRow } from "@/types/supabase";

export interface ListEventsOptions {
  page?: number;
  pageSize?: number;
}

export interface EventsInfiniteScrollCursor {
  nextPage: number;
  pageSize: number;
  hasMore: boolean;
}

function clampPageSize(raw?: number): number {
  const size = raw ?? DEFAULT_EVENTS_PAGE_SIZE;
  return Math.min(MAX_EVENTS_PAGE_SIZE, Math.max(1, size));
}

function clampPage(raw?: number): number {
  return Math.max(1, raw ?? 1);
}

/** Servis dosyasına ait timeline eventleri (en yeni üstte, sayfalı). */
export async function listEventsByServiceFileId(
  serviceFileId: string,
  options: ListEventsOptions = {}
): Promise<DataResult<PaginatedEvents>> {
  return measureGuardedQuery(`events:${serviceFileId}:p${options.page ?? 1}`, async () => {
    try {
      const page = clampPage(options.page);
      const pageSize = clampPageSize(options.pageSize);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const supabase = await createClient();

      const { count, error: countError } = await supabase
        .from("service_file_events")
        .select("*", { count: "exact", head: true })
        .eq("service_file_id", serviceFileId);

      if (countError) {
        return fail(countError.message);
      }

      const { data, error } = await supabase
        .from("service_file_events")
        .select(
          `
          *,
          profiles:user_id (
            full_name
          )
        `
        )
        .eq("service_file_id", serviceFileId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        return fail(error.message);
      }

      const total = count ?? 0;
      const items = (data ?? []).map((row) =>
        mapEventRow(
          row as ServiceFileEventRow & {
            profiles: { full_name: string } | null;
          }
        )
      );

      return ok({
        items,
        page,
        pageSize,
        total,
        hasMore: from + items.length < total,
      });
    } catch (e) {
      return fail(
        e instanceof Error ? e.message : "Hareket geçmişi yüklenemedi."
      );
    }
  });
}

/** Infinite scroll altyapısı — UI entegrasyonu opsiyonel. */
export async function fetchNextEventsPage(
  serviceFileId: string,
  cursor: EventsInfiniteScrollCursor
): Promise<
  DataResult<PaginatedEvents & { cursor: EventsInfiniteScrollCursor }>
> {
  const result = await listEventsByServiceFileId(serviceFileId, {
    page: cursor.nextPage,
    pageSize: cursor.pageSize,
  });

  if (!result.ok) return result;

  return ok({
    ...result.data,
    cursor: {
      nextPage: result.data.hasMore ? result.data.page + 1 : cursor.nextPage,
      pageSize: result.data.pageSize,
      hasMore: result.data.hasMore,
    },
  });
}

export function createEventsCursor(
  pageSize = DEFAULT_EVENTS_PAGE_SIZE
): EventsInfiniteScrollCursor {
  return {
    nextPage: 2,
    pageSize: clampPageSize(pageSize),
    hasMore: false,
  };
}
