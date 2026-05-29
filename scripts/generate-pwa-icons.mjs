/**
 * SVG → basit PNG ikonlar (PWA + Apple Touch)
 * sharp yoksa minimal PNG placeholder yazar.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const iconsDir = path.join(root, "public", "icons");

/** 1x1 mavi PNG — sharp yoksa fallback (tarayıcı ölçekler) */
const MINI_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function writePng(name) {
  const buf = Buffer.from(MINI_PNG_BASE64, "base64");
  fs.writeFileSync(path.join(iconsDir, name), buf);
}

async function main() {
  fs.mkdirSync(iconsDir, { recursive: true });
  let usedSharp = false;
  try {
    const sharp = (await import("sharp")).default;
    const svg = fs.readFileSync(path.join(iconsDir, "icon.svg"));
    const sizes = [
      ["icon-192.png", 192],
      ["icon-512.png", 512],
      ["icon-maskable-512.png", 512],
      ["apple-touch-icon.png", 180],
      ["badge-72.png", 72],
    ];
    for (const [name, size] of sizes) {
      await sharp(svg)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, name));
    }
    usedSharp = true;
  } catch {
    for (const name of [
      "icon-192.png",
      "icon-512.png",
      "icon-maskable-512.png",
      "apple-touch-icon.png",
      "badge-72.png",
    ]) {
      writePng(name);
    }
  }
  console.log(
    usedSharp
      ? "[generate-pwa-icons] PNG ikonlar oluşturuldu (sharp)."
      : "[generate-pwa-icons] sharp yok — placeholder PNG yazıldı. npm i -D sharp önerilir."
  );
}

main();
