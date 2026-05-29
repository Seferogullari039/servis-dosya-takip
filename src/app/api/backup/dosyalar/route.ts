import { NextResponse } from "next/server";
import { assertAdminAccess } from "@/lib/auth/assert-admin";
import { buildDosyalarCsv } from "@/lib/export/backup-data";
import { csvDownloadResponse } from "@/lib/export/http";
import { exportDateStamp } from "@/lib/export/csv";

export async function GET() {
  const auth = await assertAdminAccess();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const result = await buildDosyalarCsv();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return csvDownloadResponse(
    result.data,
    `dosyalar-${exportDateStamp()}.csv`
  );
}
