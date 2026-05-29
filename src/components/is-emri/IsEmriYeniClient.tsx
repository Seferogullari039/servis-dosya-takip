"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { kaydetIsEmri } from "@/app/(dashboard)/is-emri/actions";
import { IsEmriForm } from "@/components/is-emri/IsEmriForm";
import { useToast } from "@/components/ui/ToastProvider";
import type { IsEmriFormState } from "@/types/is-emri";

export function IsEmriYeniClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const handleSave = (form: IsEmriFormState) => {
    startTransition(async () => {
      const result = await kaydetIsEmri(form);
      if (!result.ok) {
        toast(result.error ?? "Kayıt başarısız.", "error");
        return;
      }
      toast("İş emri başarıyla kaydedildi.", "success");
      router.push(`/is-emirleri/${result.id}`);
    });
  };

  return <IsEmriForm mode="create" onSave={handleSave} saving={pending} />;
}
