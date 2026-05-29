export function formatTarih(iso: string): string {

  return new Intl.DateTimeFormat("tr-TR", {

    day: "2-digit",

    month: "2-digit",

    year: "numeric",

  }).format(new Date(iso));

}



export function formatTarihSaat(iso: string): string {

  return new Intl.DateTimeFormat("tr-TR", {

    day: "2-digit",

    month: "2-digit",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",

  }).format(new Date(iso));

}



export function formatTelefon(tel: string): string {

  return tel.trim();

}



export function formatDosyaBoyutu(bytes: number): string {

  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

}


