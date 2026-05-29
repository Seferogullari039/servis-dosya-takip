import { Document } from "@react-pdf/renderer";
import { BRAND } from "@/lib/brand";
import { DosyaSummarySection } from "@/lib/pdf/templates/DosyaSummarySection";
import { PdfFooter } from "@/lib/pdf/templates/PdfFooter";
import { PdfHeader } from "@/lib/pdf/templates/PdfHeader";
import { PdfPageShell } from "@/lib/pdf/templates/PdfPageShell";
import type { PdfSummaryData } from "@/lib/pdf/types";

export function ServiceSummaryDocument({ data }: { data: PdfSummaryData }) {
  const { dosya, generatedAt } = data;

  return (
    <Document
      title={`Servis Özeti — ${dosya.dosyaNo}`}
      author={BRAND.companyName}
    >
      <PdfPageShell footer={<PdfFooter dosyaNo={dosya.dosyaNo} />}>
        <PdfHeader
          title="Servis Dosya Özeti"
          subtitle={`${dosya.dosyaNo} · ${dosya.plaka}`}
          generatedAt={generatedAt}
        />
        <DosyaSummarySection dosya={dosya} />
      </PdfPageShell>
    </Document>
  );
}
