import fs from "fs";
import zlib from "zlib";

const html = fs.readFileSync(
  "C:/Users/suhail ahamed/Downloads/New website/Automated Bookkeeping (standalone).html",
  "utf8"
);
const m = html.match(/<script type="__bundler\/manifest">\s*([\s\S]*?)\s*<\/script>/);
const t = html.match(/<script type="__bundler\/template">\s*([\s\S]*?)\s*<\/script>/);
const man = JSON.parse(m[1]);
const template = t ? JSON.parse(t[1]) : null;
console.log("template keys:", template ? Object.keys(template).slice(0, 20) : "none");
if (template?.resources) console.log("resources:", template.resources);
if (template?.assets) console.log("assets sample:", JSON.stringify(template.assets).slice(0, 800));

const imageEntries = [];
for (const [uuid, e] of Object.entries(man)) {
  if (!e.mime?.startsWith("image/") && !e.mime?.includes("webm") && !e.mime?.includes("video")) continue;
  const buf = e.compressed ? zlib.gunzipSync(Buffer.from(e.data, "base64")) : Buffer.from(e.data, "base64");
  imageEntries.push({ uuid, mime: e.mime, size: buf.length });
}
console.log("\nmedia entries:");
imageEntries.forEach((x) => console.log(x));
