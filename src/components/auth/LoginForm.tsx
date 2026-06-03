"use client";

import { useActionState, type CSSProperties, type ReactNode } from "react";
import { loginAction, type LoginState } from "@/lib/auth/actions";
import { LoginAlert } from "@/components/auth/LoginAlert";
import { LoginBrandMark } from "@/components/auth/LoginBrandMark";
import { cn } from "@/lib/utils/cn";

const initialState: LoginState = {};

const BRAND_BLUE = "#0F4C81";
const BRAND_BLUE_HOVER = "#0d4069";

const inputClassName = cn(
  "h-12 w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-11 pr-4 text-sm text-white",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[border-color,box-shadow,background-color]",
  "placeholder:text-white/30",
  "hover:border-[#4a9fd4]/35 hover:bg-white/[0.07]",
  "focus:border-[#4a9fd4]/60 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#0F4C81]/45"
);

interface LoginFormProps {
  redirectTo?: string;
  reasonMessage?: string | null;
}

function InputIcon({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6eb5e8]/80">
      {children}
    </span>
  );
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
          "login-glass-card rounded-2xl border border-[#4a9fd4]/25 bg-white/[0.05] p-6 backdrop-blur-2xl",
          "shadow-[0_24px_64px_rgba(0,0,0,0.45),0_0_0_1px_rgba(74,159,212,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]",
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
            <div className="relative">
              <InputIcon>
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
                  <path
                    d="M3.5 6.5 10 11l6.5-4.5M4 15h12a1.5 1.5 0 001.5-1.5v-8A1.5 1.5 0 0016 4H4A1.5 1.5 0 002.5 5.5v8A1.5 1.5 0 004 15z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </InputIcon>
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
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-white/75"
            >
              Şifre
            </label>
            <div className="relative">
              <InputIcon>
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
                  <rect
                    x="4"
                    y="9"
                    width="12"
                    height="8"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                  <path
                    d="M7 9V6.5a3 3 0 016 0V9"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <circle cx="10" cy="13" r="1" fill="currentColor" />
                </svg>
              </InputIcon>
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
              "login-submit-btn relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 text-sm font-semibold text-white",
              "bg-gradient-to-r from-[#0F4C81] via-[#1565a8] to-[#0F4C81] bg-[length:200%_100%]",
              "shadow-[0_10px_28px_rgba(15,76,129,0.45),inset_0_1px_0_rgba(255,255,255,0.15)]",
              "ring-1 ring-[#4a9fd4]/30 transition-[background-position,transform,box-shadow,opacity] duration-300",
              "hover:bg-[position:100%_0] hover:shadow-[0_12px_32px_rgba(15,76,129,0.55)]",
              "active:scale-[0.99] disabled:pointer-events-none disabled:opacity-65",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a9fd4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1830]"
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
