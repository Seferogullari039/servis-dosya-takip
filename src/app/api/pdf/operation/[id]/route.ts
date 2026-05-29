import { NextResponse } from "next/server";
import { pdfErrorMessage } from "@/lib/pdf/api-error";
import { assertPdfAccess } from "@/lib/pdf/auth-api";
import { fetchPdfOperationData } from "@/lib/pdf/fetch-pdf-data";
import { buildPdfFilename } from "@/lib/pdf/filename";
import { generateServiceOperationPdf } from "@/lib/pdf/generate-service-operation-pdf";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const auth = await assertPdfAccess();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await params;

  try {
    const dataResult = await fetchPdfOperationData(id);
    if (!dataResult.ok) {
      const status = dataResult.error.includes("bulunamadı") ? 404 : 400;
      return NextResponse.json({ error: dataResult.error }, { status });
    }

    const buffer = await generateServiceOperationPdf(dataResult.data);
    const filename = buildPdfFilename(
      dataResult.data.dosya.dosyaNo,
      "operation"
    );

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e) {
    const message = pdfErrorMessage(e);
    console.error("[pdf-operation]", e);
    return NextResponse.json(
      { error: `PDF oluşturulamadı: ${message}` },
      { status: 500 }
    );
  }
}
