"use client";

import { Input } from "@/components/ui/Input";

interface DosyaAramaProps {
  value: string;
  onChange: (value: string) => void;
}

export function DosyaArama({ value, onChange }: DosyaAramaProps) {
  return (
    <Input
      label="Plaka veya dosya numarası ile ara"
      placeholder="Örn: 34 ABC 123 veya SD-2026-0142"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
