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
  formatFileSize,
  optimizeWorkOrderImage,
  type OptimizeProgress,
} from "@/lib/images/work-order-image-optimize";
import {
  DEFAULT_IMAGE_CATEGORY,
  WORK_ORDER_IMAGE_CATEGORIES,
  type WorkOrderImageCategory,
} from "@/types/work-order-image";
import { cn } from "@/lib/utils/cn";

const initialState: UploadWorkOrderImageState = {};

const PHASE_LABEL: Record<OptimizeProgress["phase"], string> = {
  reading: "Görsel okunuyor…",
  resizing: "Boyutlandırılıyor…",
  compressing: "Optimize ediliyor…",
};

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
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeProgress, setOptimizeProgress] = useState(0);
  const [optimizePhase, setOptimizePhase] = useState<OptimizeProgress["phase"] | null>(
    null
  );
  const [sizeHint, setSizeHint] = useState<string | null>(null);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);

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
    setSizeHint(null);
    setOptimizeError(null);
    setOptimizeProgress(0);
    setOptimizePhase(null);
    if (cameraRef.current) cameraRef.current.value = "";
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const handleFilePick = async (file: File | undefined) => {
    if (!file) return;
    setOptimizeError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPendingFile(null);
    setSizeHint(null);
    setOptimizing(true);
    setOptimizeProgress(5);
    setOptimizePhase("reading");

    try {
      const result = await optimizeWorkOrderImage(file, (p) => {
        setOptimizePhase(p.phase);
        setOptimizeProgress(p.percent);
      });
      setPendingFile(result.file);
      setPreviewUrl(result.previewUrl);
      setSizeHint(
        `${formatFileSize(result.originalSize)} → ${formatFileSize(result.optimizedSize)} · ${result.width}×${result.height}`
      );
    } catch (e) {
      setOptimizeError(
        e instanceof Error ? e.message : "Görsel optimize edilemedi."
      );
    } finally {
      setOptimizing(false);
      setOptimizePhase(null);
    }
  };

  const busy = optimizing || isPending;

  return (
    <form
      action={formAction}
      className="rounded-xl border border-dashed border-border bg-surface-muted/40 p-4 sm:p-5"
    >
      <input type="hidden" name="workOrderId" value={workOrderId} />
      <input type="hidden" name="category" value={category} />

      <p className="text-sm font-semibold text-ink dark:text-zinc-100">
        Görsel yükle
      </p>
      <p className="mt-0.5 text-xs text-ink-muted dark:text-zinc-400">
        Fotoğraflar yüklemeden önce otomatik optimize edilir (max 1600px, WebP/JPEG).
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="wo-image-category"
            className="text-sm font-medium text-ink dark:text-zinc-200"
          >
            Kategori
          </label>
          <select
            id="wo-image-category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as WorkOrderImageCategory)
            }
            disabled={busy}
            className="h-12 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-100"
          >
            {WORK_ORDER_IMAGE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="wo-image-note"
            className="text-sm font-medium text-ink dark:text-zinc-200"
          >
            Not / açıklama
          </label>
          <input
            id="wo-image-note"
            name="note"
            type="text"
            placeholder="Örn. ön tampon hasarı"
            disabled={busy}
            className="h-12 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 dark:border-zinc-600 dark:bg-zinc-900/50 dark:text-zinc-100"
          />
        </div>
      </div>

      <div
        className={cn(
          "mt-4 flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface p-4 dark:border-zinc-600 dark:bg-zinc-900/30",
          previewUrl && "border-accent/40"
        )}
      >
        {optimizing ? (
          <div className="w-full max-w-sm space-y-2 px-2">
            <p className="text-center text-sm font-medium text-ink dark:text-zinc-200">
              Optimize ediliyor…
            </p>
            <p className="text-center text-xs text-ink-muted dark:text-zinc-400">
              {optimizePhase ? PHASE_LABEL[optimizePhase] : "Hazırlanıyor…"}
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-border dark:bg-zinc-700">
              <div
                className="h-full bg-accent transition-all duration-200"
                style={{ width: `${Math.max(optimizeProgress, 8)}%` }}
              />
            </div>
          </div>
        ) : previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Önizleme"
              className="max-h-48 w-full max-w-sm rounded-lg object-contain"
            />
            {sizeHint ? (
              <p className="text-center text-xs text-ink-muted dark:text-zinc-400">
                {sizeHint}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-center text-sm text-ink-muted dark:text-zinc-400">
            Fotoğraf çekin veya galeriden seçin
          </p>
        )}

        <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:justify-center">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            disabled={busy}
            onChange={(e) => void handleFilePick(e.target.files?.[0])}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={busy}
            onChange={(e) => void handleFilePick(e.target.files?.[0])}
          />
          <Button
            type="button"
            className="min-h-12 w-full text-base sm:flex-1"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
          >
            Kamera
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-12 w-full text-base sm:flex-1"
            disabled={busy}
            onClick={() => galleryRef.current?.click()}
          >
            Galeri
          </Button>
        </div>
      </div>

      {optimizeError ? (
        <div className="mt-3">
          <ErrorState title="Optimizasyon hatası" description={optimizeError} />
        </div>
      ) : null}

      {state.error ? (
        <div className="mt-3">
          <ErrorState title="Yükleme hatası" description={state.error} />
        </div>
      ) : null}

      {isPending ? (
        <div className="mt-3 space-y-1">
          <p className="text-center text-sm text-ink-muted dark:text-zinc-400">
            Sunucuya yükleniyor…
          </p>
          <div className="mx-auto h-1.5 max-w-xs overflow-hidden rounded-full bg-border dark:bg-zinc-700">
            <div className="h-full w-2/3 animate-pulse bg-accent" />
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={busy || !pendingFile}
          className="min-h-11 flex-1 sm:flex-none"
        >
          {isPending ? "Yükleniyor…" : optimizing ? "Optimize…" : "Yükle"}
        </Button>
        {previewUrl || pendingFile ? (
          <Button
            type="button"
            variant="ghost"
            className="min-h-11"
            disabled={busy}
            onClick={clearPreview}
          >
            İptal
          </Button>
        ) : null}
      </div>
    </form>
  );
}
