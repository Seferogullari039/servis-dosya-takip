import { createClient } from "@/lib/supabase/server";
import { debugEvent } from "@/lib/events/debug-logger";
import { validateEventPayload } from "@/lib/events/finalization";
import {
  buildEventIdempotencyKey,
  clearIdempotencyKey,
  isDuplicateEvent,
} from "@/lib/events/idempotency";
import {
  messageCreated,
  messageDocumentUploaded,
  messageExpertAssigned,
  messageFieldUpdated,
  messageNoteAdded,
  messagePaymentChanged,
  messageStatusChanged,
  snapshotFromDomain,
} from "@/lib/events/messages";
import { logger } from "@/lib/logging";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";
import type { DocumentCategory } from "@/types/documents";
import type { Json } from "@/types/supabase";
import type { ServiceFileEventType } from "@/types/events";
import type { ServisDosyasi } from "@/types/servis-dosya";

type EventPayload = {
  serviceFileId: string;
  eventType: ServiceFileEventType;
  title: string;
  description?: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
};

async function insertEvent(payload: EventPayload): Promise<DataResult<void>> {
  const validation = validateEventPayload(payload);
  if (!validation.valid) {
    logger.warn("event validation failed", {
      errors: validation.errors,
      eventType: payload.eventType,
    });
    return fail(validation.errors.join("; "));
  }

  for (const warning of validation.warnings) {
    logger.warn("event validation warning", { warning });
  }

  const idempotencyKey = buildEventIdempotencyKey(
    payload.serviceFileId,
    payload.eventType,
    payload.oldValue,
    payload.newValue
  );

  if (isDuplicateEvent(idempotencyKey)) {
    debugEvent("skip-duplicate", {
      key: idempotencyKey,
      eventType: payload.eventType,
      serviceFileId: payload.serviceFileId,
    });
    return ok(undefined);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("insert_service_file_event", {
    p_service_file_id: payload.serviceFileId,
    p_event_type: payload.eventType,
    p_title: payload.title,
    p_description: payload.description ?? null,
    p_old_value: (payload.oldValue ?? null) as Json,
    p_new_value: (payload.newValue ?? null) as Json,
  });

  if (error) {
    clearIdempotencyKey(idempotencyKey);
    debugEvent("error", {
      eventType: payload.eventType,
      serviceFileId: payload.serviceFileId,
      message: error.message,
    });
    return fail(error.message);
  }

  debugEvent("insert", {
    eventType: payload.eventType,
    serviceFileId: payload.serviceFileId,
  });
  return ok(undefined);
}

export async function logCreated(
  serviceFileId: string,
  dosya: ServisDosyasi
): Promise<DataResult<void>> {
  const { title, description } = messageCreated();
  return insertEvent({
    serviceFileId,
    eventType: "created",
    title,
    description,
    newValue: snapshotFromDomain(dosya),
  });
}

export async function logStatusChanged(
  serviceFileId: string,
  oldStatus: string,
  newStatus: string
): Promise<DataResult<void>> {
  if (oldStatus === newStatus) return ok(undefined);
  const { title, description } = messageStatusChanged(oldStatus, newStatus);
  return insertEvent({
    serviceFileId,
    eventType: "status_changed",
    title,
    description,
    oldValue: { durum: oldStatus },
    newValue: { durum: newStatus },
  });
}

export async function logPaymentChanged(
  serviceFileId: string,
  oldPayment: string,
  newPayment: string
): Promise<DataResult<void>> {
  if (oldPayment === newPayment) return ok(undefined);
  const { title, description } = messagePaymentChanged(oldPayment, newPayment);
  return insertEvent({
    serviceFileId,
    eventType: "payment_changed",
    title,
    description,
    oldValue: { odeme_durumu: oldPayment },
    newValue: { odeme_durumu: newPayment },
  });
}

export async function logNoteAdded(
  serviceFileId: string,
  oldNote: string | null,
  newNote: string | null
): Promise<DataResult<void>> {
  const normalizedOld = (oldNote ?? "").trim();
  const normalizedNew = (newNote ?? "").trim();
  if (normalizedOld === normalizedNew) return ok(undefined);

  const { title, description } = messageNoteAdded();
  return insertEvent({
    serviceFileId,
    eventType: "note_added",
    title,
    description,
    oldValue: normalizedOld ? { notlar: normalizedOld } : null,
    newValue: normalizedNew ? { notlar: normalizedNew } : null,
  });
}

export async function logExpertAssigned(
  serviceFileId: string,
  oldExpert: string | null,
  newExpert: string | null
): Promise<DataResult<void>> {
  const o = (oldExpert ?? "").trim();
  const n = (newExpert ?? "").trim();
  if (o === n) return ok(undefined);

  const { title, description } = messageExpertAssigned(n || "—");
  return insertEvent({
    serviceFileId,
    eventType: "expert_assigned",
    title,
    description,
    oldValue: o ? { eksper_adi: o } : null,
    newValue: n ? { eksper_adi: n } : null,
  });
}

export async function logDocumentUploaded(
  serviceFileId: string,
  category: DocumentCategory,
  fileName: string
): Promise<DataResult<void>> {
  const { title, description } = messageDocumentUploaded(category, fileName);
  return insertEvent({
    serviceFileId,
    eventType: "document_uploaded",
    title,
    description,
    newValue: { category, dosya: fileName },
  });
}

export async function logUpdated(
  serviceFileId: string,
  field: string,
  oldValue: string | null,
  newValue: string | null
): Promise<DataResult<void>> {
  const o = (oldValue ?? "").trim();
  const n = (newValue ?? "").trim();
  if (o === n) return ok(undefined);

  const { title, description } = messageFieldUpdated(field, n || "—");
  return insertEvent({
    serviceFileId,
    eventType: "updated",
    title,
    description,
    oldValue: { [field]: o || null },
    newValue: { [field]: n || null },
  });
}
