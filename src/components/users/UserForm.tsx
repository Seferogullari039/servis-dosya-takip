"use client";

import { useActionState } from "react";
import {
  createUserAction,
  resetPasswordAction,
  updateUserAction,
} from "@/app/(dashboard)/kullanicilar/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { LoginAlert } from "@/components/auth/LoginAlert";
import type { ManagedUser, UserOperationResult } from "@/types/managed-user";
import type { UserRole } from "@/lib/auth/types";

const emptyResult: UserOperationResult = { ok: true };

interface UserFormProps {
  mode: "create" | "edit";
  user?: ManagedUser;
}

export function UserForm({ mode, user }: UserFormProps) {
  const [updateState, updateAction, updatePending] = useActionState(
    updateUserAction,
    emptyResult
  );
  const [createState, createAction, createPending] = useActionState(
    createUserAction,
    emptyResult
  );
  const [resetState, resetAction, resetPending] = useActionState(
    resetPasswordAction,
    emptyResult
  );

  const isCreate = mode === "create";
  const mainState = isCreate ? createState : updateState;
  const error = !mainState.ok
    ? mainState.error
    : !resetState.ok
      ? resetState.error
      : null;

  const defaultRole: UserRole = user?.role ?? "personel";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {error ? (
        <LoginAlert variant="error" title="İşlem başarısız" description={error} />
      ) : null}

      <Card>
        <form
          action={isCreate ? createAction : updateAction}
          className="space-y-4"
        >
          {!isCreate && user ? (
            <input type="hidden" name="id" value={user.id} />
          ) : null}

          <Input
            label="Ad Soyad"
            name="full_name"
            required
            defaultValue={user?.full_name ?? ""}
            placeholder="Ad Soyad"
          />

          {isCreate ? (
            <>
              <Input
                label="E-posta"
                name="email"
                type="email"
                required
                placeholder="personel@servis.com"
                autoComplete="off"
              />
              <Input
                label="Şifre"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="En az 8 karakter, büyük/küçük, rakam, özel"
                autoComplete="new-password"
              />
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">E-posta</span>
              <p className="rounded-lg border border-border bg-surface-muted px-3 py-2.5 text-sm text-ink-muted">
                {user?.email}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role" className="text-sm font-medium text-ink">
              Rol
            </label>
            <select
              id="role"
              name="role"
              defaultValue={defaultRole}
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="personel">Personel</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface-muted/50 px-3 py-3">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={user?.is_active ?? true}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm text-ink">Aktif kullanıcı</span>
          </label>

          <Button
            type="submit"
            fullWidth
            disabled={isCreate ? createPending : updatePending}
          >
            {isCreate
              ? createPending
                ? "Oluşturuluyor…"
                : "Kullanıcı Oluştur"
              : updatePending
                ? "Kaydediliyor…"
                : "Kaydet"}
          </Button>
        </form>
      </Card>

      {!isCreate && user ? (
        <Card>
          <h2 className="text-base font-semibold text-ink">Şifre sıfırla</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Yeni şifre kullanıcıya iletilmelidir.
          </p>
          <form action={resetAction} className="mt-4 space-y-4">
            <input type="hidden" name="id" value={user.id} />
            <Input
              label="Yeni şifre"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="En az 8 karakter, büyük/küçük, rakam, özel"
              autoComplete="new-password"
            />
            <Button type="submit" variant="secondary" fullWidth disabled={resetPending}>
              {resetPending ? "Sıfırlanıyor…" : "Şifreyi Sıfırla"}
            </Button>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
