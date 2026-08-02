# a4-accounting-health — Accounting-records health engine (design)

**Date:** 2026-06-25
**Status:** Approved (design); ready for implementation plan
**Related:** `2026-06-20-accounting-fs-health-check-lead-magnet-design.md` (the website lead magnet), the existing FS reviewer service `a4-fs-review` (Railway), `a4-website-preview-deploy-email-gate` (email gate + Vercel preview).

## 1. Purpose & boundaries

A **standalone** reviewer for accounting **records** — a trial balance plus general-ledger transaction detail — that surfaces health red-flags *before* the accounts are finalised. It is the mirror image of the existing FS reviewer (`a4-fs-review`), which checks a *finished* financial statement. This is deliberately **different code** in its own repository and its own deployment.

**Honest scope (must be stated in UI and report):** it flags anomalies for a qualified accountant to investigate. It is **not** audit assurance, does not give an opinion, and never sees source documents (invoices, bank statements). Output uses plain "AI" / "engine" wording — never model names (e.g. claude-opus) or internal agent codes.

**Non-goals (YAGNI):** no document storage, no user accounts, no database, no bank-statement or VAT-return ingestion (that was the rejected "bookkeeping bundle" scope), no auto-correction of the client's ledger.

## 2. Inputs

Stateless, processed in memory, never persisted (same posture as `a4-fs-review`).

- **Trial balance** — CSV / Excel (`.xlsx`/`.xlsm`) / PDF. Expected columns (header-detected, order-tolerant): account code, account name, debit, credit; optional period label and prior-year balance.
- **General-ledger detail** — CSV / Excel transaction export. Expected columns: date, account (code and/or name), description, debit, credit; optional journal number, source/journal type, posted-by user.
- Either file may be supplied. **TB-only** runs the TB + (degraded) checks; **adding GL** unlocks the transaction-level tests and the TB↔GL tie-out. If only GL is supplied, a TB is derived from it for the integrity checks.
- Size guardrails mirror the FS engine (per-file cap, clear 4xx on oversize / unsupported type / unparseable).

## 3. Deterministic check library

**Every figure and pass/fail is computed in code — never produced by the LLM** (standing project rule). Each finding carries: stable check id, severity (`must-fix` / `review` / `note`), the account or journal reference, the computed figures, a plain-language reason, and a suggested action.

**3a. TB integrity**
- `TB_BALANCE` — total debits = total credits.
- `TB_SUSPENSE` — suspense / clearing / temporary / "to be allocated" accounts carry a non-zero balance.
- `TB_SIGN` — impossible signs: negative cash/bank, debit balance on a revenue account, credit balance on an asset, etc. (classification by account-name + code-range heuristics).
- `TB_CONTROL_MISSING` — expected control accounts absent (debtors/creditors/VAT/bank/retained earnings) given the rest of the TB.
- `TB_ROUNDING` — clusters of suspiciously round whole-number balances (manual-estimate smell).
- `TB_DUP_CODE` — duplicate account codes.
- `TB_PY_SWING` — large CY-vs-PY movement on an account when prior-year is present (informational, thresholded).

**3b. GL transaction tests** (require GL detail)
- `GL_DUP_POSTING` — same date + amount + account + description repeated (possible double-post).
- `GL_BACKDATED` — entries dated before their apparent posting context / out of period order; weekend or public-holiday dates (Malta calendar).
- `GL_ROUND_JOURNAL` — round-sum manual journals (exact thousands/hundreds) above a threshold.
- `GL_CLOSED_PERIOD` — postings dated into a period earlier than the latest closed period (heuristic from the TB period).
- `GL_SEQUENCE_GAP` — missing or duplicated journal numbers (sequence integrity), when journal numbers exist.
- `GL_UNBALANCED_JOURNAL` — a journal whose debits ≠ credits (when groupable by journal number).
- `GL_OUTLIER` — amount far outside the account's own distribution (robust z-score / IQR).
- `GL_DORMANT_ACTIVITY` — movement in an account otherwise dormant for the period.

