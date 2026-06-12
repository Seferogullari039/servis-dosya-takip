/**
 * blueprint-car.png koyu zeminini kaldırır → blueprint-car-transparent.png
 * Kullanım: node scripts/generate-blueprint-transparent.mjs
 */
import sharp from "sharp";

const input = "public/login/blueprint-car.png";
const output = "public/login/blueprint-car-transparent.png";

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const out = Buffer.from(data);
const total = width * height;

const lumAt = (idx) => {
  const r = out[idx];
  const g = out[idx + 1];
  const b = out[idx + 2];
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

const isCyanFeature = (idx) => {
  const r = out[idx];
  const g = out[idx + 1];
  const b = out[idx + 2];
  const lum = lumAt(idx);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return (
    (g > r + 18 && b > r + 10 && lum > 42 && sat > 0.12) ||
    lum > 82 ||
    (g > 70 && b > 85 && sat > 0.18)
  );
};

const isBackground = (idx) => {
  if (isCyanFeature(idx)) return false;
  return lumAt(idx) < 92;
};

const bg = new Uint8Array(total);
const queue = new Int32Array(total);
let head = 0;
let tail = 0;

const push = (x, y) => {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const p = y * width + x;
  if (bg[p]) return;
  const idx = p * channels;
  if (!isBackground(idx)) return;
  bg[p] = 1;
  queue[tail++] = p;
};

for (let x = 0; x < width; x++) {
  push(x, 0);
  push(x, height - 1);
}
for (let y = 0; y < height; y++) {
  push(0, y);
  push(width - 1, y);
}

while (head < tail) {
  const p = queue[head++];
  const x = p % width;
  const y = (p - x) / width;
  push(x + 1, y);
  push(x - 1, y);
  push(x, y + 1);
  push(x, y - 1);
}

for (let p = 0; p < total; p++) {
  const idx = p * channels;
  if (bg[p] || !isCyanFeature(idx)) {
    out[idx + 3] = 0;
    continue;
  }
  const lum = lumAt(idx);
  out[idx + 3] = lum < 110 ? Math.min(255, Math.round(120 + (lum - 40) * 1.8)) : 255;
}

await sharp(out, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(output);

console.log(`[generate-blueprint-transparent] ${output} (${width}x${height})`);
