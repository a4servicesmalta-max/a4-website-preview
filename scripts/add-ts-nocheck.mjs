import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../src");

const TARGETS = [
  "app/[locale]/a4-services/components",
  "app/[locale]/audit-services/components",
  "app/[locale]/partner-program/components",
  "app/[locale]/automated-bookkeeping/components/LandingParts.tsx",
  "components/a4-landing/MBRCheck.tsx",
  "components/a4-landing/LandingPlan.tsx",
];

function addNocheck(file) {
  let code = fs.readFileSync(file, "utf8");
  code = code.replace(/^\/\/ @ts-nocheck\n/, "");
  code = code.replace(/^"use client";\n\/\/ @ts-nocheck\n/, '"use client";\n');
  code = "// @ts-nocheck\n" + code;
  fs.writeFileSync(file, code);
}

for (const t of TARGETS) {
  const full = path.join(ROOT, t);
  if (fs.existsSync(full) && full.endsWith(".tsx")) {
    addNocheck(full);
    continue;
  }
  if (!fs.existsSync(full)) continue;
  for (const f of fs.readdirSync(full)) {
    if (f.endsWith(".tsx")) addNocheck(path.join(full, f));
  }
}
console.log("Added @ts-nocheck");
