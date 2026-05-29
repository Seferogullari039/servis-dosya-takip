"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  createDosyaAction,
  type CreateDosyaState,
} from "@/app/(dashboard)/dosyalar/actions";
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

export function DosyaForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createDosyaAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <ErrorState title="Kayıt başarısız" description={state.error} />
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
