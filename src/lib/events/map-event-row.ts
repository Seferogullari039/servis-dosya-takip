import type { ServiceFileEvent, ServiceFileEventType } from "@/types/events";
import type { Json, ServiceFileEventRow, UserRole } from "@/types/supabase";

function parseJsonValue(value: Json | null | unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return { value };
}

type EventRowWithProfile = ServiceFileEventRow & {
  profiles: { full_name: string; role?: UserRole } | null;
};

export function mapEventRow(row: EventRowWithProfile): ServiceFileEvent {
  return {
    id: row.id,
    serviceFileId: row.service_file_id,
    userId: row.user_id,
    userFullName: row.profiles?.full_name ?? "Bilinmeyen",
    eventType: row.event_type as ServiceFileEventType,
    title: row.title,
    description: row.description,
    oldValue: parseJsonValue(row.old_value),
    newValue: parseJsonValue(row.new_value),
    createdAt: row.created_at,
  };
}
