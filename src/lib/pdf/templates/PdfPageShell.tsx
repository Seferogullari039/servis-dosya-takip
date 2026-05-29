import { Page } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { pdfStyles } from "@/lib/pdf/templates/styles";

interface PdfPageShellProps {
  children: ReactNode;
  footer?: ReactNode;
}

export function PdfPageShell({ children, footer }: PdfPageShellProps) {
  return (
    <Page size="A4" style={pdfStyles.page}>
      {children}
      {footer}
    </Page>
  );
}
