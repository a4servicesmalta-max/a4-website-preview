# A4 Paid Landing Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan.

**Goal:** Make A4's audit and automated-bookkeeping pages safe to advertise by validating real uploads, keeping calculator/copy prices aligned to the shared quote pack, fixing booking-duration and destination mismatches, preserving accessible forms, and proving the production build.

**Architecture:** `a4QuotePack.ts` remains the single pricing authority. The audit page validates files locally and delegates the actual review to the existing API; only a successful engine quote may override a questionnaire fee. React components render the pages, Vitest locks functional and message contracts, and Playwright checks the built UI with network routes mocked.

**Tech Stack:** Next.js, React, TypeScript, Vitest, Python Playwright.

---

### Task 1: Lock upload validation and fee authority

**Files:**
- Verify: `src/lib/review-file.ts`
- Verify: `src/lib/review-file.test.ts`
- Modify: `src/app/[locale]/audit-services/components/AuditEstimator.tsx`
- Modify: `src/lib/audit-fee.test.ts`

**Step 1: Run the focused validation tests**

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\vitest\vitest.mjs' run src/lib/review-file.test.ts src/lib/audit-fee.test.ts
```

Expected: PDF/DOC/DOCX up to 20 MB pass; unsupported and oversized files fail.

**Step 2: Confirm estimator behavior in source**

Require `chooseFile()` for click and drop paths, a resettable inline `fileError`, named/autocomplete fields, conversion tracking only after a successful lead response, and `data.quote.fee` as the only fresh engine override.

### Task 2: Make booking duration and destinations consistent

**Files:**
- Create: `src/components/a4-landing/paid-landing-contract.test.ts`
- Modify: `src/components/a4-landing/LandingPlan.tsx`
- Modify: `src/components/common/FloatingActionDock.tsx`
- Verify: `src/app/[locale]/audit-services/components/AuditParts.tsx`

**Step 1: Write the failing contract test**

Read the relevant component sources and assert:

```ts
expect(landingPlan).not.toMatch(/15-min/);
expect(landingPlan).toMatch(/30-minute call/);
expect(floatingDock).toContain("Book a free 30-min call");
expect(auditParts).toContain('href="/book-a-call"');
```

**Step 2: Run the test to verify RED**

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\vitest\vitest.mjs' run src/components/a4-landing/paid-landing-contract.test.ts
```

Expected: FAIL because the calculator modal and floating CTA still say 15 minutes while `BookACallContent.tsx` uses `demo-30`.

**Step 3: Apply the minimal copy fix**

Change every 15-minute promise in the paid-page calculator and shared floating CTA to 30 minutes. Do not change the scheduler type or backend contract.

**Step 4: Run the contract test to verify GREEN**

Expected: PASS.

### Task 3: Lock A4 pricing and ad-message parity

**Files:**
- Modify: `src/components/a4-landing/paid-landing-contract.test.ts`
- Verify: `src/data/a4QuotePack.ts`
- Verify: `src/components/a4-landing/LandingQuoteCalculator.test.ts`
- Verify: `src/app/[locale]/automated-bookkeeping/components/LandingParts.tsx`
- Verify: `src/app/[locale]/automated-bookkeeping/page.tsx`
- Verify: `src/app/[locale]/audit-services/components/AuditEstimator.tsx`

**Step 1: Add source and calculation contracts**

Assert that the bookkeeping hero/copy expose €24 and €49, metadata does the same, the first bank account has zero uplift, and the audit annual-tax helper interpolates `TAX_RETURN_FROM` rather than a stale literal.

**Step 2: Run focused pricing tests**

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\vitest\vitest.mjs' run src/components/a4-landing/paid-landing-contract.test.ts src/components/a4-landing/LandingQuoteCalculator.test.ts src/lib/accounting-fee.test.ts src/lib/audit-fee.test.ts
```

Expected: all focused tests pass.

### Task 4: Exercise both A4 paid pages in a real browser

**Files:**
- Create: `tests/paid-landing-browser.py`
- Verify: `src/app/[locale]/audit-services/**`
- Verify: `src/app/[locale]/automated-bookkeeping/**`

**Step 1: Inspect the server wrapper interface**

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' 'C:\Users\User\Dropbox\Claude\.agents\skills\webapp-testing\scripts\with_server.py' --help
```

**Step 2: Write Playwright checks**

Test desktop and 390px mobile widths, calculator parity, €24/€49 entry copy, tax-return helper, `/book-a-call` destinations, named/labelled form controls, invalid-file errors, no fee change on file selection, API failure fallback, successful engine-fee replacement, modal keyboard behavior, and console/page errors. Mock lead/review/scheduling calls; do not send a real lead or document.

**Step 3: Run against a local production build**

Build first, then use the wrapper to start the site on port 4174 and run the browser script.

### Task 5: Full A4 verification

**Files:**
- Verify: all modified and new files

**Step 1: Run the complete test suite**

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\vitest\vitest.mjs' run
```

Expected: all tests pass.

**Step 2: Run a fresh production build**

```powershell
& 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' 'node_modules\next\dist\bin\next' build
```

Expected: build completes with no type, lint, or route-generation error.

**Step 3: Review the exact diff**

```powershell
git diff --check
git status --short
git diff -- src/app/[locale]/audit-services src/app/[locale]/automated-bookkeeping src/components/a4-landing src/components/common/FloatingActionDock.tsx src/components/common/CookieConsentBanner.tsx src/lib/review-file.ts src/lib/review-file.test.ts src/lib/analytics.ts
```

Confirm there are no credentials, placeholder conversion labels, generated artefacts, or unrelated reversions.

**Step 4: Stop before outbound release**

Pushing, merging, and deploying require explicit owner approval. After release, repeat the same browser assertions on `https://a4.com.mt/audit-services` and `https://a4.com.mt/automated-bookkeeping` before issuing GO.

---

**Self-review:** The plan covers the real scheduler duration, canonical CTA routes, €24/€49 and shared-pack parity, the audit tax-return helper, file constraints, form semantics, backend-authoritative pricing, desktop/mobile behavior, console errors, complete tests, production build, and production re-verification. Component/API field names are preserved and no credentials or fake-success behavior are introduced.
