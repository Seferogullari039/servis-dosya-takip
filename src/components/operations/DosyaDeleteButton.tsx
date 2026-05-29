"use client";

import { useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { silDosyaAction } from "@/app/(dashboard)/dosyalar/actions";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils/cn";

const CONFIRM_MESSAGE =
  "Bu dosyayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.";

interface DosyaDeleteButtonProps {
  dosyaId: string;
  compact?: boolean;
  className?: string;
  onDeleted?: (id: string) => void;
}

export function DosyaDeleteButton({
  dosyaId,
  compact = false,
  className,
  onDeleted,
}: DosyaDeleteButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(CONFIRM_MESSAGE)) return;

    startTransition(async () => {
      const result = await silDosyaAction(dosyaId);
      if (!result.ok) {
        toast(result.error ?? "Dosya silinemedi.", "error");
        return;
      }
      toast("Dosya silindi.", "success");
      onDeleted?.(dosyaId);
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
