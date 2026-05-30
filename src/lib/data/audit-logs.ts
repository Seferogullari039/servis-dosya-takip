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

export type BackupDownloadFormat = "CSV" | "JSON";

export interface LastBackupDownloadInfo {
  createdAt: string;
  userName: string;
  backupTypeKey: string;
  backupTypeLabel: string;
  format: BackupDownloadFormat;
}

const BACKUP_TYPE_LABELS: Record<string, string> = {
  dosyalar: "Dosyalar",
  "is-emirleri": "İş emirleri",
  tedarik: "Tedarik",
  gorseller: "Görsel kayıtları",
  tum: "Tüm veriler",
};

function parseBackupDownloadRow(row: AuditLogRow): LastBackupDownloadInfo {
  const raw = row.new_value as { type?: string; filename?: string } | null;
  const key = String(raw?.type ?? "yedek").trim();
  const filename = String(raw?.filename ?? row.entity_label ?? "");
  const format: BackupDownloadFormat =
    key === "tum" || filename.toLowerCase().endsWith(".json") ? "JSON" : "CSV";

  return {
    createdAt: row.created_at,
    userName: row.user_name || "—",
    backupTypeKey: key,
    backupTypeLabel: BACKUP_TYPE_LABELS[key] ?? key,
    format,
  };
}

/** Son backup_download audit kaydı (tam detay). */
export async function getLastBackupDownloadInfo(): Promise<LastBackupDownloadInfo | null> {
  try {
    const supabase = await getReadClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .eq("action", AUDIT_ACTIONS.BACKUP_DOWNLOAD)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return parseBackupDownloadRow(data as AuditLogRow);
  } catch {
    return null;
  }
}

/** @deprecated getLastBackupDownloadInfo kullanın */
export async function getLastBackupDownloadAt(): Promise<string | null> {
  const info = await getLastBackupDownloadInfo();
  return info?.createdAt ?? null;
}
