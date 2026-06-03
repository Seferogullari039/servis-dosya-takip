"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import {
  SIGORTA_SIRKETLERI,
  SIGORTA_SIRKETI_DIGER,
} from "@/lib/constants/sigorta-sirketleri";

interface SigortaSirketiFieldProps {
  defaultValue?: string;
  error?: string;
}

function resolveInitialSelect(value?: string): string {
  if (!value?.trim()) return "";
  if ((SIGORTA_SIRKETLERI as readonly string[]).includes(value)) {
    return value;
  }
  return SIGORTA_SIRKETI_DIGER;
}

function resolveInitialDiger(value?: string, select?: string): string {
  if (select === SIGORTA_SIRKETI_DIGER) {
    return value?.trim() && value !== SIGORTA_SIRKETI_DIGER ? value : "";
  }
  return "";
}

export function SigortaSirketiField({
  defaultValue = "",
  error,
}: SigortaSirketiFieldProps) {
  const initialSelect = resolveInitialSelect(defaultValue);
  const [select, setSelect] = useState(initialSelect);
  const [diger, setDiger] = useState(
    resolveInitialDiger(defaultValue, initialSelect)
  );

  const hiddenValue =
    select === SIGORTA_SIRKETI_DIGER ? diger.trim() : select.trim();

  return (
    <div className="md:col-span-2 space-y-3">
      <Select
        label="Sigorta Şirketi"
        name="sigortaSirketiSelect"
        options={["", ...SIGORTA_SIRKETLERI]}
        value={select}
        onChange={(e) => setSelect(e.target.value)}
        error={error}
      />
      {select === SIGORTA_SIRKETI_DIGER ? (
        <Input
          label="Sigorta şirketi (diğer)"
          name="sigortaSirketiDiger"
          value={diger}
          onChange={(e) => setDiger(e.target.value)}
          placeholder="Sigorta şirketi adını yazın"
        />
      ) : null}
      <input type="hidden" name="sigortaSirketi" value={hiddenValue} />
    </div>
  );
}

export function parseSigortaSirketiFromForm(formData: FormData): string {
  const select = String(formData.get("sigortaSirketiSelect") ?? "").trim();
  if (select === SIGORTA_SIRKETI_DIGER) {
    return String(formData.get("sigortaSirketiDiger") ?? "").trim();
  }
  const hidden = String(formData.get("sigortaSirketi") ?? "").trim();
  if (hidden) return hidden;
  return select;
}
