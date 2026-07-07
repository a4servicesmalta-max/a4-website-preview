# Service Landing Pages — Detailed Review
### /audit-outsourcing · /automated-bookkeeping · /audit-services

**Date:** 2026-07-06 · **Method:** 3 independent source audits (one per page) + live browser QA on localhost:3100, cross-checked. Findings below are verified live unless marked "(source)".

---

## Verdict

All three pages **look finished but are demos wearing a production costume.** They share one systemic defect: **every interactive tool and lead form is client-side theatre** — calculators and "AI reviews" fabricate numbers, and the capture forms show *"we'll email you"* success screens while **posting nowhere** (no `/api/*`, no portal, no email). A prospect can configure a price, upload financial statements, or request a pilot, and the lead silently evaporates. On top of that, **the prices these pages show contradict the site's own `/quote` engine by 3–10×**, and several primary CTAs are broken links.

None of these three pages should be treated as lead-generating in their current state. The good news: the fixes are mechanical, and a correct, gated pattern already exists in the repo (`DeepReview.tsx` + `/api/fs-gap-review`, and the new `/api/quotation`).

---

## The systemic issues (affect all three)

### 1. Lead capture is cosmetic — HIGH (the #1 issue)
Every form's submit handler is a variant of:
```
const submit = () => { if (form.name && form.email) setDone(true); };
```
It flips a local boolean and renders a success message. There is **no `fetch`, no POST, no portal push, no email** anywhere in these pages.
- Audit-outsourcing "Request a pilot" → nothing (source: `OutsourceParts.tsx`)
- Automated-bookkeeping "Confirm call" modal → fake ref `"A4-"+Date.now()`, "we'll confirm by email within 2 business hours" (source: `a4-landing/LandingPlan.tsx:100`)
- Audit-services FS Review / estimator / overdue → fake ref, "report is on the way to {email}" (source: `FSReview.tsx`, `AuditEstimator.tsx`)

By contrast, the rest of the site (contact, quote, health-check, the new quotation builder) correctly pushes to `team.a4.com.mt` via `pushToPortal()`. **These pages just don't call it.** Result: the "we'll email you" promises are untrue as shipped.

### 2. Interactive tools fabricate data — HIGH
- **FS Review** (`audit-services/FSReview.tsx`) and the audit estimator's "already-audited" reader don't read the uploaded file — they **hash the filename** to produce a fake fee and fake findings. The file header comment even admits it: *"indicative demo … generated client-side from the file name."* A real, email-gated FS engine (`/api/fs-gap-review`) exists and is used correctly on `/accounting-health-check` — this page ships a fake one instead. Inviting clients to upload confidential statements into a widget that discards them is a real trust/compliance risk.
- **Overdue Check** (`AuditOverdue.tsx`) claims *"powered by Malta Business Registry data"* but searches a 5-row hardcoded object and, for any unknown company, **fabricates a registry number** (`"C " + random`) and an estimated MBR penalty. Presenting invented registry data as MBR data is risky for a licensed firm.

### 3. Prices contradict the `/quote` engine by 3–10× — HIGH
There is no single pricing source. `src/lib/quotation.ts` (the new quotation builder) says one thing; these pages hardcode another:

| Service | These landing pages | `/quote` engine (`quotation.ts`) | Gap |
|---|---|---|---|
| Bookkeeping | €25–€50 / mo | €140 / mo baseline (€119 smallest band) | ~3–5× |
| Statutory audit | **"from €600 / month"** (≈ €7,200/yr floor) | €1,200 / **year** | ~6× **and wrong unit** |
| VAT | €35/mo (€420/yr) | €360 / yr | unit/framing mismatch |

The audit "**/month**" unit is almost certainly a straight bug — a statutory audit is an annual fee. A prospect who uses `/quote` and a landing page sees numbers that look like a bait-and-switch.

### 4. `// @ts-nocheck` on every component file — MED
All landing-page component files disable TypeScript entirely, which is exactly why the unit bug, the divergent calculators, and dead imports never surfaced. Consistent with the known "`tsc --noEmit` gives false greens" issue on this codebase.

### 5. Dead / duplicated code — MED
- `automated-bookkeeping-standalone/` renders the **same** `LandingApp` as `/automated-bookkeeping` → its own 5-file component folder (~950 lines) is dead, and the route is a **duplicate URL** (SEO duplicate-content risk if indexable).
- `/automated-bookkeeping` imports `LandingPlan` from `@/components/a4-landing/` (the live one), so the **co-located** `automated-bookkeeping/components/{LandingPlan,HeroFX,PortalMockup,Primitives}.tsx` are **also dead** — and the two `LandingPlan` copies have **diverged** (different VAT tiers, entity toggle, trust copy). Two drifting calculators guarantee future contradiction.
- `HeroFX.tsx` (full canvas animation) is **never mounted** on the bookkeeping page — the hero uses a static CSS background instead.
- Audit-outsourcing defines `OSNav`, `OSCollab`, and a `OS_PORTAL` constant that are **never rendered/used**.

