"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  createDosyaAction,
  type CreateDosyaState,
} from "@/app/(dashboard)/dosyalar/actions";
import { SigortaSirketiField } from "@/components/dosyalar/SigortaSirketiField";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ErrorState } from "@/components/ui/DataState";
import {
  DOSYA_DURUMLARI,
  ODEME_DURUMLARI,
} from "@/types/servis-dosya";

const initialState: CreateDosyaState = {};

interface DosyaFormProps {
  isAdmin?: boolean;
}

export function DosyaForm({ isAdmin = false }: DosyaFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createDosyaAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="space-y-3">
          <ErrorState title="Kayıt başarısız" description={state.error} />
          {isAdmin && state.debug ? (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/50"
              role="region"
              aria-label="Hata debug bilgisi"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-red-800 dark:text-red-200">
                Debug (yalnızca admin)
              </p>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-red-100/80 p-3 font-mono text-xs text-red-900 dark:bg-red-950 dark:text-red-100">
                {JSON.stringify(state.debug, null, 2)}
              </pre>
            </div>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="Dosya Numarası"
          name="dosyaNo"
          error={state.fieldErrors?.dosyaNo}
          placeholder="SD-2026-0001"
          required
        />
        <Input
          label="Plaka"
          name="plaka"
          error={state.fieldErrors?.plaka}
          placeholder="34 ABC 123"
          required
        />
        <Input
          label="Müşteri Adı"
          name="musteriAdi"
          error={state.fieldErrors?.musteriAdi}
          required
        />
        <Input
          label="Telefon"
          name="telefon"
          error={state.fieldErrors?.telefon}
          placeholder="05XX XXX XX XX"
          required
        />
        <Input
          label="Araç Marka / Model"
          name="aracMarkaModel"
        />
        <Input label="Eksper Adı" name="eksperAdi" />
        <SigortaSirketiField />
        <Select
          label="Durum"
          name="durum"
          options={DOSYA_DURUMLARI}
          defaultValue="Yeni Açıldı"
          error={state.fieldErrors?.durum}
        />
        <Select
          label="Ödeme Durumu"
          name="odemeDurumu"
          options={ODEME_DURUMLARI}
          defaultValue="Ödenmedi"
          error={state.fieldErrors?.odemeDurumu}
        />
        <Input
          label="Dosya tutarı (TL, isteğe bağlı)"
          name="dosyaTutari"
          placeholder="ör. 25000"
        />
        <div className="md:col-span-2">
          <Textarea label="Notlar" name="notlar" rows={4} />
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/dosyalar")}
          disabled={isPending}
        >
          İptal
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor…" : "Dosyayı Kaydet"}
        </Button>
      </div>
    </form>
  );
}
