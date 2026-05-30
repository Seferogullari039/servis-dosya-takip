"use client";

import { useActionState, type CSSProperties } from "react";
import { loginAction, type LoginState } from "@/lib/auth/actions";
import { LoginAlert } from "@/components/auth/LoginAlert";
import { LoginBrandMark } from "@/components/auth/LoginBrandMark";
import { cn } from "@/lib/utils/cn";

const initialState: LoginState = {};

const BRAND_BLUE = "#0F4C81";
const BRAND_BLUE_HOVER = "#0d4069";

const inputClassName = cn(
  "h-12 w-full min-w-0 rounded-xl border border-white/15 bg-white/[0.06] px-4 text-sm text-white shadow-inner shadow-black/10",
  "placeholder:text-white/35 transition-[border-color,box-shadow,background-color]",
  "hover:border-white/25 hover:bg-white/[0.08]",
  "focus:border-[#3d7ab5] focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/40"
);

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
    <div className="w-full max-w-[26rem]">
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl",
          "sm:p-8"
        )}
      >
        <header className="mb-8 text-center">
          <LoginBrandMark />
          <h1 className="mt-5 text-xl font-bold tracking-tight text-white sm:text-[1.35rem]">
            Seferoğulları Otomotiv
          </h1>
          <p className="mt-1.5 text-sm font-medium text-white/80">
            Servis Dosya Takip Sistemi
          </p>
          <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
            Personel giriş paneli
          </p>
        </header>

        <div className="space-y-4">
          {reasonMessage ? (
            <LoginAlert
              variant="info"
              title="Oturum gerekli"
              description={reasonMessage}
            />
          ) : null}

          {state.error ? (
            <LoginAlert
              variant="error"
              title="Giriş başarısız"
              description={state.error}
            />
          ) : null}
        </div>

        <form action={formAction} className="mt-6 space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-email"
              className="text-sm font-medium text-white/75"
            >
              E-posta
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="personel@servis.com"
              autoComplete="email"
              required
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-white/75"
            >
              Şifre
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className={inputClassName}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={
              {
                "--login-btn": BRAND_BLUE,
                "--login-btn-hover": BRAND_BLUE_HOVER,
              } as CSSProperties
            }
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white",
              "bg-[var(--login-btn)] shadow-lg shadow-[#0F4C81]/25",
              "transition-[background-color,transform,box-shadow,opacity]",
              "hover:bg-[var(--login-btn-hover)] hover:shadow-[#0F4C81]/35",
              "active:scale-[0.99] disabled:pointer-events-none disabled:opacity-65",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d7ab5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1a2e]"
            )}
          >
            {isPending ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden
                />
                Giriş yapılıyor…
              </>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-white/40">
        Yetkiler hesap rolüne göre belirlenir.
        <br />
        <a
          href="/kvkk"
          className="text-[#5ba3d4] underline-offset-2 hover:text-white hover:underline"
        >
          KVKK Aydınlatma Metni
        </a>
        {" · "}
        <a
          href="/gizlilik"
          className="text-[#5ba3d4] underline-offset-2 hover:text-white hover:underline"
        >
          Gizlilik Politikası
        </a>
      </p>
    </div>
  );
}
