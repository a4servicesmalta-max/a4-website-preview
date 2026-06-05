import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dest = path.join(root, "src/app/[locale]/automated-bookkeeping-standalone");

const files = [
  ["src/app/[locale]/automated-bookkeeping/page.tsx", "page.tsx"],
  ["src/app/[locale]/automated-bookkeeping/components/LandingParts.tsx", "components/LandingParts.tsx"],
  ["src/app/[locale]/automated-bookkeeping/components/Primitives.tsx", "components/Primitives.tsx"],
  ["src/app/[locale]/automated-bookkeeping/components/HeroFX.tsx", "components/HeroFX.tsx"],
  ["src/app/[locale]/automated-bookkeeping/components/PortalMockup.tsx", "components/PortalMockup.tsx"],
  ["src/app/[locale]/automated-bookkeeping/components/LandingPlan.tsx", "components/LandingPlan.tsx"],
  ["src/app/[locale]/automated-bookkeeping/styles.css", "styles.css"],
];

fs.mkdirSync(path.join(dest, "components"), { recursive: true });

for (const [gitPath, outRel] of files) {
  const content = execSync(`git show HEAD:${gitPath}`, { cwd: root, encoding: "utf8" });
  const out = path.join(dest, outRel);
  let text = content;
  if (outRel === "page.tsx") {
    text = text.replace(/\s*console\.log\([^)]*\);\s*/g, "\n");
  }
  fs.writeFileSync(out, text, "utf8");
  console.log("Wrote", outRel);
}
