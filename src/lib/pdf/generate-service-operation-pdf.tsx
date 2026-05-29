import { renderToBuffer } from "@react-pdf/renderer";
import { registerPdfFonts } from "@/lib/pdf/register-fonts";
import { ServiceOperationDocument } from "@/lib/pdf/templates/ServiceOperationDocument";
import type { PdfOperationData } from "@/lib/pdf/types";

export async function generateServiceOperationPdf(
  data: PdfOperationData
): Promise<Buffer> {
  registerPdfFonts();
  const buffer = await renderToBuffer(<ServiceOperationDocument data={data} />);
  return Buffer.from(buffer);
}
