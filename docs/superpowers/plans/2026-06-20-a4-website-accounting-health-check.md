# Accounting & FS Health Check (A4-website) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the MBR lead magnet and add a `/accounting-health-check` page: a deterministic 8-question accounting health-check (instant score → email-gated breakdown) plus a deep document review that proxies uploads to the `a4-fs-review` engine (financial statements **and** trial balance).

**Architecture:** Pure scoring logic lives in a tested data module. Two client components (quiz, deep-review) drive two server API routes: one captures the Stage-1 lead and emails the breakdown; one streams an uploaded file to the engine (FS → `/api/review`, TB → `/api/review-tb`) with server-side Basic auth, captures the lead, and returns the findings + base64 report. No file is persisted on either side.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, nodemailer (existing), vitest (new, dev-only).

**Working dir / repo:** `C:\Users\user\Downloads\New\A4-website`, branch `feature/accounting-health-check`. Node is at `C:\Users\user\.tools\node-v20.18.1-win-x64` (prepend to PATH). **Depends on** the engine plan being deployed (its live URL + Basic-auth creds).

---

## File Structure

- `src/data/accounting-health-check.ts` — NEW. Questions, weights, per-answer points, finding text, and the pure `scoreHealthCheck()` function. One responsibility: the rubric + scoring.
- `src/data/accounting-health-check.test.ts` — NEW. Vitest unit tests for `scoreHealthCheck`.
- `src/app/[locale]/accounting-health-check/page.tsx` — NEW. Route entry + metadata.
- `src/app/[locale]/accounting-health-check/components/HealthCheckTool.tsx` — NEW. Client wrapper switching Stage 1 ↔ Stage 2.
- `.../components/HealthCheckQuiz.tsx` — NEW. Stage 1 questionnaire, result, email gate.
- `.../components/DeepReview.tsx` — NEW. Stage 2 doc-type choice, upload, consent, findings render, downloads.
- `.../components/FindingsList.tsx` — NEW. Severity-tagged findings renderer (shared shape with the engine).
- `src/app/api/health-check/route.ts` — NEW. Stage-1 lead capture + email breakdown.
- `src/app/api/fs-gap-review/route.ts` — NEW. Engine proxy (FS + TB) + lead capture.
- `src/components/a4-landing/HealthCheckPromo.tsx` — NEW. Promo band replacing MBR on service pages.
- MBR removals (Task 1).
- `package.json` — MODIFY (add vitest + `test` script).
- `vitest.config.ts` — NEW.
- `src/app/sitemap.ts` — MODIFY.

**Engine response type (shared):**
```typescript
export type Finding = {
  ruleId: string; severity: "critical" | "high" | "medium" | "low" | "info";
  severityLabel: string; location: string; description: string;
  source: "engine" | "ai"; where: string; current: string; corrected: string; action: string;
};
export type ReviewResponse = {
  company: string; framework: string; method: string;
  stats: { checks_run: number; checks_passed: number; checks_failed: number; framework: string };
  findings: Finding[]; confirmed: string[];
  reportBase64: string; reportName: string;
  annotatedDocxBase64: string | null; annotatedName: string | null;
};
```

---

## Task 1: Remove MBR

**Files:** delete + edit per spec §7.

- [ ] **Step 1: Delete MBR files**

```bash
cd /c/Users/user/Downloads/New/A4-website
rm -rf "src/app/[locale]/mbr-check"
rm -f src/lib/mbr-links.ts
rm -f src/components/a4-landing/MBRCheck.tsx
```

- [ ] **Step 2: Remove the `<MBRCheck/>` usage in A4ServicesApp**

In `src/app/[locale]/a4-services/components/A4ServicesApp.tsx`: delete the `import { MBRCheck } from "@/components/a4-landing/MBRCheck"` line and the `<MBRCheck variant="homepage" />` JSX line. (We add the promo band in Task 8 — leave a `{/* TODO: <HealthCheckPromo/> added in Task 8 */}` marker at the same spot.)

- [ ] **Step 3: Remove the `<MBRCheck/>` usage in automated-bookkeeping**

In `src/app/[locale]/automated-bookkeeping/components/LandingParts.tsx`: delete the `MBRCheck` import and its JSX usage. Leave the same marker comment.

