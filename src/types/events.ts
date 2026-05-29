export const SERVICE_FILE_EVENT_TYPES = [
  "created",
  "updated",
  "status_changed",
  "payment_changed",
  "note_added",
  "expert_assigned",
  "document_uploaded",
] as const;

export type ServiceFileEventType =
  (typeof SERVICE_FILE_EVENT_TYPES)[number];

export interface ServiceFileEvent {
  id: string;
  serviceFileId: string;
  userId: string;
  userFullName: string;
  eventType: ServiceFileEventType;
  title: string;
  description: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
}

export interface PaginatedEvents {
  items: ServiceFileEvent[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export const DEFAULT_EVENTS_PAGE_SIZE = 20;
export const MAX_EVENTS_PAGE_SIZE = 100;
