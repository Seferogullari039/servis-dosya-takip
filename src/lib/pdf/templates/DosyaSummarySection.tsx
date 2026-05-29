import { Text, View } from "@react-pdf/renderer";
import { pdfFormatTarih } from "@/lib/pdf/format";
import { pdfFormatPara, pdfFormatParaOzet } from "@/lib/pdf/format";
import { pdfStyles } from "@/lib/pdf/templates/styles";
import type { ServisDosyasi } from "@/types/servis-dosya";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={pdfStyles.row}>
      <Text style={pdfStyles.label}>{label}</Text>
      <Text style={pdfStyles.value}>{value || "—"}</Text>
    </View>
  );
}

export function DosyaSummarySection({ dosya }: { dosya: ServisDosyasi }) {
  return (
    <>
      <Text style={pdfStyles.sectionTitle}>Dosya Bilgileri</Text>
      <InfoRow label="Dosya Numarası" value={dosya.dosyaNo} />
      <InfoRow label="Plaka" value={dosya.plaka} />

      <Text style={pdfStyles.sectionTitle}>Müşteri Bilgileri</Text>
      <InfoRow label="Müşteri Adı" value={dosya.musteriAdi} />
      <InfoRow label="Telefon" value={dosya.telefon} />

      <Text style={pdfStyles.sectionTitle}>Araç Bilgileri</Text>
      <InfoRow label="Marka / Model" value={dosya.aracMarkaModel} />
      <InfoRow label="Eksper" value={dosya.eksperAdi} />

      <Text style={pdfStyles.sectionTitle}>Durum</Text>
      <InfoRow label="Servis Durumu" value={dosya.durum} />
      <InfoRow label="Ödeme Durumu" value={dosya.odemeDurumu} />
      <InfoRow
        label="Dosya Tutarı"
        value={
          dosya.dosyaTutari != null ? pdfFormatPara(dosya.dosyaTutari) : "—"
        }
      />
      <InfoRow
        label="Tahsilat"
        value={pdfFormatParaOzet(dosya.odenenTutar, dosya.dosyaTutari)}
      />
      <InfoRow
        label="Oluşturulma Tarihi"
        value={pdfFormatTarih(dosya.olusturulmaTarihi)}
      />

      <Text style={pdfStyles.sectionTitle}>Notlar</Text>
      <Text style={pdfStyles.notes}>{dosya.notlar || "—"}</Text>
    </>
  );
}
