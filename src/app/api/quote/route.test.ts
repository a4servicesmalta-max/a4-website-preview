/**
 * M1 — the server-side independence derivation on /api/quote could never fire.
 *
 * The route builds its service list as
 *   `Array.isArray(meta?.services) ? meta.services.map(String)
 *    : meta?.service ? [String(meta.service)] : []`
 * and then matches it with an EXACT `ids.includes(s)` against `["Bookkeeping"]`
 * / `["Audit & Annual Accounts"]`. Two of the three real clients never produce
 * a value that can match:
 *
 *  - `QuoteContent` sends `services` and `service` as ONE COMMA-JOINED STRING,
 *    so `Array.isArray` is false and the fallback wraps the whole joined string
 *    in a single-element array: `["Bookkeeping, Audit & Annual Accounts"]`.
 *    A prospect who ticked BOTH was routed `neutral`.
 *  - `QuoteActions` (the estimator handoff) sends `service: "Accounting &
 *    bookkeeping"` — a page label, not one of the canonical form ids — so it
 *    was `neutral` too, while the SAME payload carried
 *    `answers: [{ k: "Audit eligible", v: "false" }]`. One lead, two
 *    contradictory statements about whether A4 may audit this client.
 *
 * The route's own comment claims the flag is "derived server-side… never
 * trusted from a client-supplied boolean", which is exactly why it has to work:
 * it is the only thing standing between a direct POST and a mis-routed lead.
 *
 * These post the REAL payload shapes each client sends, not a tidied-up
 * version of them.
 */
import { it, expect, vi, beforeEach, describe } from "vitest";

vi.mock("@/lib/portal", () => ({ pushToPortal: vi.fn(async () => {}) }));
vi.mock("@/lib/portal-lead", () => ({
  pushLeadToPortal: vi.fn(async () => true),
  pageUrlOf: vi.fn(() => "https://a4.com.mt/quote"),
  // Campaign attribution from the first-touch cookie. Mocked as "organic" —
  // these tests are about independence routing, not attribution.
  provenanceOf: vi.fn(() => undefined),
}));
vi.mock("nodemailer", () => ({ default: { createTransport: vi.fn(() => ({ sendMail: vi.fn(async () => {}) })) } }));

import { pushLeadToPortal } from "@/lib/portal-lead";
import { POST } from "./route";

const req = (body: unknown) =>
  ({
    headers: { get: () => "application/json" },
    json: async () => body,
    url: "https://a4.com.mt/quote",
  }) as never;

/** The independence flags the route actually forwarded with the lead. */
const routed = () => vi.mocked(pushLeadToPortal).mock.calls[0][0].independence;

const BASE = { name: "Jane Borg", email: "jane@example.com" };

beforeEach(() => vi.clearAllMocks());

describe("QuoteContent — comma-joined strings", () => {
  it("routes a bookkeeping + audit tick to CONFLICT, not neutral", async () => {
    // Exactly what QuoteContent sends: `sel.join(", ")` in both fields.
    await POST(req({
      ...BASE,
      meta: {
        services: "Bookkeeping, Audit & Annual Accounts",
        service: "Bookkeeping, Audit & Annual Accounts",
      },
    }));
    expect(routed()).toMatchObject({
      route: "conflict",
      auditEligible: false,
      bookkeepingEligible: false,
    });
  });

  it("routes a bookkeeping-only enquiry to bookkeeping", async () => {
    await POST(req({ ...BASE, meta: { services: "Bookkeeping", service: "Bookkeeping" } }));
    expect(routed()).toMatchObject({ route: "bookkeeping", auditEligible: false });
  });

  it("routes an audit-only enquiry to audit", async () => {
    await POST(req({ ...BASE, meta: { services: "Audit & Annual Accounts", service: "Audit & Annual Accounts" } }));
    expect(routed()).toMatchObject({ route: "audit", bookkeepingEligible: false });
  });

  it("survives the whitespace a join produces, in either order", async () => {
    await POST(req({ ...BASE, meta: { services: "VAT / Tax,Audit & Annual Accounts ,  Bookkeeping" } }));
    expect(routed()).toMatchObject({ route: "conflict" });
  });

  it("leaves an unrelated basket neutral", async () => {
    await POST(req({ ...BASE, meta: { services: "Payroll, VAT / Tax" } }));
    expect(routed()).toMatchObject({ route: "neutral", auditEligible: true, bookkeepingEligible: true });
  });
});

describe("QuoteActions — the estimator handoff", () => {
  it("routes the accounting estimator's own service label to bookkeeping", async () => {
    // The estimator hands off `service: "Accounting & bookkeeping"` — a page
    // label. Its own payload asserts `Audit eligible: false`, so the lead must
    // not simultaneously say `route=neutral · audit_eligible=true`.
    await POST(req({ ...BASE, meta: { service: "Accounting & bookkeeping", intent: "proposal" } }));
    expect(routed()).toMatchObject({ route: "bookkeeping", auditEligible: false });
  });

  it("prefers the canonical ids when the client sends them", async () => {
    // The estimator now states them outright as well, so the derivation does
    // not have to rely on a label match at all.
    await POST(req({ ...BASE, meta: { service: "Accounting & bookkeeping", services: ["Bookkeeping"] } }));
    expect(routed()).toMatchObject({ route: "bookkeeping", auditEligible: false });
  });
});

describe("ProcessStepsSection — a real array", () => {
  it("keeps working, and still reaches conflict", async () => {
    await POST(req({
      ...BASE,
      meta: { services: ["Bookkeeping", "Audit & Annual Accounts"], auditEligible: true },
    }));
    // Derived from the SERVICES, never from the client's `auditEligible: true`
    // — which is the whole claim the route's comment makes.
    expect(routed()).toMatchObject({ route: "conflict", auditEligible: false });
  });

  it("ignores a client-supplied boolean that contradicts the selection", async () => {
    await POST(req({ ...BASE, meta: { services: ["Bookkeeping"], auditEligible: true } }));
    expect(routed()).toMatchObject({ route: "bookkeeping", auditEligible: false });
  });
});

describe("degenerate input", () => {
  it("is neutral when nothing is selected", async () => {
    await POST(req({ ...BASE, meta: {} }));
    expect(routed()).toMatchObject({ route: "neutral" });
  });

  it("does not crash on odd shapes", async () => {
    for (const services of [null, 42, {}, [""], ["  "], [null]]) {
      vi.clearAllMocks();
      const r = await POST(req({ ...BASE, meta: { services } }));
      expect(r.status).toBe(200);
    }
  });
});
