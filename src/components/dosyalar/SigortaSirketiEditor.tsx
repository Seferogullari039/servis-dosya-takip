"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSigortaSirketiAction } from "@/app/(dashboard)/dosyalar/actions";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import {
  SIGORTA_SIRKETLERI,
  SIGORTA_SIRKETI_DIGER,
} from "@/lib/constants/sigorta-sirketleri";

interface SigortaSirketiEditorProps {
  dosyaId: string;
  value: string;
}

function initialSelect(value: string): string {
  if (!value.trim()) return "";
  if ((SIGORTA_SIRKETLERI as readonly string[]).includes(value)) return value;
  return SIGORTA_SIRKETI_DIGER;
}

export function SigortaSirketiEditor({ dosyaId, value }: SigortaSirketiEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [select, setSelect] = useState(initialSelect(value));
  const [diger, setDiger] = useState(
    select === SIGORTA_SIRKETI_DIGER ? value : ""
  );

  const handleSave = () => {
    const next =
      select === SIGORTA_SIRKETI_DIGER ? diger.trim() : select.trim();
    startTransition(async () => {
      const result = await updateSigortaSirketiAction(dosyaId, next);
      if (!result.ok) {
        toast(result.error ?? "Sigorta şirketi güncellenemedi.", "error");
        return;
      }
      toast("Sigorta şirketi güncellendi.", "success");
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <Select
        label="Sigorta Şirketi"
        options={["", ...SIGORTA_SIRKETLERI]}
        value={select}
        onChange={(e) => setSelect(e.target.value)}
      />
      {select === SIGORTA_SIRKETI_DIGER ? (
        <Input
          label="Sigorta şirketi (diğer)"
          value={diger}
          onChange={(e) => setDiger(e.target.value)}
          placeholder="Sigorta şirketi adını yazın"
        />
      ) : null}
      <Button type="button" variant="secondary" disabled={pending} onClick={handleSave}>
        {pending ? "Kaydediliyor…" : "Sigorta şirketini kaydet"}
      </Button>
    </div>
  );
}
