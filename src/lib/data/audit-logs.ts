import { AUDIT_ACTIONS } from "@/lib/audit/types";
import type { AuditLogFilters, AuditLogRow } from "@/lib/audit/types";
import {
  isServiceRoleConfigured,
  tryCreateAdminClient,
} from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { DataResult } from "@/types/data-result";
import { fail, ok } from "@/types/data-result";

const DEFAULT_LIMIT = 500;

async function getReadClient() {
  if (isServiceRoleConfigured()) {
    const admin = tryCreateAdminClient();
    if (admin) return admin;
  }
  return createClient();
}

export async function listAuditLogs(
  filters: AuditLogFilters = {}
): Promise<DataResult<AuditLogRow[]>> {
  try {
    const supabase = await getReadClient();
    const limit = filters.limit ?? DEFAULT_LIMIT;

    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }
    if (filters.action) {
      query = query.eq("action", filters.action);
    }
    if (filters.from) {
      query = query.gte("created_at", filters.from);
    }
    if (filters.to) {
      query = query.lte("created_at", filters.to);
    }

    const { data, error } = await query;
    if (error) return fail(error.message);
    return ok((data ?? []) as AuditLogRow[]);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "İşlem geçmişi yüklenemedi.");
  }
}

export async function listEntityAuditLogs(
  entityType: string,
  entityId: string,
  limit = 15
): Promise<DataResult<AuditLogRow[]>> {
  try {
    const supabase = await getReadClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return fail(error.message);
    return ok((data ?? []) as AuditLogRow[]);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Geçmiş yüklenemedi.");
  }
}

export async function getLastBackupDownloadAt(): Promise<string | null> {
  if (!isServiceRoleConfigured()) return null;
  const admin = tryCreateAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("audit_logs")
    .select("created_at")
    .eq("action", AUDIT_ACTIONS.BACKUP_DOWNLOAD)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.created_at;
}
