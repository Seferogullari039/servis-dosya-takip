export const THEME_STORAGE_KEY = "servis-theme";

export type ThemePreference = "light" | "dark" | "system";

export function resolveDark(pref: ThemePreference): boolean {
  if (pref === "dark") return true;
  if (pref === "light") return false;
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyThemeClass(pref: ThemePreference): void {
  const root = document.documentElement;
  root.classList.toggle("dark", resolveDark(pref));
}
