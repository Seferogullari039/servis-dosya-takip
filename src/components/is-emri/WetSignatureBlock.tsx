"use client";

import { fieldClass, labelClass } from "@/components/is-emri/is-emri-form-ui";
import { cn } from "@/lib/utils/cn";

interface WetSignatureBlockProps {
  title: string;
  nameLabel: string;
  name: string;
  onNameChange?: (value: string) => void;
  readOnly?: boolean;
}

/** Islak imza kutusu — çizgili boş alan + okunaklı ad soyad */
export function WetSignatureBlock({
  title,
  nameLabel,
  name,
  onNameChange,
  readOnly = false,
}: WetSignatureBlockProps) {
  return (
    <div className="is-emri-wet-signature">
      <p className="text-sm font-bold text-ink">{title}</p>
      <div
        className="is-emri-signature-pad-box mt-2"
        aria-label={`${title} — kalemle imza alanı`}
      />
      <label className={cn(labelClass(), "mt-3")}>{nameLabel}</label>
      {readOnly ? (
        <p className="mt-1 border-b border-gray-400 pb-1 text-sm font-medium text-ink">
          {name || "\u00a0"}
        </p>
      ) : (
        <input
          className={cn(fieldClass(), "mt-1")}
          value={name}
          onChange={(e) => onNameChange?.(e.target.value)}
          placeholder="Ad soyad (okunaklı)"
        />
      )}
    </div>
  );
}
