"use client";

import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  uploadDocumentAction,
  type UploadDocumentState,
} from "@/app/(dashboard)/dosyalar/[id]/document-actions";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/DataState";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  UPLOAD_LIMITS,
} from "@/types/documents";

const initialState: UploadDocumentState = {};

interface DocumentUploadFormProps {
  serviceFileId: string;
}

export function DocumentUploadForm({ serviceFileId }: DocumentUploadFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [state, formAction, isPending] = useActionState(
    async (prev: UploadDocumentState, formData: FormData) => {
      setProgress(30);
      const result = await uploadDocumentAction(prev, formData);
      setProgress(result.success ? 100 : 0);
      if (result.success) {
        fileRef.current && (fileRef.current.value = "");
        router.refresh();
      }
      return result;
    },
    initialState
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-dashed border-border bg-surface-muted/50 p-4">
      <input type="hidden" name="serviceFileId" value={serviceFileId} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-medium text-ink">
            Kategori
          </label>
          <select
            id="category"
            name="category"
            defaultValue="diger"
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            {DOCUMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {DOCUMENT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Dosya</label>
          <input
            ref={fileRef}
            type="file"
            name="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
            required
            className="block w-full text-sm text-ink file:mr-3 file:rounded-lg file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
            onChange={() => setProgress(0)}
          />
          <p className="text-xs text-ink-faint">
            PDF max 15 MB · Görsel max 10 MB (JPG, PNG, WEBP)
          </p>
        </div>
      </div>

      {isPending && (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${Math.max(progress, 15)}%` }}
            />
          </div>
          <p className="text-xs text-ink-muted">Yükleniyor…</p>
        </div>
      )}

      {state.error && (
        <ErrorState title="Yükleme başarısız" description={state.error} />
      )}

      {state.success && (
        <p className="text-sm text-emerald-700">Dosya başarıyla yüklendi.</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Yükleniyor…" : "Evrak Yükle"}
      </Button>

      <p className="text-xs text-ink-faint">
        Limitler: PDF {(UPLOAD_LIMITS.pdf / 1024 / 1024).toFixed(0)} MB, görsel{" "}
        {(UPLOAD_LIMITS.image / 1024 / 1024).toFixed(0)} MB
      </p>
    </form>
  );
}
