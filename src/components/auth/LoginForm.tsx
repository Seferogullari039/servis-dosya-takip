"use client";

import { useActionState } from "react";
import { BRAND } from "@/lib/brand";
import { loginAction, type LoginState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/DataState";
import { Input } from "@/components/ui/Input";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const initialState: LoginState = {};

interface LoginFormProps {
  redirectTo?: string;
  reasonMessage?: string | null;
}

export function LoginForm({ redirectTo = "/", reasonMessage }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -top-14 right-0">
        <ThemeToggle showLabel />
      </div>
      <Card className="w-full">
      <CardHeader className="text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">
          {BRAND.companyName}
        </p>
        <CardTitle className="mt-1">{BRAND.appTagline}</CardTitle>
        <p className="mt-2 text-sm text-ink-muted">Personel girişi</p>
      </CardHeader>

      {reasonMessage && (
        <div className="mb-4">
          <ErrorState title="Oturum gerekli" description={reasonMessage} />
        </div>
      )}

      {state.error && (
        <div className="mb-4">
          <ErrorState title="Giriş başarısız" description={state.error} />
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Input
          label="E-posta"
          name="email"
          type="email"
          placeholder="personel@servis.com"
          autoComplete="email"
          required
        />
        <Input
          label="Şifre"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        <Button type="submit" fullWidth disabled={isPending}>
          {isPending ? "Giriş yapılıyor…" : "Giriş Yap"}
        </Button>
      </form>
      </Card>
    </div>
  );
}
