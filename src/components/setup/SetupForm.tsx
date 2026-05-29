"use client";

import { useActionState } from "react";
import { saveEnvAction, type SetupEnvState } from "@/app/setup/actions";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/DataState";

const initial: SetupEnvState = {};

interface SetupFormProps {
  saved?: boolean;
}

export function SetupForm({ saved }: SetupFormProps) {
  const [state, action, pending] = useActionState(saveEnvAction, initial);

  if (saved) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase kurulumu</CardTitle>
        <p className="mt-2 text-sm text-ink-muted">
          Proje URL kayıtlı:{" "}
          <code className="rounded bg-surface-muted px-1 text-xs">
            adtweartmsfwtuuhhqtr.supabase.co
          </code>
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Supabase Dashboard → <strong>Project Settings → API</strong> bölümünden
          key&apos;leri, <strong>Settings → Database</strong> bölümünden veritabanı
          şifresini kopyalayıp yapıştırın.
        </p>
      </CardHeader>

      {state.error && (
        <div className="mb-4">
          <ErrorState title="Kaydedilemedi" description={state.error} />
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            anon public key
          </label>
          <textarea
            name="anonKey"
            required
            rows={3}
            className="w-full rounded-lg border border-border p-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            placeholder="eyJhbGciOiJIUzI1NiIs..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            service_role key (secret)
          </label>
          <textarea
            name="serviceKey"
            required
            rows={3}
            className="w-full rounded-lg border border-border p-2 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            placeholder="eyJhbGciOiJIUzI1NiIs..."
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Database password
          </label>
          <input
            name="dbPassword"
            type="password"
            required
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            placeholder="Supabase → Settings → Database"
          />
          <p className="mt-1 text-xs text-ink-faint">
            Migration&apos;lar (001–007) otomatik çalıştırılır; profiles tablosu
            bu adımda oluşturulur.
          </p>
        </div>
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet ve devam et"}
        </Button>
      </form>
    </Card>
  );
}
