"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DosyaArama } from "@/components/dosyalar/DosyaArama";

interface DosyaAramaUrlProps {
  defaultValue?: string;
}

export function DosyaAramaUrl({ defaultValue = "" }: DosyaAramaUrlProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const pushSearch = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = next.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `/dosyalar?${qs}` : "/dosyalar");
      });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== (defaultValue ?? "")) {
        pushSearch(value);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [value, defaultValue, pushSearch]);

  return (
    <div>
      <DosyaArama value={value} onChange={setValue} />
      {isPending && (
        <p className="mt-1 text-xs text-ink-faint">Aranıyor…</p>
      )}
    </div>
  );
}
