/**
 * Kurumsal PWA ikonları: SVG → PNG (tüm boyutlar) + favicon.ico
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const iconsDir = path.join(root, "public", "icons");
const publicDir = path.join(root, "public");

const THEME = "#0F4C81";

const PNG_SIZES = [
  ["icon-72.png", 72, "icon.svg"],
  ["icon-96.png", 96, "icon.svg"],
  ["icon-128.png", 128, "icon.svg"],
  ["icon-144.png", 144, "icon.svg"],
  ["icon-152.png", 152, "icon.svg"],
  ["icon-180.png", 180, "icon.svg"],
  ["icon-192.png", 192, "icon.svg"],
  ["icon-384.png", 384, "icon.svg"],
  ["icon-512.png", 512, "icon.svg"],
  ["icon-maskable-512.png", 512, "icon-maskable.svg"],
  ["apple-touch-icon.png", 180, "icon.svg"],
  ["badge-72.png", 72, "badge.svg"],
];

/** 1x1 mavi PNG — sharp yoksa fallback */
const MINI_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function writePlaceholder(name) {
  fs.writeFileSync(
    path.join(iconsDir, name),
    Buffer.from(MINI_PNG_BASE64, "base64")
  );
}

async function writeFaviconIco(sharp) {
  const sizes = [16, 32, 48];
  const buffers = [];
  const svg = fs.readFileSync(path.join(iconsDir, "icon.svg"));

  for (const size of sizes) {
    buffers.push(
      await sharp(svg).resize(size, size).png().toBuffer()
    );
  }

  try {
    const pngToIco = (await import("png-to-ico")).default;
    const ico = await pngToIco(buffers);
    fs.writeFileSync(path.join(publicDir, "favicon.ico"), ico);
    return true;
  } catch (e) {
    await sharp(svg).resize(32, 32).png().toFile(path.join(publicDir, "favicon-32.png"));
    fs.copyFileSync(path.join(publicDir, "favicon-32.png"), path.join(publicDir, "favicon.ico"));
    console.warn(
      "[generate-pwa-icons] png-to-ico yok; favicon.ico 32px PNG olarak yazıldı.",
      e?.message ?? e
    );
    return false;
  }
}

async function main() {
  fs.mkdirSync(iconsDir, { recursive: true });

  let usedSharp = false;
  try {
    const sharp = (await import("sharp")).default;

    for (const [name, size, svgFile] of PNG_SIZES) {
      const svg = fs.readFileSync(path.join(iconsDir, svgFile));
      await sharp(svg).resize(size, size).png().toFile(path.join(iconsDir, name));
    }

    await writeFaviconIco(sharp);
    usedSharp = true;
  } catch (e) {
    console.warn("[generate-pwa-icons]", e?.message ?? e);
    for (const [name] of PNG_SIZES) {
      writePlaceholder(name);
    }
    writePlaceholder("favicon.ico");
    fs.copyFileSync(
      path.join(iconsDir, "icon-192.png"),
      path.join(publicDir, "favicon.ico")
    );
  }

  console.log(
    usedSharp
      ? `[generate-pwa-icons] Kurumsal ikonlar oluşturuldu (theme ${THEME}).`
      : "[generate-pwa-icons] sharp başarısız — placeholder yazıldı."
  );
}

main();
