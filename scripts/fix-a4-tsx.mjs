import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../src");

const DIRS = [
  "app/[locale]/a4-services/components",
  "app/[locale]/audit-services/components",
  "app/[locale]/partner-program/components",
  "app/[locale]/automated-bookkeeping/components",
  "components/a4-landing",
];

const HTML_FIXES = [
  ["Automated Bookkeeping.html", "/automated-bookkeeping"],
  ["Audit Services.html", "/audit-services"],
  ["A4 Services.html", "/a4-services"],
  ["Partner Program.html", "/partner-program"],
];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith(".tsx")) fixFile(full);
  }
}

function fixFile(file) {
  let code = fs.readFileSync(file, "utf8");
  let changed = false;

  for (const [from, to] of HTML_FIXES) {
    if (code.includes(from)) {
      code = code.split(from).join(to);
      changed = true;
    }
  }

  const usesHooks = /\b(useState|useEffect|useRef|useCallback|useMemo)\b/.test(code);
  const hasClient = code.startsWith('"use client"') || code.startsWith("'use client'");
  if (usesHooks && !hasClient) {
    code = '"use client";\n\n' + code;
    changed = true;
  }

  // trim unused react hook imports - keep simple: only import what's used
  const hooks = ["useState", "useEffect", "useRef", "useCallback", "useMemo"].filter((h) => new RegExp(`\\b${h}\\b`).test(code));
  if (code.includes('from "react"')) {
    const newImport = `import React${hooks.length ? `, { ${hooks.join(", ")} }` : ""} from "react";`;
    code = code.replace(/import React[^;]+from "react";/, newImport);
    changed = true;
  }

  if (changed) fs.writeFileSync(file, code);
}

for (const d of DIRS) walk(path.join(ROOT, d));
console.log("Fixed TSX files");
