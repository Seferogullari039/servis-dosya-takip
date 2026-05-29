/** Uygulama ve PDF marka bilgileri */
export const BRAND = {
  companyName: "Seferoğulları Otomotiv",
  appTagline: "Dosya Takip Sistemi",
  panelSubtitle: "Operasyon Paneli",
  /** Sol menü — koyu lacivert (gece modundan bağımsız) */
  sidebarBg: "#0c1a2e",
} as const;

export const PDF_BRAND = {
  companyName: BRAND.companyName,
  blue: "#1d4ed8",
  blueDark: "#1e3a8a",
  blueLight: "#dbeafe",
  blueSoft: "#eff6ff",
  dotColor: "#ffffff",
} as const;