- [ ] **Step 4: Remove `MbrCheckPageContent`**

In `src/app/[locale]/lead-magnets/components/LeadMagnetPages.tsx`: delete the `MbrCheckPageContent` function and its `MBRCheck` import. Keep `ComplianceCalendarContent`. Grep for other importers:

Run: `grep -rn "MbrCheckPageContent\|MBRCheck\|mbr-links" src/`
Expected: no remaining references (fix any that show up).

- [ ] **Step 5: Update sitemap**

In `src/app/sitemap.ts`: in `STATIC_PATHS`, remove `"/mbr-check"` and add `"/accounting-health-check"`.

- [ ] **Step 6: Build to verify nothing dangles**

Run: `export PATH="/c/Users/user/.tools/node-v20.18.1-win-x64:$PATH" && npm run build`
Expected: build succeeds (no missing-import errors). If a page still imports MBR, fix it.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: remove MBR check lead magnet"
```

---

## Task 2: Add vitest

**Files:** Modify `package.json`; Create `vitest.config.ts`

- [ ] **Step 1: Install vitest**

Run: `export PATH="/c/Users/user/.tools/node-v20.18.1-win-x64:$PATH" && npm install -D vitest`
Expected: installs.

- [ ] **Step 2: Add config**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { include: ["src/**/*.test.ts"], environment: "node" } });
```

- [ ] **Step 3: Add test script**

In `package.json` `scripts`, add: `"test": "vitest run"`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "build: add vitest for unit tests"
```

---

## Task 3: Scoring data module (TDD)

**Files:** Create `src/data/accounting-health-check.ts`, `src/data/accounting-health-check.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/data/accounting-health-check.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { QUESTIONS, scoreHealthCheck } from "./accounting-health-check";

const bestAnswers = () => Object.fromEntries(QUESTIONS.map((q) => [q.id, 0])); // index 0 = best
const worstAnswers = () => Object.fromEntries(QUESTIONS.map((q) => [q.id, q.answers.length - 1]));

describe("scoreHealthCheck", () => {
  it("has 8 questions whose weights sum to 100", () => {
    expect(QUESTIONS).toHaveLength(8);
    expect(QUESTIONS.reduce((s, q) => s + q.weight, 0)).toBe(100);
  });
  it("scores all-best as 100 / Healthy", () => {
    const r = scoreHealthCheck(bestAnswers());
    expect(r.score).toBe(100);
    expect(r.band).toBe("Healthy");
  });
  it("scores all-worst as 0 / At risk", () => {
    const r = scoreHealthCheck(worstAnswers());
    expect(r.score).toBe(0);
    expect(r.band).toBe("At risk");
  });
  it("returns one result row per question, worst-first", () => {
    const r = scoreHealthCheck(worstAnswers());
    expect(r.results).toHaveLength(8);
    for (let i = 1; i < r.results.length; i++) {
      expect(r.results[i - 1].points).toBeLessThanOrEqual(r.results[i].points);
    }
  });
  it("bands at the boundaries", () => {
    expect(scoreHealthCheck.bandFor(80)).toBe("Healthy");
    expect(scoreHealthCheck.bandFor(79)).toBe("Some gaps");
    expect(scoreHealthCheck.bandFor(50)).toBe("Some gaps");
    expect(scoreHealthCheck.bandFor(49)).toBe("At risk");
  });
});
```

- [ ] **Step 2: Run, verify it fails**

Run: `export PATH="/c/Users/user/.tools/node-v20.18.1-win-x64:$PATH" && npm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the module**

