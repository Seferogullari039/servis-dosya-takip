import { NextResponse } from "next/server";
import { assertAdminAccess } from "@/lib/auth/assert-admin";
import { auditBackupDownload } from "@/lib/export/backup-audit";
import { buildGorsellerCsv } from "@/lib/export/backup-data";
import { csvDownloadResponse } from "@/lib/export/http";
import { exportDateStamp } from "@/lib/export/csv";

export async function GET() {
  const auth = await assertAdminAccess();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const result = await buildGorsellerCsv();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const filename = `gorsel-kayitlari-${exportDateStamp()}.csv`;
  await auditBackupDownload(auth.profile, "gorseller", filename);
  return csvDownloadResponse(result.data, filename);
}
