import { createClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";

export interface ConsistencyReport {
  orphanEventIds: string[];
  orphanEventCount: number;
  filesWithoutEvents: string[];
  filesWithoutEventsCount: number;
  checkedAt: string;
}

const ORPHAN_SCAN_LIMIT = 500;
const FILES_WITHOUT_EVENTS_LIMIT = 100;

/** servis_dosyalari ↔ events senkron kontrolü (dev/admin tooling). */
export async function checkDataConsistency(): Promise<
  DataResult<ConsistencyReport>
> {
  try {
    const supabase = await createClient();
    const checkedAt = new Date().toISOString();

    const { data: orphanRows, error: orphanError } = await supabase
      .from("service_file_events")
      .select("id, service_file_id")
      .limit(ORPHAN_SCAN_LIMIT);

    if (orphanError) return fail(orphanError.message);

    const serviceFileIds = [
      ...new Set((orphanRows ?? []).map((r) => r.service_file_id)),
    ];

    const { data: existingFiles, error: filesError } = await supabase
      .from("servis_dosyalari")
      .select("id")
      .in("id", serviceFileIds.length > 0 ? serviceFileIds : ["00000000-0000-0000-0000-000000000000"]);

    if (filesError) return fail(filesError.message);

    const existingSet = new Set((existingFiles ?? []).map((f) => f.id));
    const orphanEventIds = (orphanRows ?? [])
      .filter((r) => !existingSet.has(r.service_file_id))
      .map((r) => r.id);

    const { data: allFiles, error: allFilesError } = await supabase
      .from("servis_dosyalari")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(FILES_WITHOUT_EVENTS_LIMIT);

    if (allFilesError) return fail(allFilesError.message);

    const fileIds = (allFiles ?? []).map((f) => f.id);
    const { data: eventFiles, error: eventFilesError } = await supabase
      .from("service_file_events")
      .select("service_file_id")
      .in(
        "service_file_id",
        fileIds.length > 0 ? fileIds : ["00000000-0000-0000-0000-000000000000"]
      )
      .eq("event_type", "created");

    if (eventFilesError) return fail(eventFilesError.message);

    const withCreated = new Set(
      (eventFiles ?? []).map((e) => e.service_file_id)
    );
    const filesWithoutEvents = fileIds.filter((id) => !withCreated.has(id));

    return ok({
      orphanEventIds,
      orphanEventCount: orphanEventIds.length,
      filesWithoutEvents,
      filesWithoutEventsCount: filesWithoutEvents.length,
      checkedAt,
    });
  } catch (e) {
    return fail(
      e instanceof Error ? e.message : "Tutarlılık kontrolü başarısız."
    );
  }
}

/** Orphan event tespiti — kısa alias. */
export async function detectOrphanEvents(): Promise<
  DataResult<{ orphanEventIds: string[]; count: number }>
> {
  const result = await checkDataConsistency();
  if (!result.ok) return result;
  return ok({
    orphanEventIds: result.data.orphanEventIds,
    count: result.data.orphanEventCount,
  });
}
