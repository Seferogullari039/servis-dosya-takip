"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  uploadWorkOrderImageAction,
  type UploadWorkOrderImageState,
} from "@/app/(dashboard)/is-emirleri/[id]/image-actions";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/DataState";
import {
  DEFAULT_IMAGE_CATEGORY,
  WORK_ORDER_IMAGE_CATEGORIES,
  type WorkOrderImageCategory,
} from "@/types/work-order-image";
import { cn } from "@/lib/utils/cn";

const initialState: UploadWorkOrderImageState = {};

interface WorkOrderImageUploadProps {
  workOrderId: string;
}

export function WorkOrderImageUpload({ workOrderId }: WorkOrderImageUploadProps) {
  const router = useRouter();
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<WorkOrderImageCategory>(
    DEFAULT_IMAGE_CATEGORY
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (prev: UploadWorkOrderImageState, formData: FormData) => {
      if (pendingFile) {
        formData.set("file", pendingFile);
      }
      const result = await uploadWorkOrderImageAction(prev, formData);
      if (result.success) {
        clearPreview();
        router.refresh();
      }
      return result;
    },
    initialState
  );

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const handleFilePick = (file: File | undefined) => {
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <form
      action={formAction}
      className="rounded-xl border border-dashed border-border bg-surface-muted/40 p-4 sm:p-5"
    >
      <input type="hidden" name="workOrderId" value={workOrderId} />
      <input type="hidden" name="category" value={category} />

      <p className="text-sm font-semibold text-ink">Görsel yükle</p>
      <p className="mt-0.5 text-xs text-ink-muted">
        Hasar, ekspertiz ve parça fotoğraflarını kameradan veya galeriden ekleyin.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wo-image-category" className="text-sm font-medium text-ink">
            Kategori
          </label>
          <select
            id="wo-image-category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as WorkOrderImageCategory)
            }
            className="h-12 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {WORK_ORDER_IMAGE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="wo-image-note" className="text-sm font-medium text-ink">
            Not / açıklama
          </label>
          <input
            id="wo-image-note"
            name="note"
            type="text"
            placeholder="Örn. ön tampon hasarı"
            className="h-12 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      <div
        className={cn(
          "mt-4 flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface p-4",
          previewUrl && "border-accent/40"
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Önizleme"
            className="max-h-48 w-full max-w-sm rounded-lg object-contain"
          />
        ) : (
          <p className="text-center text-sm text-ink-muted">
            Fotoğraf çekin veya galeriden seçin (max 10 MB)
          </p>
        )}

        <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:justify-center">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => handleFilePick(e.target.files?.[0])}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleFilePick(e.target.files?.[0])}
          />
          <Button
            type="button"
            className="min-h-12 w-full text-base sm:flex-1"
            onClick={() => cameraRef.current?.click()}
          >
            Kamera
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-12 w-full text-base sm:flex-1"
            onClick={() => galleryRef.current?.click()}
          >
            Galeri
          </Button>
        </div>
      </div>

      {state.error ? (
        <div className="mt-3">
          <ErrorState title="Yükleme hatası" description={state.error} />
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={isPending || !pendingFile}
          className="min-h-11 flex-1 sm:flex-none"
        >
          {isPending ? "Yükleniyor…" : "Yükle"}
        </Button>
        {previewUrl ? (
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            disabled={isPending}
            onClick={clearPreview}
          >
            İptal
          </Button>
        ) : null}
      </div>
    </form>
  );
}
