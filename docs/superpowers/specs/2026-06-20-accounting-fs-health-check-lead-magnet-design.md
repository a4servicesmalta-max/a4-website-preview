# Accounting & FS Health Check — Lead Magnet (Design Spec)

**Date:** 2026-06-20
**Status:** Approved (design), pending spec review → implementation plan
**Repos:** `A4-website` (Next.js, primary) and `a4-fs-review` (Python FastAPI engine, dependency)

## 1. Goal

Replace the informational **MBR "check your Malta company"** lead magnet with a new **AI-powered "Accounting & FS Health Check"** that serves both accounting and audit prospects. It is a two-stage funnel:

1. A low-friction **quick health check** (questionnaire → instant score) that captures broad lead volume.
2. A high-value **real document review** that runs the firm's actual AI engine on an uploaded **financial-statements** set or **trial balance** — the differentiator.

Success = a working, on-brand funnel that (a) removes all MBR surface area cleanly, (b) produces a credible accounting-health score from a questionnaire, (c) returns real, severity-tagged findings + a branded PDF from an uploaded FS or TB, and (d) captures qualified leads (email + name + company) with team notification at each step.

## 2. Non-Goals (v1)

- **General Ledger (transaction-level) review** — explicitly a fast-follow, not v1.
- A user account / login / saved history. Stateless, one-shot.
- Storing uploaded documents. Processing is in-memory; nothing is persisted.
- A CRM integration. Leads are captured via email notification (reuse existing nodemailer pattern); a CRM webhook can be added later.
- Real-time AI scoring of the Stage-1 questionnaire (scoring is deterministic by design).

## 3. User Flow

### Stage 1 — Quick check (no friction)
- ~8 multiple-choice questions across accounting-health dimensions (§5).
- On finishing: show **score / 100** + **band** (Healthy / Some gaps / At risk) and a per-dimension status preview immediately (the hook).
- **Email gate:** to reveal the full dimension-by-dimension breakdown, collect **email + name + company**. The breakdown is shown **on-screen** and emailed to the user + team. A downloadable PDF summary is **optional** (nice-to-have; only add a PDF lib if cheap). This is the primary lead capture.

### Stage 2 — Deep review (the wow)
- User chooses what to review: **Financial statements** or **Trial balance**.
- Collect **email + name + company** + a **consent checkbox** ("I understand my file is processed to generate a review and is not stored").
- **FS path:** upload PDF/Word → proxied to the live `a4-fs-review` engine (`POST /api/review`, `deep=true`).
- **TB path:** upload CSV/XLSX/PDF → proxied to the new engine endpoint (`POST /api/review-tb`).
- Render returned findings (severity-tagged) on screen + offer the **branded A4 PDF report** download (and annotated Word for `.docx` FS uploads).
- End with a **book-a-call** CTA (existing `ServicePortalBand` / Calendly).

## 4. Architecture

```
Browser (questionnaire + upload form)
  → Next.js API routes (server-side; creds never in browser)
      /api/health-check       → records Stage-1 lead, emails breakdown to user + team (optional PDF)
      /api/fs-gap-review       → forwards FS or TB file to the engine, records lead, returns findings + report
  → a4-fs-review engine (HTTP Basic auth)
      POST /api/review     (existing — financial statements)
      POST /api/review-tb  (NEW — trial balance)
```