Create `src/data/accounting-health-check.ts`:
```typescript
export type Band = "Healthy" | "Some gaps" | "At risk";

export type Answer = { label: string; status: "good" | "warn" | "bad"; finding: string };
export type Question = { id: string; dimension: string; weight: number; prompt: string; answers: Answer[] };

// answers ordered best -> worst; points = weight * (1 - index/(n-1))
export const QUESTIONS: Question[] = [
  { id: "bookkeeping", dimension: "Bookkeeping", weight: 16,
    prompt: "How up to date is your bookkeeping right now?",
    answers: [
      { label: "Up to date (this month)", status: "good", finding: "Bookkeeping is current — keep the monthly cadence." },
      { label: "1–3 months behind", status: "warn", finding: "Bookkeeping is 1–3 months behind — a monthly close keeps numbers reliable." },
      { label: "3+ months behind", status: "bad", finding: "Bookkeeping is 3+ months behind — high risk of errors and missed deadlines." },
      { label: "Not sure", status: "bad", finding: "Bookkeeping status is unclear — start with a catch-up and a monthly routine." },
    ] },
  { id: "bankrec", dimension: "Bank reconciliation", weight: 14,
    prompt: "When were your bank accounts last reconciled?",
    answers: [
      { label: "This month", status: "good", finding: "Bank reconciliations are current." },
      { label: "This quarter", status: "warn", finding: "Reconcile monthly to catch missing or duplicated transactions sooner." },
      { label: "We don't reconcile", status: "bad", finding: "Bank accounts aren't reconciled — the books may not reflect reality." },
      { label: "Not sure", status: "bad", finding: "Reconciliation status unclear — make it a monthly control." },
    ] },
  { id: "vat", dimension: "VAT compliance", weight: 14,
    prompt: "Are your VAT returns filed on time and reconciled?",
    answers: [
      { label: "Always on time & reconciled", status: "good", finding: "VAT is on time and reconciled." },
      { label: "Filed, sometimes late", status: "warn", finding: "VAT is filed but sometimes late — late filing risks penalties." },
      { label: "Behind / unsure they tie", status: "bad", finding: "VAT may be behind or unreconciled — a common source of penalties and audit queries." },
      { label: "Not VAT registered", status: "good", finding: "Not VAT registered — confirm you're under the threshold." },
    ] },
  { id: "records", dimension: "Records & documentation", weight: 12,
    prompt: "Do you keep digital copies of all invoices and receipts?",
    answers: [
      { label: "Yes, all of them", status: "good", finding: "Documentation is complete — audit-friendly." },
      { label: "Most of them", status: "warn", finding: "Some source documents are missing — gaps surface at year-end/audit." },
      { label: "A few / paper only", status: "bad", finding: "Records are incomplete — reconstructing them later is costly." },
      { label: "No system", status: "bad", finding: "No document system — this is the #1 cause of year-end scramble." },
    ] },
  { id: "yearend", dimension: "Year-end / audit readiness", weight: 16,
    prompt: "How ready are you for year-end / audit?",
    answers: [
      { label: "Books closed monthly, schedules ready", status: "good", finding: "You're audit-ready — schedules and closes are in place." },
      { label: "We pull it together at year-end", status: "warn", finding: "Year-end is a scramble — month-end closes make audit faster and cheaper." },
      { label: "Not sure what's needed", status: "bad", finding: "Audit-readiness is unclear — a prep checklist will de-risk it." },
    ] },
  { id: "controls", dimension: "Financial controls", weight: 10,
    prompt: "Are there approvals / segregation of duties for payments?",
    answers: [
      { label: "Yes, documented", status: "good", finding: "Payment controls are in place." },
      { label: "Informal", status: "warn", finding: "Controls are informal — document approvals to reduce fraud/error risk." },
      { label: "None — one person does it all", status: "bad", finding: "No segregation of duties — a key control weakness." },
    ] },
  { id: "mgmt", dimension: "Management accounts", weight: 10,
    prompt: "How often do you review management accounts (P&L / balance sheet)?",
    answers: [
      { label: "Monthly", status: "good", finding: "Monthly management accounts — strong financial visibility." },
      { label: "Quarterly", status: "warn", finding: "Quarterly visibility — monthly accounts catch issues earlier." },
      { label: "Only at year-end", status: "bad", finding: "You only see numbers at year-end — too late to act on them." },
      { label: "Never", status: "bad", finding: "No management accounts — flying blind on performance." },
    ] },
  { id: "deadlines", dimension: "Statutory deadlines", weight: 8,
    prompt: "Do you track statutory deadlines (annual return, tax, VAT)?",
    answers: [
      { label: "Tracked, never missed", status: "good", finding: "Deadlines are tracked and met." },
      { label: "Mostly", status: "warn", finding: "Deadlines mostly met — one tracker avoids penalty surprises." },
      { label: "Missed some", status: "bad", finding: "Missed deadlines — penalties and good-standing risk." },
      { label: "Not sure", status: "bad", finding: "Deadline tracking unclear — start a compliance calendar." },
    ] },
];

function bandFor(score: number): Band {
  if (score >= 80) return "Healthy";
  if (score >= 50) return "Some gaps";
  return "At risk";
}

export type ResultRow = { dimension: string; points: number; max: number; status: Answer["status"]; finding: string };
export type HealthResult = { score: number; band: Band; results: ResultRow[]; priorities: ResultRow[] };

export function scoreHealthCheck(answers: Record<string, number>): HealthResult {
  const rows: ResultRow[] = QUESTIONS.map((q) => {
    const idx = Math.min(Math.max(answers[q.id] ?? q.answers.length - 1, 0), q.answers.length - 1);
    const a = q.answers[idx];
    const points = q.answers.length === 1 ? q.weight : Math.round(q.weight * (1 - idx / (q.answers.length - 1)));
    return { dimension: q.dimension, points, max: q.weight, status: a.status, finding: a.finding };
  });
  const score = Math.max(0, Math.min(100, rows.reduce((s, r) => s + r.points, 0)));
  const sorted = [...rows].sort((a, b) => a.points - b.points);
  return { score, band: bandFor(score), results: sorted, priorities: sorted.filter((r) => r.status !== "good").slice(0, 3) };
}

scoreHealthCheck.bandFor = bandFor;
```

