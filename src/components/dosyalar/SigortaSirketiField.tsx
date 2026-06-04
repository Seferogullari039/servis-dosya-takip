"use client";

import { useState } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import {
  SIGORTA_SIRKETLERI,
  SIGORTA_SIRKETI_DIGER,
} from "@/lib/constants/sigorta-sirketleri";
import {
  resolveSigortaSirketiDiger,
  resolveSigortaSirketiSelect,
} from "@/lib/dosyalar/sigorta-sirketi-form";

interface SigortaSirketiFieldProps {
  defaultValue?: string;
  error?: string;
}

export function SigortaSirketiField({
  defaultValue = "",
  error,
}: SigortaSirketiFieldProps) {
  const initialSelect = resolveSigortaSirketiSelect(defaultValue);
  const [select, setSelect] = useState(initialSelect);
  const [diger, setDiger] = useState(
    resolveSigortaSirketiDiger(defaultValue, initialSelect)
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