---

## Per-page findings

### `/audit-outsourcing` — "Outsource your audits. Keep the final say."
Strong hero, portal mockup, and a complete section structure (process → two portals → audit file → value props → apply). But:
- **Conversion path is fully broken (HIGH):** "Partner with us" → `/en#apply` (goes to the *homepage*, not the on-page form — the in-page anchor got a locale prefix); "Book a consultation" → `/en/en/contact` (**doubled locale → real 404**); "Request a pilot" form → posts nowhere.
- **Cross-brand leak (MED):** the page `<title>` is **"Audit Outsourcing — Vacei × A4 Services"** — "Vacei" in the A4 browser tab / SEO title. Hero also shows "A4 × Vacei" co-branding. Body has 0 Vacei mentions, so the title leak looks unintended.
- **Public hard commitments (MED, business call):** "from just 15% of the audit fee" and "first small-client audit free" (undefined "small", no T&Cs) stated as unconditional in 4 places.
- **No social proof / no credentials badge** on a page pitching *other firms* — the biggest missing trust element for this audience.
- Form inputs are placeholder-only (no labels); email field isn't validated.

### `/automated-bookkeeping` — "Bookkeeping from €25/month."
Polished, genuinely interactive calculator (toggles/steppers/VAT frequency all live and correct arithmetic). But:
- **"from €25/month" headline sits above a calculator that defaults to €100/mo** (verified live) — the €25 entry price is only reachable by downgrading the tier and switching off two defaults. Reads as misleading.
- **Booking modal posts nowhere** (fake ref + "we'll email you"); **"Create account & request"** goes to the portal but **drops all the configured plan/price data** — the portal gets an anonymous hit, not a contextual lead.
- **PortalMockup shows €185/mo** built from unit prices (bookkeeping €75, recon €60, VAT €30) that **don't exist in the calculator below it** — two priced surfaces on one page disagree.
- Strong claim to verify: "a licensed audit firm checks and finalises **every** set of books" at €25/mo — confirm that's literally true operationally.
- Modal has no `role="dialog"`/focus-trap/Esc.

### `/audit-services` — "Need an audit? We make it simple."
The most feature-rich page (fee estimator + FS review + overdue check) and the most problematic, because all three tools are fake (see systemic #2).
- **Estimator shows "Statutory audit, from €600/month"** (verified live) — wrong unit and ~6× the `/quote` engine's annual figure.
- **FS Review is a filename-hash mock** while the real gated engine sits one folder away — highest-risk item (clients upload real statements → discarded).
- **Overdue Check fabricates MBR registry numbers** and labels them "Malta Business Registry data."
- Of ~15 CTAs, exactly **one** reaches a real destination (`CLIENT_ONBOARDING_URL`); `CALENDLY_BOOKING_URL` exists but is never used despite "Book a consultation" appearing 4×.
- "On-time filing, guaranteed" — hard guarantee with no qualifier.
- Same `/en/en/contact` 404 recurs here.

---

## Prioritized fix list

**P0 — before these can be called lead pages**
1. Wire every form to `pushToPortal()` (and/or `/api/quote`) — copy the pattern already used site-wide. Kill the fake "A4-…" refs and "we'll email you" screens until real.
2. Wire `FSReview.tsx` to the real `/api/fs-gap-review` **with the email-verify gate** (copy `DeepReview.tsx`). Or remove the upload tool. Do not accept client statements into a mock.
3. Fix broken CTAs: `/en/en/contact` (doubled locale), in-page anchors that jump to the homepage (`/en#apply`, `/en#how`, `#estimate` via locale-prefixed `Button`).

**P1 — correctness / trust**
4. Single pricing source: reconcile the bookkeeping/audit/VAT numbers with `quotation.ts`; fix the audit "/month" → "/year"; make the €25 and €600 headlines match what the calculators actually output; align the €185 mockup.
5. Either make the "MBR data" real or relabel the overdue tool as an illustrative estimate.
6. Resolve the "Vacei ×" title leak on audit-outsourcing.
7. Decide/qualify the public commitments ("15% / first audit free", "on-time filing guaranteed", "licensed audit firm reviews every set of books").

**P2 — hygiene**
8. Delete dead duplicates: `automated-bookkeeping-standalone/` (+ its dead components), the co-located `automated-bookkeeping/components/*`, unused `OSNav/OSCollab/HeroFX`. Decide if the standalone route should 404/redirect.
9. Remove `// @ts-nocheck` and fix what surfaces.
10. Add labels to form inputs, `role="dialog"` to modals, social proof/credentials to audit-outsourcing.

---
*Review only — no code changed. Ready to execute any tier on request; P0 items are quick because the correct wiring already exists elsewhere in this repo.*
