# a4-accounting-health Website Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Wire the deployed `a4-accounting-health` engine into the A4 website: a new proxy route behind the existing email gate, and a two-path Deep-review UI (Accounting health vs Financial statements).

**Architecture:** Mirror the existing `fs-gap-review` proxy + `DeepReview` component. The accounting-health path posts a TB (+ optional GL) to a new `/api/accounting-health` route, which enforces `isVerified` then forwards to `${A4_ACCOUNTING_URL}/api/health-review` with Basic auth. The FS path is unchanged.

**Tech Stack:** Next.js 16 App Router, TypeScript, React 19, vitest. Repo: `C:\Users\user\Downloads\New\A4-website` (branch `feature/accounting-health-check`).

**Prerequisite:** the engine is live and you know its URL/user/pass (Engine plan Task 13).

---

### Task 1: Accounting-health proxy route

**Files:**
- Create: `src/app/api/accounting-health/route.ts`
- Create: `src/app/api/accounting-health/route.test.ts`
- Reference: `src/app/api/fs-gap-review/route.ts` (copy the gate + lead-email + forward shape).

- [ ] **Step 1: Write the failing tests** (vitest; mock `isVerified` and global `fetch`)

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/email-verify", () => ({ isVerified: vi.fn(() => false) }));
import { isVerified } from "@/lib/email-verify";
import { POST } from "./route";

function form(fields: Record<string, string | Blob>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v as any);
  return { formData: async () => fd } as any;
}

beforeEach(() => { vi.clearAllMocks(); process.env.A4_ACCOUNTING_URL = "https://engine.test"; });

it("401s when email not verified", async () => {
  (isVerified as any).mockReturnValue(false);
  const res = await POST(form({ tb: new File(["x"], "tb.csv"), email: "a@b.com", consent: "true", verifiedToken: "bad" }));
  expect(res.status).toBe(401);
});

it("503s when engine url unset", async () => {
  (isVerified as any).mockReturnValue(true);
  delete process.env.A4_ACCOUNTING_URL;
  const res = await POST(form({ tb: new File(["x"], "tb.csv"), email: "a@b.com", consent: "true", verifiedToken: "ok" }));
  expect(res.status).toBe(503);
});

it("forwards to engine when verified", async () => {
  (isVerified as any).mockReturnValue(true);
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ score: 80, band: "Healthy" }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  const res = await POST(form({ tb: new File(["x"], "tb.csv"), email: "a@b.com", consent: "true", verifiedToken: "ok" }));
  expect(res.status).toBe(200);
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/health-review"), expect.objectContaining({ method: "POST" }));
});

it("400s with no files", async () => {
  (isVerified as any).mockReturnValue(true);
  const res = await POST(form({ email: "a@b.com", consent: "true", verifiedToken: "ok" }));
  expect(res.status).toBe(400);
});
```

- [ ] **Step 2: Run to verify fail**

Run: `cd /c/Users/user/Downloads/New/A4-website && npx vitest run src/app/api/accounting-health/route.test.ts`
Expected: FAIL (cannot find ./route).

- [ ] **Step 3: Implement src/app/api/accounting-health/route.ts**

```ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { isVerified } from "@/lib/email-verify";

export const runtime = "nodejs";
export const maxDuration = 120;

const TB_TYPES = [".csv", ".xlsx", ".xlsm", ".pdf"];
const GL_TYPES = [".csv", ".xlsx", ".xlsm"];

function emailLead(subject: string, text: string, replyTo?: string) {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO_EMAIL || user;
  if (!host || !user || !pass || !to) return Promise.resolve();
  const t = nodemailer.createTransport({ host, port: Number(process.env.SMTP_PORT) || 587, secure: process.env.SMTP_SECURE === "true", auth: { user, pass } });
  return t.sendMail({ from: `"A4 Website" <${process.env.SMTP_FROM || user}>`, to, replyTo, subject, text });
}

