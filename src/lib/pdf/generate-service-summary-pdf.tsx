import { renderToBuffer } from "@react-pdf/renderer";
import { registerPdfFonts } from "@/lib/pdf/register-fonts";
import { ServiceSummaryDocument } from "@/lib/pdf/templates/ServiceSummaryDocument";
import type { PdfSummaryData } from "@/lib/pdf/types";

export async function generateServiceSummaryPdf(
  data: PdfSummaryData
): Promise<Buffer> {
  registerPdfFonts();
  const buffer = await renderToBuffer(<ServiceSummaryDocument data={data} />);
  return Buffer.from(buffer);
}
