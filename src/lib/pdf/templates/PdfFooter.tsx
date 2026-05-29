import { Text, View } from "@react-pdf/renderer";
import { BRAND } from "@/lib/brand";
import { pdfStyles } from "@/lib/pdf/templates/styles";

interface PdfFooterProps {
  dosyaNo: string;
  pageLabel?: string;
}

export function PdfFooter({ dosyaNo, pageLabel }: PdfFooterProps) {
  return (
    <View style={pdfStyles.footer} fixed>
      <Text>
        {BRAND.companyName} · Dosya No: {dosyaNo}
      </Text>
      <Text>{pageLabel ?? "Gizli — yalnızca yetkili personel"}</Text>
    </View>
  );
}
