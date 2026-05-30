import Link from "next/link";
import { DosyaDetayOdemeBar } from "@/components/dosyalar/DosyaDetayOdemeBar";
import { DocumentList } from "@/components/dosyalar/DocumentList";
import { DosyaDetayTabs } from "@/components/dosyalar/DosyaDetayTabs";
import { PdfExportButtons } from "@/components/dosyalar/PdfExportButtons";
import { DosyaTimeline } from "@/components/dosyalar/DosyaTimeline";
import { EntityAuditHistory } from "@/components/audit/EntityAuditHistory";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatTarih } from "@/lib/utils/format";
import { formatPara, formatParaOzet } from "@/lib/utils/para";
import type { PaginatedDocuments } from "@/types/documents";
import type { PaginatedEvents } from "@/types/events";
import type { ServisDosyasi } from "@/types/servis-dosya";

interface DosyaDetayProps {
  dosya: ServisDosyasi;
  timeline: PaginatedEvents | null;
  timelineError?: string | null;
  documents: PaginatedDocuments | null;
  documentsError?: string | null;
  isAdmin: boolean;
}

function DetaySatir({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-border/60 py-3 last:border-0 sm:grid-cols-3">
      <dt className="text-sm font-medium text-ink-muted">{label}</dt>
      <dd className="text-sm text-ink sm:col-span-2">{value}</dd>
    </div>
  );
}

function BilgilerPanel({ dosya }: { dosya: ServisDosyasi }) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>{dosya.dosyaNo}</CardTitle>
          <p className="mt-1 text-ink-muted">{dosya.plaka}</p>
        </div>
        <DosyaDetayOdemeBar dosya={dosya} />
      </CardHeader>

      <dl>
        <DetaySatir label="Müşteri Adı" value={dosya.musteriAdi} />
        <DetaySatir label="Telefon" value={dosya.telefon} />
        <DetaySatir label="Araç Marka / Model" value={dosya.aracMarkaModel} />
        <DetaySatir label="Eksper Adı" value={dosya.eksperAdi || "—"} />
        <DetaySatir
          label="Dosya tutarı"
          value={
            dosya.dosyaTutari != null ? formatPara(dosya.dosyaTutari) : "—"
          }
        />
        <DetaySatir
          label="Tahsilat"
          value={formatParaOzet(dosya.odenenTutar, dosya.dosyaTutari)}
        />
        <DetaySatir
          label="Oluşturulma Tarihi"
          value={formatTarih(dosya.olusturulmaTarihi)}
        />
        <DetaySatir
          label="Notlar"
          value={
            dosya.notlar ? (
              <span className="whitespace-pre-wrap">{dosya.notlar}</span>
            ) : (
              "—"
            )
          }
        />
      </dl>
    </Card>
  );
}

export function DosyaDetay({
  dosya,
  timeline,
  timelineError,
  documents,
  documentsError,
  isAdmin,
}: DosyaDetayProps) {
  return (
    <div className="space-y-6">
      <Link
        href="/dosyalar"
        className="inline-block text-sm text-ink-muted hover:text-ink"
      >
        ← Dosyalara dön
      </Link>

      <PdfExportButtons
        serviceFileId={dosya.id}
        dosyaNo={dosya.dosyaNo}
      />

      <DosyaDetayTabs
        evrakCount={documents?.total ?? 0}
        bilgiler={<BilgilerPanel dosya={dosya} />}
        timeline={
          <DosyaTimeline events={timeline} error={timelineError} />
        }
        evraklar={
          <DocumentList
            serviceFileId={dosya.id}
            documents={documents}
            error={documentsError}
            isAdmin={isAdmin}
          />
        }
      />

      <EntityAuditHistory
        entityType="service_file"
        entityId={dosya.id}
        title="Bu dosyaya ait son işlemler"
      />
    </div>
  );
}
