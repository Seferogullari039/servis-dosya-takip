import { Document, Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/brand";
import {
  pdfCategoryLabel,
  pdfEventTypeLabel,
  pdfFormatBoyut,
  pdfFormatTarihSaat,
} from "@/lib/pdf/format";
import { DosyaSummarySection } from "@/lib/pdf/templates/DosyaSummarySection";
import { PdfFooter } from "@/lib/pdf/templates/PdfFooter";
import { PdfHeader } from "@/lib/pdf/templates/PdfHeader";
import { PdfPageShell } from "@/lib/pdf/templates/PdfPageShell";
import { pdfStyles } from "@/lib/pdf/templates/styles";
import type { PdfOperationData } from "@/lib/pdf/types";
import type { DocumentCategory } from "@/types/documents";

export function ServiceOperationDocument({ data }: { data: PdfOperationData }) {
  const { dosya, generatedAt, events, documents } = data;

  return (
    <Document
      title={`Operasyon Raporu — ${dosya.dosyaNo}`}
      author={BRAND.companyName}
    >
      <PdfPageShell footer={<PdfFooter dosyaNo={dosya.dosyaNo} />}>
        <PdfHeader
          title="Operasyon Raporu"
          subtitle={`${dosya.dosyaNo} · ${dosya.plaka}`}
          generatedAt={generatedAt}
        />
        <DosyaSummarySection dosya={dosya} />
      </PdfPageShell>

      <PdfPageShell
        footer={
          <PdfFooter dosyaNo={dosya.dosyaNo} pageLabel="Operasyon raporu" />
        }
      >
        <Text style={pdfStyles.sectionTitle}>
          Hareket Geçmişi (Son {events.length} kayıt)
        </Text>
        {events.length === 0 ? (
          <Text style={pdfStyles.emptyText}>Hareket kaydı bulunmuyor.</Text>
        ) : (
          <>
            <View style={pdfStyles.tableHeader}>
              <Text style={pdfStyles.colDate}>Tarih</Text>
              <Text style={pdfStyles.colUser}>Kullanıcı</Text>
              <Text style={pdfStyles.colTitle}>Başlık</Text>
              <Text style={pdfStyles.colType}>Tür</Text>
            </View>
            {events.map((ev) => (
              <View key={ev.id} style={pdfStyles.tableRow}>
                <Text style={pdfStyles.colDate}>
                  {pdfFormatTarihSaat(ev.createdAt)}
                </Text>
                <Text style={pdfStyles.colUser}>{ev.userFullName}</Text>
                <Text style={pdfStyles.colTitle}>{ev.title}</Text>
                <Text style={pdfStyles.colType}>
                  {pdfEventTypeLabel(ev.eventType)}
                </Text>
              </View>
            ))}
          </>
        )}

        <Text style={pdfStyles.sectionTitle}>Evrak Listesi</Text>
        {documents.length === 0 ? (
          <Text style={pdfStyles.emptyText}>Yüklenmiş evrak bulunmuyor.</Text>
        ) : (
          <>
            <View style={pdfStyles.tableHeader}>
              <Text style={pdfStyles.colFile}>Dosya Adı</Text>
              <Text style={pdfStyles.colCategory}>Kategori</Text>
              <Text style={pdfStyles.colUploader}>Yükleyen</Text>
              <Text style={pdfStyles.colDocDate}>Tarih / Boyut</Text>
            </View>
            {documents.map((doc, i) => (
              <View key={`${doc.originalName}-${i}`} style={pdfStyles.tableRow}>
                <Text style={pdfStyles.colFile}>{doc.originalName}</Text>
                <Text style={pdfStyles.colCategory}>
                  {pdfCategoryLabel(doc.category as DocumentCategory)}
                </Text>
                <Text style={pdfStyles.colUploader}>{doc.uploaderFullName}</Text>
                <Text style={pdfStyles.colDocDate}>
                  {pdfFormatTarihSaat(doc.createdAt)} ·{" "}
                  {pdfFormatBoyut(doc.fileSize)}
                </Text>
              </View>
            ))}
          </>
        )}
      </PdfPageShell>
    </Document>
  );
}
