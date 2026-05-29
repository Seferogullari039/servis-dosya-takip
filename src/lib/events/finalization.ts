import {
  SERVICE_FILE_EVENT_TYPES,
  type ServiceFileEventType,
} from "@/types/events";

/** Frozen event schema version — bump only with migration + release note. */
export const EVENT_SCHEMA_VERSION = "1.0.0" as const;

/** Allowed event types registry (source of truth). */
export const ALLOWED_EVENT_TYPES: readonly ServiceFileEventType[] =
  SERVICE_FILE_EVENT_TYPES;

/** Types removed or renamed — detected at read/audit time. */
export const DEPRECATED_EVENT_TYPES = [] as const;

export type DeprecatedEventType = (typeof DEPRECATED_EVENT_TYPES)[number];

export interface EventPayloadShape {
  serviceFileId: string;
  eventType: string;
  title: string;
  description?: string | null;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}

export interface EventValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 2000;

export function isAllowedEventType(type: string): type is ServiceFileEventType {
  return (ALLOWED_EVENT_TYPES as readonly string[]).includes(type);
}

export function isDeprecatedEventType(type: string): boolean {
  return (DEPRECATED_EVENT_TYPES as readonly string[]).includes(type);
}

export function detectDeprecatedEvents(
  eventTypes: string[]
): { deprecated: string[]; unknown: string[] } {
  const deprecated: string[] = [];
  const unknown: string[] = [];

  for (const type of eventTypes) {
    if (isDeprecatedEventType(type)) deprecated.push(type);
    else if (!isAllowedEventType(type)) unknown.push(type);
  }

  return { deprecated, unknown };
}

/** Validates event payload before insert (application layer). */
export function validateEventPayload(
  payload: EventPayloadShape
): EventValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!payload.serviceFileId?.trim()) {
    errors.push("serviceFileId is required");
  }

  if (!payload.title?.trim()) {
    errors.push("title is required");
  } else if (payload.title.length > MAX_TITLE_LENGTH) {
    errors.push(`title exceeds ${MAX_TITLE_LENGTH} characters`);
  }

  if (payload.description && payload.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`description exceeds ${MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (!isAllowedEventType(payload.eventType)) {
    if (isDeprecatedEventType(payload.eventType)) {
      warnings.push(`deprecated event type: ${payload.eventType}`);
    } else {
      errors.push(`unknown event type: ${payload.eventType}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/** Schema freeze policy — document for release governance. */
export const EVENT_SCHEMA_FREEZE_POLICY = {
  version: EVENT_SCHEMA_VERSION,
  allowedTypes: ALLOWED_EVENT_TYPES,
  rules: [
    "New event types require SQL migration + version bump.",
    "Renaming/removing types requires DEPRECATED_EVENT_TYPES entry.",
    "Payload fields old_value/new_value must remain JSON-serializable.",
    "Insert only via insert_service_file_event RPC.",
  ],
} as const;