**3c. TB ↔ GL tie-out** (require both)
- `XREF_MOVEMENT` — net GL movement per account reconciles to the TB movement.
- `XREF_GL_NETS_ZERO` — the GL as a whole nets to zero (balanced double entry).

## 4. Health score

Deterministic weighted score 0–100 across the check categories (weights fixed in code, summing to 100), computed from the actual data → band **Healthy ≥ 80 / Some gaps ≥ 50 / At risk**. This is distinct from the website's 8-question self-assessment quiz (which stays as the "quick check"). The score drives the headline number on the PDF cover.

## 5. Optional AI "deep" narrative (key-gated)

When `ANTHROPIC_API_KEY` is present, Claude reads the **engine-flagged findings + a compact data digest** and produces an accountant-style narrative summary and a prioritised fix list. The AI **only explains and prioritises engine output — it never generates or alters a figure.** With no key, the service returns deterministic findings only and reports `deepAvailable:false`.

## 6. Output

- JSON: `{ company, score, band, stats{checks_run, checks_passed, checks_failed, tb_rows, gl_rows}, findings[], confirmed[], narrative?, deepAvailable, deepUsed }`.
- Branded A4 **PDF** reusing the FS report's cover/style system, titled **"ACCOUNTING HEALTH REVIEW"**, cover result block = score/band, findings grouped by category.

## 7. Service shape & deployment

- **FastAPI** app, HTTP Basic auth (its own `APP_USER`/`APP_PASSWORD`, independent of the FS engine).
- Endpoints: `POST /api/health-review` (multipart: `tb` and/or `gl` files + optional flags), `GET /healthz`, `GET /api/config` (`{deepAvailable}`). Stateless, no DB, no Supabase.
- Stack: pandas + openpyxl (Excel), PyMuPDF (TB-in-PDF text parse), deterministic check core, ReportLab (PDF), `anthropic` (deep only).
- **New repo `a4-accounting-health`** with Dockerfile + railway.json; deployed as **its own Railway service** (EU region preferred for GDPR). Mirrors `a4-fs-review` conventions so the team has one mental model.

## 8. Website integration

- New proxy route `src/app/api/accounting-health/route.ts` — mirrors `fs-gap-review`: enforces the **same verified-email gate** (`isVerified`), validates files/consent, forwards `tb`/`gl` to `${A4_ACCOUNTING_URL}/api/health-review` with Basic auth, captures the lead email, streams files with no disk write, degrades to 503 if `A4_ACCOUNTING_URL` is unset.
- **Deep-review UI** (`DeepReview.tsx`) gains a top-level choice:
  - **"Accounting health (TB + GL)"** → new engine; shows a TB upload slot + an optional second **GL** upload slot.
  - **"Financial statements review"** → existing FS engine (current behaviour).
- Reuse the existing upload/consent/`FindingsList` components and the email-gate flow.
- New Vercel env: `A4_ACCOUNTING_URL`, `A4_ACCOUNTING_USER`, `A4_ACCOUNTING_PASS`.

## 9. Testing

- **Engine (pytest):** synthetic fixtures — one clean TB+GL set, plus per-check seeded-anomaly sets. Every check has a **positive** (fires) and **negative** (stays silent) test; computed figures asserted exactly. Smoke test for `/api/health-review` (TB-only, GL-only, both) and `/api/config`.
- **Website (vitest):** proxy validation (missing file / bad email / unverified token → 401 / no engine URL → 503) and a happy-path forward (mocked engine).

## 10. Rollout order

1. Engine repo: parsers → deterministic checks (TDD) → score → report PDF → FastAPI + auth → deploy to Railway.
2. Website: proxy route → DeepReview two-path UI → env vars → redeploy preview.
3. Verify end-to-end on the live preview behind the email gate.
