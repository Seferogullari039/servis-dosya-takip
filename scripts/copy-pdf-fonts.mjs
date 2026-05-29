import { copyFileSync, createWriteStream, existsSync, mkdirSync } from "fs";
import { get } from "https";
import { join } from "path";

const destDir = join(process.cwd(), "public", "fonts", "pdf");

/** Tam glif seti — Türkçe + Latin (WOFF alt küme ş/ğ eksik bırakabiliyor) */
const TTF_SOURCES = {
  "Roboto-Regular.ttf":
    "https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Regular.ttf",
  "Roboto-Bold.ttf":
    "https://raw.githubusercontent.com/googlefonts/roboto-2/main/src/hinted/Roboto-Bold.ttf",
};

const WOFF_FROM_NPM = [
  "roboto-latin-ext-400-normal.woff",
  "roboto-latin-ext-700-normal.woff",
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        get(res.headers.location, (res2) => {
          res2.pipe(file);
          file.on("finish", () => {
            file.close(resolve);
          });
        }).on("error", reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", reject);
  });
}

mkdirSync(destDir, { recursive: true });

const srcDir = join(process.cwd(), "node_modules", "@fontsource", "roboto", "files");
if (existsSync(srcDir)) {
  for (const name of WOFF_FROM_NPM) {
    const src = join(srcDir, name);
    if (existsSync(src)) {
      copyFileSync(src, join(destDir, name));
    }
  }
}

for (const [filename, url] of Object.entries(TTF_SOURCES)) {
  const dest = join(destDir, filename);
  if (existsSync(dest)) {
    console.log(`[copy-pdf-fonts] mevcut: ${filename}`);
    continue;
  }
  process.stdout.write(`[copy-pdf-fonts] indiriliyor: ${filename}… `);
  try {
    await download(url, dest);
    console.log("OK");
  } catch (e) {
    console.log("HATA");
    console.warn(
      e instanceof Error ? e.message : e,
      "\nManuel: Roboto TTF dosyalarını public/fonts/pdf içine koyun."
    );
  }
}
