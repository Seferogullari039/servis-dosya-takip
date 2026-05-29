"use client";

import { useState, useTransition } from "react";
import {
  deleteDocumentAction,
  getDocumentSignedUrlAction,
} from "@/app/(dashboard)/dosyalar/[id]/document-actions";
import { DocumentCategoryBadge } from "@/components/dosyalar/DocumentCategoryBadge";
import { ImagePreviewModal } from "@/components/dosyalar/ImagePreviewModal";
import { Button } from "@/components/ui/Button";
import { formatDosyaBoyutu, formatTarihSaat } from "@/lib/utils/format";
import type { ServiceFileDocument } from "@/types/documents";

interface DocumentCardProps {
  document: ServiceFileDocument;
  serviceFileId: string;
  isAdmin: boolean;
}

export function DocumentCard({
  document: doc,
  serviceFileId,
  isAdmin,
}: DocumentCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function resolveUrl(): Promise<string | null> {
    if (doc.signedUrl) return doc.signedUrl;
    const result = await getDocumentSignedUrlAction(doc.storagePath);
    if (result.error) {
      setError(result.error);
      return null;
    }
    return result.url ?? null;
  }

  async function handleDownload() {
    setError(null);
    const url = await resolveUrl();
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handlePreview() {
    setError(null);
    const url = await resolveUrl();
    if (!url) return;
    if (doc.fileType === "pdf") {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    setPreviewUrl(url);
  }

  function handleDelete() {
    if (!confirm(`"${doc.originalName}" evrakını silmek istiyor musunuz?`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteDocumentAction(doc.id, serviceFileId);
      if (result.error) setError(result.error);
    });
  }

  return (
    <>
      <article className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-ink" title={doc.originalName}>
              {doc.originalName}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              {formatDosyaBoyutu(doc.fileSize)} · {doc.fileType.toUpperCase()}
            </p>
          </div>
          <DocumentCategoryBadge category={doc.category} />
        </div>

        <p className="mt-3 text-xs text-ink-faint">
          {doc.uploaderFullName} · {formatTarihSaat(doc.createdAt)}
        </p>

        {error && (
          <p className="mt-2 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 text-xs sm:flex-none"
            disabled={isPending}
            onClick={handlePreview}
          >
            {doc.fileType === "pdf" ? "PDF Aç" : "Önizle"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="flex-1 text-xs sm:flex-none"
            disabled={isPending}
            onClick={handleDownload}
          >
            İndir
          </Button>
          {isAdmin && (
            <Button
              type="button"
              variant="danger"
              className="text-xs"
              disabled={isPending}
              onClick={handleDelete}
            >
              Sil
            </Button>
          )}
        </div>
      </article>

      {previewUrl && (
        <ImagePreviewModal
          url={previewUrl}
          title={doc.originalName}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </>
  );
}
