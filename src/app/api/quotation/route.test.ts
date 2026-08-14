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
  revenueBand: "100k-500k",
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
