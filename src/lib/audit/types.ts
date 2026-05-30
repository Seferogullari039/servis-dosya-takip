import type { UserRole } from "@/lib/auth/types";
import type { Json } from "@/types/supabase";

export const AUDIT_ACTIONS = {
  LOGIN_SUCCESS: "auth.login_success",
  LOGIN_FAILED: "auth.login_failed",
  LOGIN_LOCKED: "auth.login_locked",
  LOGIN_FAILED_BURST: "auth.login_failed_burst",

  SERVICE_FILE_CREATE: "service_file.create",
  SERVICE_FILE_UPDATE: "service_file.update",
  SERVICE_FILE_DELETE: "service_file.delete",

  WORK_ORDER_CREATE: "work_order.create",
  WORK_ORDER_UPDATE: "work_order.update",
  WORK_ORDER_DELETE: "work_order.delete",
  WORK_ORDER_VEHICLE_STATUS: "work_order.vehicle_status_changed",
  PROCUREMENT_STATUS: "procurement.status_changed",

  WORK_ORDER_IMAGE_UPLOAD: "work_order_image.upload",
  WORK_ORDER_IMAGE_DELETE: "work_order_image.delete",

  USER_CREATE: "user.create",
  USER_ROLE_CHANGE: "user.role_changed",
  USER_ACTIVE_CHANGE: "user.active_changed",
  USER_PASSWORD_RESET: "user.password_reset",

  BACKUP_DOWNLOAD: "backup.download",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export interface AuditLogRow {
  id: string;
  user_id: string | null;
  user_name: string;
  user_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  entity_label: string | null;
  old_value: Json | null;
  new_value: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditActor {
  id?: string | null;
  full_name: string;
  role?: UserRole | null;
}

export interface RecordAuditInput {
  action: AuditAction | string;
  actor?: AuditActor | null;
  entity_type?: string | null;
  entity_id?: string | null;
  entity_label?: string | null;
  old_value?: Json | Record<string, unknown> | null;
  new_value?: Json | Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
  limit?: number;
}

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  [AUDIT_ACTIONS.LOGIN_SUCCESS]: "Giriş başarılı",
  [AUDIT_ACTIONS.LOGIN_FAILED]: "Giriş başarısız",
  [AUDIT_ACTIONS.LOGIN_LOCKED]: "Hesap kilitli giriş denemesi",
  [AUDIT_ACTIONS.LOGIN_FAILED_BURST]: "Çok sayıda başarısız giriş",
  [AUDIT_ACTIONS.SERVICE_FILE_CREATE]: "Dosya oluşturma",
  [AUDIT_ACTIONS.SERVICE_FILE_UPDATE]: "Dosya güncelleme",
  [AUDIT_ACTIONS.SERVICE_FILE_DELETE]: "Dosya silme",
  [AUDIT_ACTIONS.WORK_ORDER_CREATE]: "İş emri oluşturma",
  [AUDIT_ACTIONS.WORK_ORDER_UPDATE]: "İş emri güncelleme",
  [AUDIT_ACTIONS.WORK_ORDER_DELETE]: "İş emri silme",
  [AUDIT_ACTIONS.WORK_ORDER_VEHICLE_STATUS]: "Araç durumu değişikliği",
  [AUDIT_ACTIONS.PROCUREMENT_STATUS]: "Tedarik durumu değişikliği",
  [AUDIT_ACTIONS.WORK_ORDER_IMAGE_UPLOAD]: "Görsel yükleme",
  [AUDIT_ACTIONS.WORK_ORDER_IMAGE_DELETE]: "Görsel silme",
  [AUDIT_ACTIONS.USER_CREATE]: "Kullanıcı oluşturma",
  [AUDIT_ACTIONS.USER_ROLE_CHANGE]: "Kullanıcı rol değişikliği",
  [AUDIT_ACTIONS.USER_ACTIVE_CHANGE]: "Kullanıcı aktif/pasif",
  [AUDIT_ACTIONS.USER_PASSWORD_RESET]: "Şifre sıfırlama",
  [AUDIT_ACTIONS.BACKUP_DOWNLOAD]: "Yedek indirme",
};