- [ ] **Step 4: Run, verify it passes**

Run: `export PATH="/c/Users/user/.tools/node-v20.18.1-win-x64:$PATH" && npm test`
Expected: PASS (all scoring tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/accounting-health-check.ts src/data/accounting-health-check.test.ts
git commit -m "feat: deterministic accounting health-check scoring (tested)"
```

---

## Task 4: Stage-1 lead-capture API route

Mirrors `src/app/api/lead-magnet/route.ts` (nodemailer transport, email validation). Accepts `{ email, name, company, score, band, breakdown }`, emails the team + the user, returns `{ ok: true }`.

**Files:** Create `src/app/api/health-check/route.ts`

- [ ] **Step 1: Implement (copy transport pattern from lead-magnet route)**

Create `src/app/api/health-check/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function getTransport() {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host, port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true", auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, company, score, band, breakdown } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    const transport = getTransport();
    const to = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
    const summary = `Score: ${score}/100 (${band})\n\n${(breakdown || []).map((r: { dimension: string; finding: string }) => `• ${r.dimension}: ${r.finding}`).join("\n")}`;
    if (transport && to) {
      await transport.sendMail({
        from: `"A4 Website" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to, replyTo: email,
        subject: `Accounting health check — ${name || email} (${score}/100, ${band})`,
        text: `Name: ${name}\nCompany: ${company}\nEmail: ${email}\n\n${summary}`,
      });
      // copy to the prospect
      await transport.sendMail({
        from: `"A4 Services" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: `Your accounting health check — ${score}/100 (${band})`,
        text: `Hi ${name || ""},\n\nHere is your accounting health check result.\n\n${summary}\n\nWant a real review of your numbers? Reply or book a call: ${process.env.NEXT_PUBLIC_CALENDLY_BOOKING_URL || "https://a4.com.mt/contact"}\n\n— A4 Services`,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("health-check lead error:", e);
    return NextResponse.json({ error: "Could not send. Please try again." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/api/health-check/route.ts"
git commit -m "feat: Stage-1 health-check lead capture API"
```

---

## Task 5: Engine-proxy API route (FS + TB)

Accepts `multipart/form-data` (`file`, `kind` = `fs|tb`, `email`, `name`, `company`, `consent`). Validates, forwards the file to the engine with Basic auth, captures the lead, returns the engine JSON. Never writes the file to disk (pass the `File` straight into an outbound `FormData`).

**Files:** Create `src/app/api/fs-gap-review/route.ts`

- [ ] **Step 1: Implement**

Create `src/app/api/fs-gap-review/route.ts`:
```typescript
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const maxDuration = 120; // engine deep/OCR can take up to ~60s

const FS_TYPES = [".pdf", ".doc", ".docx"];
const TB_TYPES = [".pdf", ".csv", ".xlsx", ".xlsm"];

function emailLead(subject: string, text: string, replyTo?: string) {
  const host = process.env.SMTP_HOST, user = process.env.SMTP_USER, pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO_EMAIL || user;
  if (!host || !user || !pass || !to) return Promise.resolve();
  const t = nodemailer.createTransport({ host, port: Number(process.env.SMTP_PORT) || 587, secure: process.env.SMTP_SECURE === "true", auth: { user, pass } });
  return t.sendMail({ from: `"A4 Website" <${process.env.SMTP_FROM || user}>`, to, replyTo, subject, text });
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "fs");
    const email = String(form.get("email") || "");
    const name = String(form.get("name") || "");
    const company = String(form.get("company") || "");
    const consent = String(form.get("consent") || "");

    if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    if (consent !== "true") return NextResponse.json({ error: "Consent is required to process the file." }, { status: 400 });

    const lower = file.name.toLowerCase();
    const allowed = kind === "tb" ? TB_TYPES : FS_TYPES;
    if (!allowed.some((ext) => lower.endsWith(ext))) {
      return NextResponse.json({ error: `Unsupported file type for ${kind === "tb" ? "trial balance" : "financial statements"}.` }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 20 MB)." }, { status: 400 });

    const base = process.env.A4_FSREVIEW_URL;
    if (!base) return NextResponse.json({ error: "Review service not configured." }, { status: 503 });
    const auth = Buffer.from(`${process.env.A4_FSREVIEW_USER || "a4"}:${process.env.A4_FSREVIEW_PASS || ""}`).toString("base64");
    const endpoint = kind === "tb" ? "/api/review-tb" : "/api/review";

    const out = new FormData();
    out.append("file", file, file.name);
    out.append("deep", "true");

    const engine = await fetch(`${base}${endpoint}`, { method: "POST", headers: { Authorization: `Basic ${auth}` }, body: out });

    // capture the lead regardless of engine outcome
    await emailLead(
      `FS/TB review request — ${name || email} (${kind.toUpperCase()})`,
      `Name: ${name}\nCompany: ${company}\nEmail: ${email}\nKind: ${kind}\nFile: ${file.name}\nEngine status: ${engine.status}`,
      email,
    ).catch(() => {});

    if (!engine.ok) {
      const detail = await engine.json().catch(() => ({}));
      const msg = engine.status === 422
        ? "We couldn't read that file. For statements, try a clearer PDF; for a trial balance, try CSV or Excel."
        : (detail.detail || "The review service had a problem. We've logged your request and will follow up.");
      return NextResponse.json({ error: msg }, { status: engine.status === 422 ? 422 : 502 });
    }

    const data = await engine.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("fs-gap-review error:", e);
    return NextResponse.json({ error: "Review failed. Please try again or book a call." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Add env vars to the example file (if present) and note for deploy**

Run: `ls .env.example 2>/dev/null && echo found || echo none`
If found, append:
```
A4_FSREVIEW_URL=
A4_FSREVIEW_USER=a4
A4_FSREVIEW_PASS=
```
Set the real values in Vercel project settings at deploy time.

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/fs-gap-review/route.ts" .env.example
git commit -m "feat: engine proxy API for FS + trial-balance review"
```

---

## Task 6: FindingsList component

**Files:** Create `.../accounting-health-check/components/FindingsList.tsx`

- [ ] **Step 1: Implement**

```tsx
"use client";
import type { Finding } from "@/app/api/fs-gap-review/types";

const COLOR: Record<string, string> = {
  critical: "#c2303d", high: "#c2303d", medium: "#9a5a00", low: "#00659c", info: "#00659c",
};

export function FindingsList({ findings }: { findings: Finding[] }) {
  if (!findings.length) return <p style={{ color: "var(--a4-accent-teal)" }}>No exceptions — every automated check passed. ✅</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {findings.map((f, i) => (
        <div key={i} style={{ borderLeft: `4px solid ${COLOR[f.severity] || "#00659c"}`, padding: "8px 12px", background: "var(--a4-surface-soft)", borderRadius: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: COLOR[f.severity] }}>
            {f.severityLabel}{f.location ? ` · ${f.location}` : ""}{f.source === "ai" ? " · AI" : ""}
          </div>
          <div style={{ fontSize: 14, marginTop: 2 }}>{f.description}</div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Add the shared types file**

Create `src/app/api/fs-gap-review/types.ts` with the `Finding` and `ReviewResponse` types from the File Structure section above.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/accounting-health-check/components/FindingsList.tsx" "src/app/api/fs-gap-review/types.ts"
git commit -m "feat: severity-tagged findings renderer + shared types"
```

---

## Task 7: Quiz + DeepReview + tool wrapper components

> These follow existing patterns. Reuse primitives: `import { Button, Container, Icon, Reveal, Eyebrow } from "@/components/a4-landing/Primitives"` and `PageHero` from `@/app/[locale]/services/components/PageHero` (check exact prop names in those files before using).

- [ ] **Step 1: HealthCheckQuiz.tsx**

Create `.../components/HealthCheckQuiz.tsx`: a client component that renders one `QUESTIONS[i]` at a time with its `answers` as buttons; stores `answers: Record<string, number>`; on the last answer computes `scoreHealthCheck(answers)` and shows the score + band + `priorities`. Then an email-gate form (email, name, company) that POSTs to `/api/health-check`; on success reveals `result.results` (full breakdown) and a "Run a real review →" button that calls a passed-in `onStartDeep()` prop. Use `scoreHealthCheck` from `@/data/accounting-health-check`. Keep all copy from the data module (don't duplicate finding text).

```tsx
"use client";
import { useState } from "react";
import { QUESTIONS, scoreHealthCheck, type HealthResult } from "@/data/accounting-health-check";
import { Button } from "@/components/a4-landing/Primitives";

export function HealthCheckQuiz({ onStartDeep }: { onStartDeep: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<HealthResult | null>(null);
  const [form, setForm] = useState({ email: "", name: "", company: "" });
  const [unlocked, setUnlocked] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  function choose(qid: string, idx: number) {
    const next = { ...answers, [qid]: idx };
    setAnswers(next);
    if (step + 1 < QUESTIONS.length) setStep(step + 1);
    else setResult(scoreHealthCheck(next));
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    if (!result) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/health-check", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, score: result.score, band: result.band, breakdown: result.results }),
      });
      if (!res.ok) throw new Error();
      setUnlocked(true); setStatus("idle");
    } catch { setStatus("error"); }
  }

  if (!result) {
    const q = QUESTIONS[step];
    return (
      <div>
        <div style={{ fontSize: 13, opacity: 0.7 }}>Question {step + 1} / {QUESTIONS.length}</div>
        <h3 style={{ margin: "8px 0 16px" }}>{q.prompt}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.answers.map((a, i) => (
            <button key={i} onClick={() => choose(q.id, i)} style={{ textAlign: "left", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--a4-hairline-light)", background: "#fff", cursor: "pointer" }}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: "var(--a4-primary)" }}>{result.score}<span style={{ fontSize: 20 }}>/100</span></div>
        <div style={{ fontWeight: 700 }}>{result.band}</div>
      </div>
      <h4 style={{ marginTop: 16 }}>Your top priorities</h4>
      <ul>{result.priorities.map((p, i) => <li key={i}>{p.finding}</li>)}</ul>

      {!unlocked ? (
        <form onSubmit={unlock} style={{ marginTop: 16, display: "grid", gap: 10 }}>
          <p style={{ fontSize: 14 }}>Enter your details to see the full breakdown across all 8 areas.</p>
          <input required type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          <Button type="submit" variant="primary" disabled={status === "loading"}>{status === "loading" ? "Sending…" : "Show full breakdown"}</Button>
          {status === "error" && <p style={{ color: "#c2303d" }}>Could not send — please try again.</p>}
        </form>
      ) : (
        <div style={{ marginTop: 16 }}>
          <h4>Full breakdown</h4>
          {result.results.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--a4-hairline-light)" }}>
              <span>{r.status === "good" ? "✅" : r.status === "warn" ? "⚠️" : "🔴"} {r.dimension}</span>
              <span style={{ opacity: 0.7 }}>{r.points}/{r.max}</span>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <Button variant="primary" onClick={onStartDeep}>Run a real review of your numbers →</Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: DeepReview.tsx**

Create `.../components/DeepReview.tsx`: doc-type toggle (`fs` | `tb`), a file input (accept set by kind), email/name/company, a consent checkbox, submit → POST `multipart` to `/api/fs-gap-review`; show a "Analyzing… (up to ~60s)" state; on success render `<FindingsList findings={data.findings}/>`, `data.confirmed`, and download buttons that base64-decode `reportBase64` (and `annotatedDocxBase64`).

```tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/a4-landing/Primitives";
import { FindingsList } from "./FindingsList";
import type { ReviewResponse } from "@/app/api/fs-gap-review/types";

function download(b64: string, filename: string, mime: string) {
  const bin = atob(b64); const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([u8], { type: mime }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function DeepReview() {
  const [kind, setKind] = useState<"fs" | "tb">("fs");
  const [form, setForm] = useState({ email: "", name: "", company: "" });
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [data, setData] = useState<ReviewResponse | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus("loading"); setError("");
    const fd = new FormData();
    fd.append("file", file); fd.append("kind", kind); fd.append("consent", String(consent));
    fd.append("email", form.email); fd.append("name", form.name); fd.append("company", form.company);
    try {
      const res = await fetch("/api/fs-gap-review", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) { setError(body.error || "Review failed."); setStatus("error"); return; }
      setData(body); setStatus("idle");
    } catch { setError("Review failed. Please try again."); setStatus("error"); }
  }

  if (data) {
    return (
      <div>
        <h3>{data.framework} review — {data.company}</h3>
        <p style={{ opacity: 0.7 }}>{data.stats.checks_run} checks · {data.stats.checks_passed} passed · {data.stats.checks_failed} flagged</p>
        <FindingsList findings={data.findings} />
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="primary" onClick={() => download(data.reportBase64, data.reportName, "application/pdf")}>⬇ Download report (PDF)</Button>
          {data.annotatedDocxBase64 && (
            <Button variant="secondary" onClick={() => download(data.annotatedDocxBase64!, data.annotatedName || "review.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}>⬇ Annotated Word</Button>
          )}
        </div>
      </div>
    );
  }

  const accept = kind === "tb" ? ".pdf,.csv,.xlsx,.xlsm" : ".pdf,.doc,.docx";
  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={() => setKind("fs")} aria-pressed={kind === "fs"} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${kind === "fs" ? "var(--a4-primary)" : "var(--a4-hairline-light)"}`, background: "#fff" }}>Financial statements</button>
        <button type="button" onClick={() => setKind("tb")} aria-pressed={kind === "tb"} style={{ flex: 1, padding: 12, borderRadius: 10, border: `1px solid ${kind === "tb" ? "var(--a4-primary)" : "var(--a4-hairline-light)"}`, background: "#fff" }}>Trial balance</button>
      </div>
      <input type="file" accept={accept} onChange={(e) => setFile(e.target.files?.[0] || null)} required />
      <input required type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input required placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      <label style={{ fontSize: 13, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
        I understand my file is processed to generate this review and is not stored.
      </label>
      <Button type="submit" variant="primary" disabled={status === "loading" || !consent}>{status === "loading" ? "Analyzing… (up to ~60s)" : "Run my review"}</Button>
      {status === "error" && <p style={{ color: "#c2303d" }}>{error}</p>}
    </form>
  );
}
```

- [ ] **Step 3: HealthCheckTool.tsx wrapper**

Create `.../components/HealthCheckTool.tsx`:
```tsx
"use client";
import { useState } from "react";
import { HealthCheckQuiz } from "./HealthCheckQuiz";
import { DeepReview } from "./DeepReview";

export function HealthCheckTool() {
  const [stage, setStage] = useState<"quick" | "deep">("quick");
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", background: "var(--a4-surface-card)", border: "1px solid var(--a4-hairline-light)", borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button onClick={() => setStage("quick")} aria-pressed={stage === "quick"} style={{ fontWeight: stage === "quick" ? 700 : 400, background: "none", border: "none", cursor: "pointer" }}>1 · Quick check</button>
        <span style={{ opacity: 0.4 }}>→</span>
        <button onClick={() => setStage("deep")} aria-pressed={stage === "deep"} style={{ fontWeight: stage === "deep" ? 700 : 400, background: "none", border: "none", cursor: "pointer" }}>2 · Deep review</button>
      </div>
      {stage === "quick" ? <HealthCheckQuiz onStartDeep={() => setStage("deep")} /> : <DeepReview />}
    </div>
  );
}
```

- [ ] **Step 4: Build to typecheck the components**

Run: `export PATH="/c/Users/user/.tools/node-v20.18.1-win-x64:$PATH" && npm run build`
Expected: compiles. Fix any prop mismatch against the real `Button`/`PageHero` signatures.

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/accounting-health-check/components/"
git commit -m "feat: health-check quiz + deep-review components"
```

---

## Task 8: Page, promo band, nav, sitemap

- [ ] **Step 1: page.tsx**

Create `src/app/[locale]/accounting-health-check/page.tsx` (mirror an existing lead-magnet page's metadata + layout, e.g. `compliance-calendar/page.tsx`). Render a `PageHero` ("Is your accounting audit-ready?"), the `<HealthCheckTool/>`, and the existing `ServicePortalBand` CTA at the bottom.

- [ ] **Step 2: HealthCheckPromo.tsx**

Create `src/components/a4-landing/HealthCheckPromo.tsx`: a band ("Free accounting & FS health check") with a `LocalizedLink` button to `/accounting-health-check`, styled like the other landing bands. Insert it where the Task-1 markers were left in `A4ServicesApp.tsx` and `automated-bookkeeping/LandingParts.tsx`.

- [ ] **Step 3: Nav/footer link**

In `src/components/common/Navbar.tsx` (and the footer if it lists tools), add a "Free check" link to `/accounting-health-check` following the existing link pattern.

- [ ] **Step 4: Confirm sitemap** already updated in Task 1 (it includes `/accounting-health-check`).

- [ ] **Step 5: Build + commit**

```bash
export PATH="/c/Users/user/.tools/node-v20.18.1-win-x64:$PATH" && npm run build
git add -A && git commit -m "feat: accounting-health-check page, promo band, nav link"
```

---

## Task 9: End-to-end verification (live dev server)

- [ ] **Step 1: Set local env** — create `.env.local` with `A4_FSREVIEW_URL`, `A4_FSREVIEW_USER`, `A4_FSREVIEW_PASS` (from the engine plan Task 9) + SMTP vars (or accept that email no-ops locally).

- [ ] **Step 2: Run dev** — start Next on :3000 (Node 20 on PATH) and open `/en/accounting-health-check`.

- [ ] **Step 3: Quick check** — answer all 8; confirm score + band; submit the email gate; confirm the full breakdown reveals and the team/prospect emails send (or no-op cleanly).

- [ ] **Step 4: Deep review — FS** — upload a sample PDF set; confirm findings render + the PDF downloads.

- [ ] **Step 5: Deep review — TB** — upload `tb_basic.csv`; confirm TB findings render + the TB PDF downloads.

- [ ] **Step 6: Confirm MBR is gone** — `/en/mbr-check` 404s; `/a4-services` shows the promo band, not MBR.

- [ ] **Step 7: Final commit** if any fixes were needed.

---

## Self-Review Notes (author)

- Spec coverage: MBR removal (Task 1) ✅; deterministic quiz + scoring (Task 3) ✅; email gate + lead capture (Tasks 4,7) ✅; FS path via live engine (Task 5) ✅; TB path via new endpoint (Task 5, depends on engine plan) ✅; consent + no-retention (Task 5,7) ✅; promo bands + sitemap + nav (Tasks 1,8) ✅; capture fields email+name+company ✅; optional Stage-1 PDF intentionally dropped (email breakdown instead) — matches the softened spec.
- Type consistency: `Finding`/`ReviewResponse` defined once in `api/fs-gap-review/types.ts`, imported by `FindingsList` and `DeepReview`; `HealthResult`/`scoreHealthCheck` defined once in the data module, imported by the quiz and the test.
- Placeholder scan: component Tasks reference the real `Button`/`PageHero`/`ServicePortalBand`/`LocalizedLink`; Step 4/Step 1 instruct verifying their exact prop signatures before use (the only deferred detail, and it's a read-then-match, not an invented API).
- Engine dependency: Task 5's TB path requires the engine plan deployed; Task 9 Step 5 is the integration gate.
