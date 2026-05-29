"use client";

import { useEffect, useRef, useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import {
  finalizeDosyaSilmeAction,
  restoreDosyaAction,
  softSilDosyaAction,
} from "@/app/(dashboard)/dosyalar/actions";
const SOFT_DELETE_GRACE_MS = 10_000;
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils/cn";

const CONFIRM_MESSAGE =
  "Bu dosyayı silmek istediğinize emin misiniz? 10 saniye içinde geri alabilirsiniz.";

interface DosyaDeleteButtonProps {
  dosyaId: string;
  compact?: boolean;
  className?: string;
  onSoftDeleted?: (id: string) => void;
  onRestored?: (id: string) => void;
}

export function DosyaDeleteButton({
  dosyaId,
  compact = false,
  className,
  onSoftDeleted,
  onRestored,
}: DosyaDeleteButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const finalizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (finalizeTimerRef.current) {
        clearTimeout(finalizeTimerRef.current);
      }
    };
  }, []);

  const scheduleFinalize = (id: string) => {
    if (finalizeTimerRef.current) {
      clearTimeout(finalizeTimerRef.current);
    }
    finalizeTimerRef.current = setTimeout(() => {
      finalizeTimerRef.current = null;
      void finalizeDosyaSilmeAction(id);
    }, SOFT_DELETE_GRACE_MS);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(CONFIRM_MESSAGE)) return;

    startTransition(async () => {
      const result = await softSilDosyaAction(dosyaId);
      if (!result.ok) {
        toast(result.error ?? "Dosya silinemedi.", "error");
        return;
      }

      onSoftDeleted?.(dosyaId);
      scheduleFinalize(dosyaId);

      toast("Dosya silindi.", {
        variant: "success",
        durationMs: SOFT_DELETE_GRACE_MS,
        action: {
          label: "Geri al",
          onClick: () => {
            if (finalizeTimerRef.current) {
              clearTimeout(finalizeTimerRef.current);
              finalizeTimerRef.current = null;
            }
            startTransition(async () => {
              const restoreResult = await restoreDosyaAction(dosyaId);
              if (!restoreResult.ok) {
                toast(restoreResult.error ?? "Dosya geri alınamadı.", "error");
                return;
              }
              toast("Dosya geri alındı.", "success");
              onRestored?.(dosyaId);
              router.refresh();
            });
          },
        },
      });

      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="danger"
      disabled={pending}
      onClick={handleClick}
      className={cn(compact && "h-8 px-2.5 text-xs", className)}
      aria-label="Dosyayı sil"
    >
      {pending ? "Siliniyor…" : "Sil"}
    </Button>
  );
}
