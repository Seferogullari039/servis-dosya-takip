"use client";

import { forwardRef } from "react";
import { WorkOrderImagePrintBlock } from "@/components/is-emri/WorkOrderImagePrintBlock";
import { BRAND } from "@/lib/brand";
import { calcParcaSatirToplam } from "@/lib/is-emri/calculations";
import { formatPara } from "@/lib/utils/para";
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

function PrintSection({
  no,
  title,
  children,
}: {
  no: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="is-emri-doc-section">
      <div className="is-emri-doc-section-head">
        <span className="is-emri-doc-section-no">{no}</span>
        <h2 className="is-emri-doc-section-title">{title}</h2>
      </div>
      {children}
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
  const parcalar = form.parcalar.filter(
    (p) => p.parcaAdi.trim() || p.adet.trim() || p.birimFiyat.trim()
  );
  const iscilik = form.iscilikSatirlari.filter(
    (s) => s.aciklama.trim() || s.tutar.trim()
  );

  return (
    <article
      ref={ref}
      className="is-emri-print-document is-emri-print-document-screen"
      aria-label="İş emri yazdırma formu"
    >
      <header className="is-emri-doc-header">
        <div className="is-emri-doc-header-main">
          <p className="is-emri-doc-company">{BRAND.companyName}</p>
          <h1 className="is-emri-doc-title">Servis İş Emri</h1>
        </div>
        <div className="is-emri-doc-meta">
          <div>
            <span className="is-emri-doc-meta-label">İş emri no</span>
            <span className="is-emri-doc-meta-value">{isEmriNo}</span>
          </div>
          <div>
            <span className="is-emri-doc-meta-label">Giriş tarihi</span>
            <span className="is-emri-doc-meta-value">
              {formatTarih(form.serviseGirisTarihi)}
            </span>
          </div>
          <div>
            <span className="is-emri-doc-meta-label">Araç durumu</span>
            <span className="is-emri-doc-meta-value">{form.aracDurumu}</span>
          </div>
        </div>
      </header>

      <PrintSection no="1" title="Müşteri bilgileri">
        <InfoGrid
          rows={[
            { label: "Ruhsat sahibi", value: form.ruhsatSahibi },
            { label: "Telefon", value: form.telefon },
            { label: "Plaka", value: form.plaka },
          ]}
        />
      </PrintSection>

      <PrintSection no="2" title="Araç bilgileri">
        <InfoGrid
          rows={[
            { label: "Marka / Model", value: `${form.marka} ${form.model}`.trim() },
            { label: "KM", value: form.km },
            { label: "Servise giriş", value: formatTarih(form.serviseGirisTarihi) },
          ]}
        />
      </PrintSection>

      <PrintSection no="3" title="Ekspertiz kontrol listesi">
        <table className="is-emri-doc-table is-emri-doc-table-compact">
          <thead>
            <tr>
              <th className="w-10">✓</th>
              <th>Kontrol</th>
              <th>Not</th>
            </tr>
          </thead>
          <tbody>
            {form.ekspertizChecklist.map((item) => (
              <tr key={item.key}>
                <td className="text-center font-bold">
                  {item.checked ? "✓" : "—"}
                </td>
                <td>{item.label}</td>
                <td>{item.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PrintSection>

      <PrintSection no="4" title="Parça listesi">
        {parcalar.length === 0 ? (
          <p className="is-emri-doc-empty">Parça kaydı yok.</p>
        ) : (
          <table className="is-emri-doc-table">
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
          <table className="is-emri-doc-table">
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

      <section className="is-emri-doc-totals">
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

      {form.ekspertizAlani.trim() ? (
        <section className="is-emri-doc-notes">
          <p className="is-emri-doc-note-label">Ekspertiz / servis notları</p>
          <p className="is-emri-doc-note-text">{form.ekspertizAlani}</p>
        </section>
      ) : null}

      {printImages.length > 0 ? (
        <section className="is-emri-doc-images">
          <WorkOrderImagePrintBlock images={printImages.slice(0, 6)} />
        </section>
      ) : null}

      <footer className="is-emri-doc-signatures">
        <div className="is-emri-doc-signature-col">
          <p className="is-emri-doc-signature-title">Müşteri İmzası</p>
          <div className="is-emri-signature-pad-box" />
          <p className="is-emri-doc-signature-name">
            {form.musteriImza || "Ad Soyad: _________________________"}
          </p>
        </div>
        <div className="is-emri-doc-signature-col">
          <p className="is-emri-doc-signature-title">Servis Yetkilisi</p>
          <div className="is-emri-signature-pad-box" />
          <p className="is-emri-doc-signature-name">
            {form.servisYetkilisi || "Ad Soyad / Unvan: ___________________"}
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
