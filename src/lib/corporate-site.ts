import { BRAND } from "@/lib/brand";

/** Kurumsal ana sayfa SEO */
export const CORPORATE_SEO = {
  title: "Seferoğulları Otomotiv | Lüleburgaz Sigorta Hasar ve Onarım Merkezi",
  description:
    "Lüleburgaz'da sigorta hasar onarımı, boya kaporta, mekanik servis, ekspertiz ve araç teslim süreçlerinde profesyonel hizmet.",
  keywords: [
    "Seferoğulları Otomotiv",
    "Lüleburgaz oto servis",
    "sigorta hasar onarımı",
    "boya kaporta",
    "mekanik servis",
    "ekspertiz",
    "Kırklareli oto servis",
  ],
} as const;

const ADDRESS_LINES = [
  "Atatürk Mahallesi Yeni Sanayi Sitesi G2 Blok No:21",
  "Lüleburgaz / Kırklareli",
] as const;

const ADDRESS_FULL = ADDRESS_LINES.join(", ");

/** Iframe önizleme sorgusu (embed) */
export const MAPS_LOCATION_QUERY =
  "Atatürk Mahallesi Yeni Sanayi Sitesi G2 Blok No:21 Lüleburgaz Kırklareli";

/** Kart tıklama + Haritada Aç — doğrudan Google Maps konum linki */
export const MAPS_OPEN_HREF =
  "https://maps.app.goo.gl/6kHXwkdsNVmnN9Sy9";

const mapsQueryEncoded = encodeURIComponent(MAPS_LOCATION_QUERY);

/** Kurumsal site iletişim bilgileri */
export const CORPORATE_CONTACT = {
  phoneDisplay: "0288 417 77 40",
  phoneHref: "tel:+902884177740",
  mobileDisplay: "0532 723 29 12",
  whatsappHref: "https://wa.me/905327232912",
  whatsappLabel: "WhatsApp'tan Ulaş",
  addressLines: ADDRESS_LINES,
  addressFull: ADDRESS_FULL,
  mapsEmbedSrc: `https://www.google.com/maps?q=${mapsQueryEncoded}&hl=tr&z=16&output=embed`,
  mapsOpenHref: MAPS_OPEN_HREF,
  workingHours: [
    { label: "Hafta içi", value: "08:00 – 18:00" },
    { label: "Cumartesi", value: "08:00 – 16:00" },
    { label: "Pazar", value: "Kapalı" },
  ],
} as const;

export const CORPORATE_HERO = {
  title: "Hasarlı Araçlarınızı Güvenle Teslim Edin",
  subtitle:
    "Seferoğulları Otomotiv olarak sigorta hasar süreçleri, boya-kaporta, mekanik onarım ve araç teslim süreçlerini profesyonel şekilde yönetiyoruz.",
} as const;

export const CORPORATE_SERVICES = [
  {
    title: "Sigorta Hasar Onarımı",
    description: "Hasar dosyası, ekspertiz ve onarım süreçlerinin uçtan uca takibi.",
  },
  {
    title: "Boya & Kaporta",
    description: "Fabrika standartlarında boya ve kaporta onarım hizmetleri.",
  },
  {
    title: "Mekanik Servis",
    description: "Güvenli sürüş için mekanik kontrol ve onarım çözümleri.",
  },
  {
    title: "Ekspertiz ve Dosya Takibi",
    description: "Sigorta süreçleriyle uyumlu şeffaf dosya yönetimi.",
  },
  {
    title: "Parça Tedarik",
    description: "Hızlı ve doğru parça tedarik koordinasyonu.",
  },
  {
    title: "Araç Teslim Süreci",
    description: "Kalite kontrol sonrası güvenli ve planlı teslim.",
  },
] as const;

export const CORPORATE_PROCESS = [
  { step: "01", title: "Araç Kabul" },
  { step: "02", title: "Ekspertiz" },
  { step: "03", title: "Parça Tedarik" },
  { step: "04", title: "Onarım" },
  { step: "05", title: "Kalite Kontrol" },
  { step: "06", title: "Teslim" },
] as const;

export const CORPORATE_WHY = [
  "Şeffaf süreç yönetimi",
  "Sigorta dosya takibi",
  "Profesyonel ekip",
  "Hızlı tedarik",
  "Kurumsal servis disiplini",
] as const;

export const CORPORATE_NAV = [
  { id: "hizmetler", label: "Hizmetler" },
  { id: "surec", label: "Süreç" },
  { id: "hakkimizda", label: "Hakkımızda" },
  { id: "iletisim", label: "İletişim" },
] as const;

export const CORPORATE_BRAND = {
  name: BRAND.companyName,
  tagline: "Sigorta Hasar & Onarım Merkezi",
} as const;
