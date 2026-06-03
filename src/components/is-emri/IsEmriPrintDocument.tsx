"use client";

import { forwardRef, useMemo } from "react";
import { IsEmriPrintLogo } from "@/components/is-emri/IsEmriPrintLogo";
import { WorkOrderImagePrintBlock } from "@/components/is-emri/WorkOrderImagePrintBlock";
import { BRAND } from "@/lib/brand";
import { calcParcaSatirToplam } from "@/lib/is-emri/calculations";
import { formatPara, parseTutarInput } from "@/lib/utils/para";
import { calcKalanTutar } from "@/types/work-order-payment";
import type { IsEmriFormState } from "@/types/is-emri";
import type { WorkOrderImage } from "@/types/work-order-image";

export interface IsEmriPrintDocumentProps {
  form: IsEmriFormState;
  isEmriNo: string;
  parcaToplam: number;
  servisSatinAlmaToplam: number;
  iscilikToplam: number;
  genelToplam: number;
  printImages?: WorkOrderImage[];
}

function formatTarih(iso: string): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso + "T12:00:00"));
  } catch {
    return iso;
  }
}

function formatBelgeSaati(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatBelgeTarihi(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function PrintSection({
  no,
  title,
  children,
  compact,
}: {
  no: string;
  title: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={
        compact ? "is-emri-doc-section is-emri-doc-section-compact" : "is-emri-doc-section"
      }
    >
      <div className="is-emri-doc-section-head">
        <span className="is-emri-doc-section-no">{no}</span>
        <h2 className="is-emri-doc-section-title">{title}</h2>
      </div>
      <div className="is-emri-doc-section-body">{children}</div>
    </section>
  );
}

function InfoGrid({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <table className="is-emri-doc-info-table">
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <th>{row.label}</th>
            <td>{row.value || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const IsEmriPrintDocument = forwardRef<
  HTMLElement,
  IsEmriPrintDocumentProps
>(function IsEmriPrintDocument(
  {
    form,
    isEmriNo,
    parcaToplam,
    servisSatinAlmaToplam,
    iscilikToplam,
    genelToplam,
    printImages = [],
  },
  ref
) {
  const belgeZamani = useMemo(() => new Date(), []);
  const parcalar = form.parcalar.filter(
    (p) => p.parcaAdi.trim() || p.adet.trim() || p.birimFiyat.trim()
  );
  const iscilik = form.iscilikSatirlari.filter(
    (s) => s.aciklama.trim() || s.tutar.trim()
  );
  const tahsilEdilen = parseTutarInput(form.tahsilEdilenTutar) ?? 0;
  const kalanTutar = calcKalanTutar(genelToplam, tahsilEdilen);

  return (
    <article
      ref={ref}
      className="is-emri-print-document is-emri-print-document-screen"
      aria-label="İş emri yazdırma formu"
    >
      <header className="is-emri-doc-header">
        <div className="is-emri-doc-header-brand">
          <IsEmriPrintLogo className="is-emri-doc-logo" />
          <div className="is-emri-doc-header-titles">
            <p className="is-emri-doc-company">{BRAND.companyName}</p>
            <h1 className="is-emri-doc-title">SERVİS İŞ EMRİ</h1>
            <p className="is-emri-doc-subtitle">Özel Servis · Ekspertiz Formu</p>
          </div>
        </div>
        <div className="is-emri-doc-meta-box" aria-label="İş emri bilgileri">
          <div className="is-emri-doc-meta-row">
            <span className="is-emri-doc-meta-label">İş Emri No</span>
            <span className="is-emri-doc-meta-value">{isEmriNo}</span>
          </div>
          <div className="is-emri-doc-meta-row">
            <span className="is-emri-doc-meta-label">Tarih</span>
            <span className="is-emri-doc-meta-value">
              {formatTarih(form.serviseGirisTarihi) !== "—"
                ? formatTarih(form.serviseGirisTarihi)
                : formatBelgeTarihi(belgeZamani)}
            </span>
          </div>
          <div className="is-emri-doc-meta-row">
            <span className="is-emri-doc-meta-label">Saat</span>
            <span className="is-emri-doc-meta-value">
              {formatBelgeSaati(belgeZamani)}
            </span>
          </div>
          <div className="is-emri-doc-meta-row">
            <span className="is-emri-doc-meta-label">İş Emri Tipi</span>
            <span className="is-emri-doc-meta-value is-emri-doc-meta-status">
              {form.isEmriTipi}
            </span>
          </div>
          <div className="is-emri-doc-meta-row">
            <span className="is-emri-doc-meta-label">Araç Durumu</span>
            <span className="is-emri-doc-meta-value is-emri-doc-meta-status">
              {form.aracDurumu}
            </span>
          </div>
          <div className="is-emri-doc-meta-row">
            <span className="is-emri-doc-meta-label">Ödeme Durumu</span>
            <span className="is-emri-doc-meta-value is-emri-doc-meta-status">
              {form.odemeDurumu}
            </span>
          </div>
        </div>
      </header>

      <div className="is-emri-doc-cards-row">
        <div className="is-emri-doc-card">
          <PrintSection no="1" title="Müşteri bilgileri" compact>
            <InfoGrid
              rows={[
                { label: "Ruhsat sahibi", value: form.ruhsatSahibi },
                { label: "Telefon", value: form.telefon },
                { label: "Plaka", value: form.plaka },
              ]}
            />
          </PrintSection>
        </div>
        <div className="is-emri-doc-card">
          <PrintSection no="2" title="Araç bilgileri" compact>
            <InfoGrid
              rows={[
                {
                  label: "Marka / Model",
                  value: `${form.marka} ${form.model}`.trim(),
                },
                { label: "KM", value: form.km },
                {
                  label: "Servise giriş",
                  value: formatTarih(form.serviseGirisTarihi),
                },
              ]}
            />
          </PrintSection>
        </div>
      </div>

      <PrintSection no="3" title="Ekspertiz kontrol listesi">
        <div className="is-emri-doc-checklist" role="list">
          {form.ekspertizChecklist.map((item) => (
            <div
              key={item.key}
              role="listitem"
              className={
                item.checked
                  ? "is-emri-doc-check-item is-emri-doc-check-item--checked"
                  : "is-emri-doc-check-item"
              }
            >
              <span className="is-emri-doc-check-mark" aria-hidden>
                {item.checked ? "✓" : ""}
              </span>
              <div className="is-emri-doc-check-content">
                <span className="is-emri-doc-check-label">{item.label}</span>
                {item.note ? (
                  <span className="is-emri-doc-check-note">{item.note}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </PrintSection>

      <PrintSection no="4" title="Parça listesi">
        {parcalar.length === 0 ? (
          <p className="is-emri-doc-empty">Parça kaydı yok.</p>
        ) : (
          <table className="is-emri-doc-table is-emri-doc-table-zebra">
            <thead>
              <tr>
                <th>Parça</th>
                <th className="text-right">Adet</th>
                <th className="text-right">Birim fiyat</th>
                <th className="text-right">Toplam</th>
                <th>Tedarik</th>
              </tr>
            </thead>
            <tbody>
              {parcalar.map((row) => (
                <tr key={row.id}>
                  <td>{row.parcaAdi || "—"}</td>
                  <td className="text-right tabular-nums">{row.adet || "—"}</td>
                  <td className="text-right tabular-nums">{row.birimFiyat || "—"}</td>
                  <td className="text-right tabular-nums font-semibold">
                    {formatPara(calcParcaSatirToplam(row))}
                  </td>
                  <td>
                    {row.tedarikDurumu}
                    {row.servisSatinAldi ? " · Servis alım" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PrintSection>

      <PrintSection no="5" title="İşçilik listesi">
        {form.yapilacakIslemler.trim() ? (
          <div className="is-emri-doc-note-block">
            <p className="is-emri-doc-note-label">Yapılacak işlemler</p>
            <p className="is-emri-doc-note-text">{form.yapilacakIslemler}</p>
          </div>
        ) : null}
        {iscilik.length === 0 ? (
          <p className="is-emri-doc-empty">İşçilik kaydı yok.</p>
        ) : (
          <table className="is-emri-doc-table is-emri-doc-table-zebra">
            <thead>
              <tr>
                <th>Açıklama</th>
                <th className="text-right w-28">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {iscilik.map((row) => (
                <tr key={row.id}>
                  <td>{row.aciklama || "—"}</td>
                  <td className="text-right tabular-nums font-semibold">
                    {row.tutar || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </PrintSection>

      {form.ekspertizAlani.trim() ? (
        <section className="is-emri-doc-notes">
          <p className="is-emri-doc-note-label">Ekspertiz / servis notları</p>
          <p className="is-emri-doc-note-text">{form.ekspertizAlani}</p>
        </section>
      ) : null}

      <div className="is-emri-doc-totals-wrap">
        <section className="is-emri-doc-notes is-emri-doc-payment-summary">
          <p className="is-emri-doc-note-label">Ödeme özeti</p>
          <table className="is-emri-doc-info-table">
            <tbody>
              <tr>
                <th>Tahsil edilen</th>
                <td>{formatPara(tahsilEdilen)}</td>
              </tr>
              <tr>
                <th>Kalan tutar</th>
                <td>{formatPara(kalanTutar)}</td>
              </tr>
              <tr>
                <th>İş emri durumu</th>
                <td>{form.isEmriDurumu}</td>
              </tr>
            </tbody>
          </table>
          {form.odemeNotu.trim() ? (
            <p className="is-emri-doc-note-text mt-2">{form.odemeNotu}</p>
          ) : null}
        </section>
        <section className="is-emri-doc-totals" aria-label="Toplamlar">
          <table className="is-emri-doc-totals-table">
            <tbody>
              <tr>
                <th>Parça toplamı</th>
                <td>{formatPara(parcaToplam)}</td>
              </tr>
              <tr>
                <th>Servis satın alma</th>
                <td>{formatPara(servisSatinAlmaToplam)}</td>
              </tr>
              <tr>
                <th>İşçilik toplamı</th>
                <td>{formatPara(iscilikToplam)}</td>
              </tr>
              <tr className="is-emri-doc-totals-grand">
                <th>Genel toplam</th>
                <td>{formatPara(genelToplam)}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      {printImages.length > 0 ? (
        <section className="is-emri-doc-images">
          <WorkOrderImagePrintBlock images={printImages.slice(0, 6)} />
        </section>
      ) : null}

      <footer className="is-emri-doc-signatures">
        <div className="is-emri-doc-signature-col">
          <p className="is-emri-doc-signature-title">Müşteri Onayı</p>
          <div className="is-emri-signature-pad-box" />
          <p className="is-emri-doc-signature-name">
            {form.musteriImza || "Ad Soyad: _________________________________"}
          </p>
        </div>
        <div className="is-emri-doc-signature-col">
          <p className="is-emri-doc-signature-title">Servis Yetkilisi</p>
          <div className="is-emri-signature-pad-box" />
          <p className="is-emri-doc-signature-name">
            {form.servisYetkilisi ||
              "Ad Soyad / Unvan: _________________________________"}
          </p>
        </div>
      </footer>

      <p className="is-emri-doc-footer-note">
        Bu belge {BRAND.companyName} servis iş emri kaydıdır. Islak imza ile
        geçerlidir.
      </p>
    </article>
  );
});