- **Why proxy:** keeps the engine's Basic-auth credentials and base URL in server env vars, avoids browser CORS, and gives a single place to capture the lead and enforce file-size/type limits. The Next route streams the multipart file through to the engine without writing it to disk.
- **Env vars (A4-website):** `A4_FSREVIEW_URL`, `A4_FSREVIEW_USER`, `A4_FSREVIEW_PASS` (engine Basic auth); reuse existing `SMTP_*` / `CONTACT_TO_EMAIL` for lead email.
- **Privacy:** the engine is stateless (no file persistence). The Next proxy must not persist the upload either (stream, don't buffer to disk). Surface a consent checkbox + "processed in memory, not stored" copy.

## 5. Stage 1 — Quick-check design (deterministic)

Eight dimensions, each a single multiple-choice question. Each answer maps to a fixed point value; weights sum to 100. Higher-risk dimensions weighted more. **No AI** — scoring is a transparent rubric (defensible, reproducible; aligns with the firm's "no LLM-invented figures" principle).

| # | Dimension | Question (summary) | Weight |
|---|-----------|--------------------|--------|
| 1 | Bookkeeping currency | How up to date is your bookkeeping? | 16 |
| 2 | Bank reconciliation | When were bank accounts last reconciled? | 14 |
| 3 | VAT compliance | VAT returns filed on time & reconciled? | 14 |
| 4 | Records & documentation | Digital copies of all invoices/receipts? | 12 |
| 5 | Year-end / audit readiness | How ready for year-end / audit? | 16 |
| 6 | Financial controls | Approvals / segregation for payments? | 10 |
| 7 | Management accounts | How often do you review management accounts? | 10 |
| 8 | Statutory deadlines | Tracking annual return / tax / VAT deadlines? | 8 |

- Each question has 3–4 ordered answers; the best answer earns full weight, the worst earns 0, intermediate answers earn proportional points.
- **Bands:** Healthy ≥ 80, Some gaps 50–79, At risk < 50.
- Each chosen answer maps to a **pre-written finding** (status ✅ / ⚠️ / 🔴 + one-line recommendation). The result screen shows all eight, sorted worst-first, and highlights the **top 3 priorities**.
- The scoring rubric (weights + per-answer points + finding text) lives in one data module: `src/data/accounting-health-check.ts`. The score function is pure and unit-tested.

## 6. Stage 2 — Engine integration

### 6a. FS path (existing engine — ready now)
- `POST /api/review` multipart: `file` (PDF/`.doc`/`.docx`), `deep=true`, HTTP Basic auth.
- Returns JSON: `company`, `framework`, `stats`, `findings[]` (severity, location, description, source engine|ai, current/corrected/action), `confirmed[]`, `reportBase64`/`reportName`, optional `annotatedDocxBase64`/`annotatedName`.
- Latency 1–60s (OCR/deep). The Next route sets a generous timeout and shows a progress UI.

### 6b. TB path (NEW engine endpoint — `a4-fs-review` repo)
New `POST /api/review-tb` mirroring `/api/review`'s response shape so the front-end renders both identically.

- **Input:** multipart `file` — CSV, XLSX, or PDF. Expected columns: account code/name, and either (debit, credit) or a single signed balance. Header detection is heuristic; ambiguous columns get AI-assisted mapping.
- **Deterministic checks** (the math — never AI):
  - **Balance:** Σdebits = Σcredits (or Σ signed balances = 0). Out-of-balance → `critical`, report the difference.
  - **Sign/classification anomalies:** classify each account (asset/liability/equity/income/expense) by code range and/or name keywords; flag abnormal-sign balances beyond a threshold (excluding known contra accounts) → `high`/`medium`.
  - **Unusual balances:** negative cash/bank, negative inventory, non-zero suspense/clearing/control accounts → `medium`.
  - **Duplicate account codes** → `high`.
  - **Rounding / round-number clustering** (many exact round figures → possible estimates) → `low`/`info`.
  - **Missing standard accounts** (e.g., no retained earnings) → `info`.
- **AI-assisted (Claude, narrative/classification only):** suggest classification when account names are ambiguous; write a plain-English summary and per-finding recommendation. Gated by `ANTHROPIC_API_KEY` (degrades gracefully to deterministic-only).
- **Output:** same `findings[]`/`confirmed[]`/`stats` shape + a branded **"A4 Trial Balance Review"** PDF (`reportBase64`), reusing the existing ReportLab report builder.
- **Stateless / no retention**, consistent with `/api/review`.

## 7. Removal of MBR (A4-website)

Delete:
- `src/app/[locale]/mbr-check/` (route)
- `src/lib/mbr-links.ts`
- `src/components/a4-landing/MBRCheck.tsx`

Edit:
- `src/app/[locale]/a4-services/components/A4ServicesApp.tsx` — replace the `<MBRCheck variant="homepage" />` block with a **promo band** linking to `/accounting-health-check`.
- `src/app/[locale]/automated-bookkeeping/components/LandingParts.tsx` — same replacement (or remove).
- `src/app/[locale]/lead-magnets/components/LeadMagnetPages.tsx` — remove `MbrCheckPageContent` (keep `ComplianceCalendarContent`).
- `src/app/sitemap.ts` — remove `"/mbr-check"`, add `"/accounting-health-check"`.
- Remove `NEXT_PUBLIC_MBR_*` env references.
- `src/lib/compliance-calendar.ts` — keep events; the "MBR annual return" calendar item is factual and stays (it is not the MBR lead magnet).

## 8. New surface area (A4-website)

- `src/app/[locale]/accounting-health-check/page.tsx` + components:
  - `HealthCheckQuiz.tsx` (Stage 1 — questions, scoring, result, email gate)
  - `DeepReview.tsx` (Stage 2 — doc-type choice, upload, consent, findings render, downloads)
- `src/data/accounting-health-check.ts` (questions, weights, finding text — pure, tested)
- `src/app/api/health-check/route.ts` (Stage-1 lead capture + email breakdown; optional PDF)
- `src/app/api/fs-gap-review/route.ts` (engine proxy for FS + TB; lead capture)
- Findings renderer component (severity-tagged), reusable for FS and TB.
- Promo bands where MBR sat; nav/footer link; sitemap entry.

## 9. Error handling

- Quiz: client-side; no network until the email gate. Validate email format.
- Upload: validate type (FS: pdf/doc/docx; TB: csv/xlsx/pdf) and a sane max size before sending. Show clear messages for engine `400/401/422/502` (e.g., 422 "couldn't read the statements — try a clearer PDF or the Excel TB").
- Engine timeout/unreachable → friendly fallback: capture the lead anyway and offer "we'll run it and email you" + book-a-call.
- AI unavailable on TB → still return deterministic findings.

## 10. Testing

- **Engine (`a4-fs-review`):** unit tests for the TB parser (CSV/XLSX/PDF column detection) and each deterministic TB check (balanced/unbalanced, sign anomalies, duplicates, unusual balances) using small fixtures. TDD.
- **A4-website:** unit tests for the pure scoring function (`accounting-health-check.ts`) across representative answer sets and band boundaries. Integration test for the proxy route (mock engine) covering FS + TB happy paths and 422/timeout. Manual click-test of the full funnel on the live dev server.

## 11. Build order

1. **`a4-fs-review`:** add `/api/review-tb` (parser + deterministic checks + AI hints + PDF), with tests; deploy to Railway; confirm `/api/config` and the new endpoint.
2. **`A4-website`:** remove MBR; build the page + quiz + scoring (+ tests); build the proxy routes; wire FS + TB upload; lead capture; promo bands + sitemap; click-test.

## 12. Open questions

- Exact engine base URL / Basic-auth creds for prod (Railway) — needed as env vars at deploy.
- Final route slug confirmed as `/accounting-health-check` (changeable).
- Calendly/booking URL for the closing CTA (reuse `NEXT_PUBLIC_CALENDLY_BOOKING_URL`).
