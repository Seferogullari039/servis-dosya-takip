import { emitPushEvent } from "@/lib/push/events";

export function notifyFileDeleted(params: {
  dosyaNo: string;
  plaka: string;
  excludeUserId?: string;
}): void {
  emitPushEvent({
    event: "service_file_deleted",
    body: `Dosya silindi: ${params.dosyaNo} · ${params.plaka}`,
    url: "/dosyalar",
    tag: `file-del-${Date.now()}`,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyUserDeactivated(params: {
  email: string;
  fullName: string;
  excludeUserId?: string;
}): void {
  emitPushEvent({
    event: "user_deactivated",
    body: `Kullanıcı pasifleştirildi: ${params.fullName} (${params.email})`,
    url: "/kullanicilar",
    tag: `user-off-${Date.now()}`,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyBackupDownloaded(params: {
  backupType: string;
  adminName: string;
  excludeUserId?: string;
}): void {
  emitPushEvent({
    event: "backup_downloaded",
    body: `Yedek indirildi (${params.backupType}) — ${params.adminName}`,
    url: "/yedekleme",
    tag: `backup-${Date.now()}`,
    excludeUserId: params.excludeUserId,
  });
}

export function notifyExcessiveFailedLogins(params: {
  email: string;
}): void {
  emitPushEvent({
    event: "auth_failed_burst",
    body: `Çok sayıda başarısız giriş: ${params.email}`,
    url: "/islem-gecmisi",
    tag: `auth-burst-${Date.now()}`,
  });
}