function okType(file: File, allowed: string[]) {
  const lower = file.name.toLowerCase();
  return allowed.some((ext) => lower.endsWith(ext));
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const tb = form.get("tb");
    const gl = form.get("gl");
    const email = String(form.get("email") || "");
    const name = String(form.get("name") || "");
    const company = String(form.get("company") || "");
    const consent = String(form.get("consent") || "");
    const verifiedToken = String(form.get("verifiedToken") || "");

    const tbFile = tb instanceof File && tb.size > 0 ? tb : null;
    const glFile = gl instanceof File && gl.size > 0 ? gl : null;
    if (!tbFile && !glFile) return NextResponse.json({ error: "Upload a trial balance and/or general ledger." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (consent !== "true") return NextResponse.json({ error: "Consent is required to process the files." }, { status: 400 });
    if (!isVerified(email, verifiedToken)) return NextResponse.json({ error: "Please confirm your email before running the review." }, { status: 401 });
    if (tbFile && !okType(tbFile, TB_TYPES)) return NextResponse.json({ error: "Trial balance must be CSV, Excel or PDF." }, { status: 400 });
    if (glFile && !okType(glFile, GL_TYPES)) return NextResponse.json({ error: "General ledger must be CSV or Excel." }, { status: 400 });
    if ((tbFile?.size || 0) > 20 * 1024 * 1024 || (glFile?.size || 0) > 20 * 1024 * 1024)
      return NextResponse.json({ error: "File too large (max 20 MB)." }, { status: 400 });

    const base = process.env.A4_ACCOUNTING_URL;
    if (!base) return NextResponse.json({ error: "Accounting-health service not configured." }, { status: 503 });
    const auth = Buffer.from(`${process.env.A4_ACCOUNTING_USER || "a4"}:${process.env.A4_ACCOUNTING_PASS || ""}`).toString("base64");

    const out = new FormData();
    if (tbFile) out.append("tb", tbFile, tbFile.name);
    if (glFile) out.append("gl", glFile, glFile.name);
    out.append("deep", "true");

    const engine = await fetch(`${base}/api/health-review`, { method: "POST", headers: { Authorization: `Basic ${auth}` }, body: out });

    await emailLead(
      `Accounting-health request — ${name || email}`,
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nTB: ${tbFile?.name || "-"}\nGL: ${glFile?.name || "-"}\nEngine status: ${engine.status}`,
      email,
    ).catch(() => {});

    if (!engine.ok) {
      const detail = await engine.json().catch(() => ({}));
      const msg = engine.status === 422
        ? "We couldn't read those files. Try a clean CSV or Excel export."
        : (detail.detail || detail.error || "The service had a problem. We've logged your request and will follow up.");
      return NextResponse.json({ error: msg }, { status: engine.status === 422 ? 422 : 502 });
    }
    return NextResponse.json(await engine.json());
  } catch (e) {
    console.error("accounting-health error:", e);
    return NextResponse.json({ error: "Review failed. Please try again or book a call." }, { status: 500 });
  }
}
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run src/app/api/accounting-health/route.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/accounting-health && git commit -m "feat(web): accounting-health proxy route (email-gated)"
```

---

### Task 2: Two-path Deep-review UI

**Files:**
- Modify: `src/app/[locale]/accounting-health-check/components/DeepReview.tsx`

Currently `kind: "fs" | "tb"` both post to `/api/fs-gap-review`. Change to a top-level **path** choice: `"accounting"` (TB + optional GL → `/api/accounting-health`, render `score`/`band` + findings) vs `"fs"` (FS doc → `/api/fs-gap-review` with `kind=fs`). The email-gate block and `FindingsList` are reused unchanged.

- [ ] **Step 1: Add path state + GL file state**

Add near the existing `useState` block:

```tsx
const [path, setPath] = useState<"accounting" | "fs">("accounting");
const [glFile, setGlFile] = useState<File | null>(null);
```

Remove the old `kind` `"tb"` usage — keep `kind` only for the FS path (always `"fs"`).

- [ ] **Step 2: Replace the "What would you like reviewed?" toggle**

Replace the fs/tb tab block with a path toggle:

```tsx
<div>
  <label style={{ fontSize: 13, color: "var(--a4-mute)", display: "block", marginBottom: 6 }}>What would you like reviewed?</label>
  <div style={{ display: "flex", gap: 10 }}>
    <button type="button" onClick={() => setPath("accounting")} aria-pressed={path === "accounting"} style={tab(path === "accounting")}>Accounting health (TB + GL)</button>
    <button type="button" onClick={() => setPath("fs")} aria-pressed={path === "fs"} style={tab(path === "fs")}>Financial statements</button>
  </div>
</div>
```

- [ ] **Step 3: Conditional upload slots**

For `path === "accounting"`: one TB upload (accept `.csv,.xlsx,.xlsm,.pdf`) bound to `file`, plus a second **optional** GL upload (accept `.csv,.xlsx,.xlsm`) bound to `glFile`, labelled "General ledger (optional — unlocks transaction checks)". For `path === "fs"`: the existing single FS upload (accept `.pdf,.doc,.docx`) bound to `file`. Reuse the existing dashed-label upload style for each.

- [ ] **Step 4: Branch submit()**

```tsx
async function submit(e: React.FormEvent) {
  e.preventDefault();
  if (!verified) return;
  if (path === "accounting" && !file && !glFile) return;
  if (path === "fs" && !file) return;
  setStatus("loading"); setError("");
  const fd = new FormData();
  fd.append("email", contact.email); fd.append("name", contact.name); fd.append("company", contact.company);
  fd.append("consent", String(consent)); fd.append("verifiedToken", verifiedToken);
  const url = path === "accounting" ? "/api/accounting-health" : "/api/fs-gap-review";
  if (path === "accounting") {
    if (file) fd.append("tb", file);
    if (glFile) fd.append("gl", glFile);
  } else {
    fd.append("file", file as File); fd.append("kind", "fs");
  }
  try {
    const res = await fetch(url, { method: "POST", body: fd });
    const body = await res.json();
    if (!res.ok) { setError(body.error || "Review failed."); setStatus("error"); return; }
    setData(body); setStatus("idle");
  } catch { setError("Review failed. Please try again."); setStatus("error"); }
}
```

- [ ] **Step 5: Result rendering handles both shapes**

The accounting result has `score`/`band` (no `framework`). In the `if (data)` block, when `data.score !== undefined` show a header like `Accounting health — {data.company}` with `{data.score}/100 · {data.band}` and, if present, `data.narrative` as a paragraph; otherwise keep the existing FS header. `FindingsList findings={data.findings}` is shared. PDF download button uses `data.reportBase64`/`data.reportName` (present in both).

- [ ] **Step 6: Verify locally**

Run: `npm run dev` (port 3100), open `/en/accounting-health-check`, Deep review tab. With `A4_ACCOUNTING_URL` set in `.env.local` to the live engine, confirm: verify email → upload a sample TB → "Run my review" returns a score + findings. (Use a sample TB CSV.)

- [ ] **Step 7: Commit**

```bash
git add "src/app/[locale]/accounting-health-check/components/DeepReview.tsx"
git commit -m "feat(web): two-path Deep review (accounting health vs FS)"
```

---

### Task 3: Env vars + deploy + end-to-end verify

- [ ] **Step 1: Local .env.local** — add (do not commit; gitignored):

```
A4_ACCOUNTING_URL=https://<engine>.up.railway.app
A4_ACCOUNTING_USER=a4
A4_ACCOUNTING_PASS=<engine password>
```

- [ ] **Step 2: Vercel env** (production + preview):

```bash
export PATH="/c/Users/user/.tools/node-v20.18.1-win-x64:$PATH"
cd /c/Users/user/Downloads/New/A4-website
for env in production preview; do
  printf 'https://<engine>.up.railway.app' | npx vercel env add A4_ACCOUNTING_URL $env
  printf 'a4' | npx vercel env add A4_ACCOUNTING_USER $env
  printf '<engine password>' | npx vercel env add A4_ACCOUNTING_PASS $env
done
```

- [ ] **Step 3: Deploy** — `npx vercel deploy --prod --yes --archive=tgz` (full deploy so the new route ships), or `npx vercel redeploy a4-website-preview.vercel.app` if only env changed.

- [ ] **Step 4: Live end-to-end** — on `https://a4-website-preview.vercel.app`: request code → confirm → POST `/api/accounting-health` with a sample TB + verified token → expect 200 with `score`/`band`/`findings`. Confirm the unverified call still 401s.

- [ ] **Step 5: Commit any env-doc note** (no secrets) and update the memory file `a4-website-preview-deploy-email-gate` to record the accounting-health wiring.

---

## Self-Review

**Spec coverage:** §8 proxy → Task 1; two-path UI + optional GL slot → Task 2; env vars → Task 3. Same email gate reused (Task 1 uses `isVerified`). **Type consistency:** proxy field names (`tb`, `gl`, `email`, `consent`, `verifiedToken`) match the DeepReview `submit()` FormData keys (Task 2 Step 4) and the engine's `/api/health-review` params (Engine plan Task 12). Result fields (`score`, `band`, `company`, `findings`, `narrative`, `reportBase64`, `reportName`) match the engine's `review()` + `main.py` output. **Placeholder scan:** Task 2 Steps 3 & 5 describe UI in prose (layout reuse) rather than full JSX — acceptable as they reuse existing styled elements; the executor follows the existing upload-label pattern in the same file.
