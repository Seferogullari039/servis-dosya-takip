import { existsSync } from "fs";

import path from "path";

import { Font } from "@react-pdf/renderer";



let registered = false;



const FONT_TTF = {

  400: "Roboto-Regular.ttf",

  700: "Roboto-Bold.ttf",

} as const;



const FONT_WOFF_FALLBACK = {

  400: "roboto-latin-ext-400-normal.woff",

  700: "roboto-latin-ext-700-normal.woff",

} as const;



function fontFilePath(filename: string): string {

  const candidates = [

    path.join(process.cwd(), "public", "fonts", "pdf", filename),

    path.join(process.cwd(), "servis-dosya-takip", "public", "fonts", "pdf", filename),

    path.join(

      process.cwd(),

      "node_modules",

      "@fontsource",

      "roboto",

      "files",

      filename

    ),

  ];



  for (const absolute of candidates) {

    if (existsSync(absolute)) return absolute;

  }



  return "";

}



function resolveFontSrc(weight: 400 | 700): string {

  const ttf = fontFilePath(FONT_TTF[weight]);

  if (ttf) return ttf;



  const woff = fontFilePath(FONT_WOFF_FALLBACK[weight]);

  if (woff) return woff;



  throw new Error(

    `PDF font bulunamadı (${FONT_TTF[weight]}). Proje kökünde: npm run copy:pdf-fonts`

  );

}



/** Türkçe karakterler (ğ, ş, ı, ö, ü, ç) dahil tam Roboto */

export function registerPdfFonts(): void {

  if (registered) return;



  Font.register({

    family: "Roboto",

    fonts: [

      {

        src: resolveFontSrc(400),

        fontWeight: 400,

      },

      {

        src: resolveFontSrc(700),

        fontWeight: 700,

      },

    ],

  });



  registered = true;

}


