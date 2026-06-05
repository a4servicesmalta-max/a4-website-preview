/**
 * Extract embedded assets from New website bundler HTML manifests.
 * Run: node scripts/extract-new-website-assets.mjs
 */
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../public/assets");
const SOURCES = [
  "C:/Users/suhail ahamed/Downloads/New website/Automated Bookkeeping (standalone).html",
  "C:/Users/suhail ahamed/Downloads/New website/A4 Services.html",
  "C:/Users/suhail ahamed/Downloads/New website/Automated Bookkeeping.html",
  "C:/Users/suhail ahamed/Downloads/New website/Audit Services.html",
  "C:/Users/suhail ahamed/Downloads/New website/Partner Program.html",
];

const WANTED = new Set([
  "a4-mark-white.png",
  "a4-logo-webp",
  "logo-xero.png",
  "logo-quickbooks.png",
  "logo-sage.png",
  "commission-chart.png",
  "boks-logo.png",
  "before-clip.webm",
  "after-clip.webm",
]);

function decodeEntry(entry) {
  const binaryStr = Buffer.from(entry.data, "base64");
  if (entry.compressed) {
    return zlib.gunzipSync(binaryStr);
  }
  return binaryStr;
}

function extractFromHtml(htmlPath) {
  if (!fs.existsSync(htmlPath)) {
    console.warn("Skip missing:", htmlPath);
    return {};
  }
  const html = fs.readFileSync(htmlPath, "utf8");
  const m = html.match(/<script type="__bundler\/manifest">\s*([\s\S]*?)\s*<\/script>/);
  if (!m) return {};
  const manifest = JSON.parse(m[1]);
  const found = {};
  for (const [uuid, entry] of Object.entries(manifest)) {
    const name = entry.name || entry.path || entry.filename || uuid;
    const base = path.basename(String(name));
    if (!WANTED.has(base) && !base.includes("a4-mark") && !base.includes("logo-")) continue;
    try {
      found[base] = decodeEntry(entry);
    } catch (e) {
      console.warn("Failed decode", base, e.message);
    }
  }
  return found;
}

fs.mkdirSync(OUT, { recursive: true });
const merged = {};
for (const src of SOURCES) {
  const items = extractFromHtml(src);
  Object.assign(merged, items);
  console.log(path.basename(src), "->", Object.keys(items).length, "assets");
}

for (const [name, buf] of Object.entries(merged)) {
  const dest = path.join(OUT, name);
  fs.writeFileSync(dest, buf);
  console.log("Wrote", dest, `(${buf.length} bytes)`);
}

if (!Object.keys(merged).length) {
  console.error("No assets extracted from manifests.");
  process.exit(1);
}
