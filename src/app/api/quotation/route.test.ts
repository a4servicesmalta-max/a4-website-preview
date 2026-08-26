/**
 * The PDF route is the last place the independence rule can be enforced, and
 * the only one whose output leaves the browser. A downloaded quotation naming
 * a price for bookkeeping AND assurance would outlive every notice on screen,
 * so this route refuses that basket itself rather than trusting the builder —
 * it can be POSTed directly.
 */
import { it, expect, vi, beforeEach } from "vitest";
vi.mock("@/lib/portal", () => ({ pushToPortal: vi.fn(async () => {}) }));
vi.mock("@/lib/quotation-pdf", () => ({ renderQuotationPdf: vi.fn(async () => new Uint8Array([1, 2, 3])) }));
import { pushToPortal } from "@/lib/portal";
import { renderQuotationPdf } from "@/lib/quotation-pdf";
import { POST } from "./route";
import { INDEPENDENCE_CONFLICT } from "@/lib/independence";

const req = (o: unknown) => ({ json: async () => o }) as never;

const BASE = {
  name: "Jane Borg",
  email: "jane@example.com",
  company: "Borg Trading Ltd",
  industry: "Retail",
  sector: "shop",
  txn: "21-60",
  banks: 1,
  entity: "company",
  startMonth: "2026-09",
  catchUpMonths: 0,
};

beforeEach(() => vi.clearAllMocks());

it("refuses to price, record or render a bookkeeping + audit basket", async () => {
  const r = await POST(req({ ...BASE, services: ["accounts", "audit"] }));
  expect(r.status).toBe(422);
  const body = await r.json();
  expect(body.error).toBe(INDEPENDENCE_CONFLICT);
  expect(body.pdfBase64).toBeUndefined();
  expect(body.quote).toBeUndefined();
  // Refused BEFORE the document exists and before anything is recorded.
  expect(renderQuotationPdf).not.toHaveBeenCalled();
  expect(pushToPortal).not.toHaveBeenCalled();
});

it("refuses it however many other services ride along", async () => {
  const r = await POST(req({ ...BASE, services: ["vat", "audit", "payroll", "accounts", "mbr"] }));
  expect(r.status).toBe(422);
  expect(renderQuotationPdf).not.toHaveBeenCalled();
});

it("still issues the PDF for the bookkeeping side alone", async () => {
  const r = await POST(req({ ...BASE, services: ["accounts", "vat"] }));
  expect(r.status).toBe(200);
  const body = await r.json();
  expect(body.ok).toBe(true);
  expect(typeof body.pdfBase64).toBe("string");
  expect(body.quote.indicativeAnnualEur).toBeGreaterThan(0);
  expect(renderQuotationPdf).toHaveBeenCalledTimes(1);
});

it("still issues the PDF for the assurance side alone", async () => {
  const r = await POST(req({ ...BASE, services: ["audit", "vat"] }));
  expect(r.status).toBe(200);
  const body = await r.json();
  expect(body.ok).toBe(true);
  expect(typeof body.pdfBase64).toBe("string");
  expect(renderQuotationPdf).toHaveBeenCalledTimes(1);
});

it("keeps refusing the requests it already refused, in the same order", async () => {
  expect((await POST(req({ ...BASE, company: "", services: ["accounts"] }))).status).toBe(400);
  expect((await POST(req({ ...BASE, email: "nope", services: ["accounts"] }))).status).toBe(400);
  expect((await POST(req({ ...BASE, services: [] }))).status).toBe(400);
  expect((await POST(req({ ...BASE, startMonth: "", services: ["accounts"] }))).status).toBe(400);
  expect(renderQuotationPdf).not.toHaveBeenCalled();
});

/**
 * M4 — a sole trader is NEVER quoted the MBR annual return.
 *
 * The MBR annual return is a COMPANY filing. A Malta sole trader is not on the
 * Business Registry, files no annual return, and has no authorised share
 * capital for the registry fee to key on — so quoting it bills for a filing we
 * could not make on their behalf even if they paid.
 *
 * The rule was already enforced on vacei.com (`mbrApplies`) and on the A4
 * homepage wizard (`labour && entity === "company"`, test-pinned). This route
 * was the hole: it validated `entity` and `expenses` but never checked the
 * entity before accepting `mbr`, and `buildQuote` priced the baseline for any
 * entity. A self-employed visitor could download a PDF quoting it — and a PDF
 * is the artefact that outlives the page, which is exactly what this route's
 * own independence comment worries about.
 *
 * Gated in BOTH places (engine and route) on purpose: the route can be POSTed
 * directly, and the engine has other callers.
 */
const SOLE = { ...BASE, entity: "sole" };

it("drops the MBR annual return from a sole trader's quote and PDF", async () => {
  const r = await POST(req({ ...SOLE, services: ["accounts", "mbr"], expenses: "0-10k" }));
  expect(r.status).toBe(200);
  const body = await r.json();
  // Not in the quote…
  expect(body.quote.lines.some((l: { id: string }) => l.id === "mbr")).toBe(false);
  // …and not in what the PDF renderer was handed either.
  const [, renderedQuote] = vi.mocked(renderQuotationPdf).mock.calls[0];
  expect(renderedQuote.lines.some((l: { id: string }) => l.id === "mbr")).toBe(false);
  // The rest of the basket still prices — we drop one line, not the quote.
  expect(body.quote.lines.some((l: { id: string }) => l.id === "accounts")).toBe(true);
});

it("still quotes the MBR annual return to a company", async () => {
  const r = await POST(req({ ...BASE, services: ["accounts", "mbr"], expenses: "0-10k" }));
  expect(r.status).toBe(200);
  const body = await r.json();
  expect(body.quote.lines.some((l: { id: string }) => l.id === "mbr")).toBe(true);
});

it("does not charge a sole trader for it anywhere in the total", async () => {
  const sole = await (await POST(req({ ...SOLE, services: ["accounts", "mbr"], expenses: "0-10k" }))).json();
  const soleNoMbr = await (await POST(req({ ...SOLE, services: ["accounts"], expenses: "0-10k" }))).json();
  // Asking for it and not asking for it cost a sole trader exactly the same.
  expect(sole.quote.indicativeAnnualEur).toBe(soleNoMbr.quote.indicativeAnnualEur);
});

it("does not let mbr alone become an empty priced quote for a sole trader", async () => {
  // `mbr` was the only service asked for and it does not apply, so there is
  // nothing to quote — this must not render a €0 PDF.
  const r = await POST(req({ ...SOLE, services: ["mbr"] }));
  expect(r.status).toBe(400);
  expect(renderQuotationPdf).not.toHaveBeenCalled();
});
