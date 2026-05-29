import { Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/brand";
import { pdfFormatTarihSaat } from "@/lib/pdf/format";
import { pdfStyles } from "@/lib/pdf/templates/styles";

interface PdfHeaderProps {
  title: string;
  subtitle: string;
  generatedAt: string;
}

export function PdfHeader({ title, subtitle, generatedAt }: PdfHeaderProps) {
  return (
    <View style={pdfStyles.header}>
      <Text style={pdfStyles.companyTitle}>{BRAND.companyName}</Text>
      <Text style={pdfStyles.reportTitle}>{title}</Text>
      <Text style={pdfStyles.subtitle}>{subtitle}</Text>
      <Text style={pdfStyles.subtitle}>
        Rapor tarihi: {pdfFormatTarihSaat(generatedAt)}
      </Text>
    </View>
  );
}
