import { afterEach, describe, expect, it } from "vitest";
import {
  CONSENT_DEFAULT,
  CONSENT_GRANTED,
  GA4_ID,
  GADS_ID,
  TRACKING_ENABLED,
  trackConversion,
  updateConsent,
} from "@/lib/analytics";

/**
 * The point of these tests is the LAUNCH-SAFE state: with no NEXT_PUBLIC_GA4_ID
 * and no NEXT_PUBLIC_GADS_ID, nothing renders, nothing fires, and nothing throws.
 * That is what protects the site while the real IDs are still missing.
 *
 * The vitest env is `node`, so `window` is genuinely absent unless a test adds it.
 */

type FakeWindow = { gtag?: (...args: unknown[]) => void };

function withWindow(w: FakeWindow | undefined) {
  (globalThis as unknown as { window?: FakeWindow }).window = w;
}

afterEach(() => {
  delete (globalThis as unknown as { window?: FakeWindow }).window;
});

describe("configuration", () => {
  it("treats unset env vars as unconfigured", () => {
    // No NEXT_PUBLIC_* set in the test env — this is the shipped default until
    // a human fills the IDs in. If this ever fails, an ID got hardcoded.
    expect(GA4_ID).toBe("");
    expect(GADS_ID).toBe("");
    expect(TRACKING_ENABLED).toBe(false);
  });

  it("denies every non-essential storage type by default", () => {
    expect(CONSENT_DEFAULT.ad_storage).toBe("denied");
    expect(CONSENT_DEFAULT.ad_user_data).toBe("denied");
    expect(CONSENT_DEFAULT.ad_personalization).toBe("denied");
    expect(CONSENT_DEFAULT.analytics_storage).toBe("denied");
    expect(CONSENT_GRANTED.ad_storage).toBe("granted");
  });
});

describe("trackConversion — no-op when unconfigured", () => {
  it("does not throw on the server, where there is no window", () => {
    expect(() => trackConversion("contact_form_submit")).not.toThrow();
  });

  it("does not throw when the page has no gtag (no IDs → no script rendered)", () => {
    withWindow({});
    expect(() => trackConversion("quote_form_submit", { value: 120 })).not.toThrow();
  });

  it("reports no Google Ads conversion while no conversion labels are set", () => {
    const calls: unknown[][] = [];
    withWindow({ gtag: (...args: unknown[]) => calls.push(args) });

    trackConversion("quote_request_home_calculator");
    trackConversion("quote_request_pricing");
    trackConversion("contact_form_submit");
    trackConversion("quote_form_submit");
    trackConversion("financial_upload_submit");

    // The GA4 event is emitted (harmless with no GA4 destination configured),
    // but without an Ads ID + label there is no conversion action to credit.
    expect(calls).toHaveLength(5);
    expect(calls.every((c) => c[0] === "event")).toBe(true);
    expect(calls.some((c) => c[1] === "conversion")).toBe(false);
  });

  it("emits one distinctly named event per lead action", () => {
    const names: unknown[] = [];
    withWindow({ gtag: (...args: unknown[]) => names.push(args[1]) });

    trackConversion("quote_request_home_calculator");
    trackConversion("quote_request_pricing");
    trackConversion("contact_form_submit");
    trackConversion("quote_form_submit");
    trackConversion("financial_upload_submit");

    expect(new Set(names).size).toBe(5);
  });

  it("passes a value through with a currency, and omits both when absent", () => {
    const calls: unknown[][] = [];
    withWindow({ gtag: (...args: unknown[]) => calls.push(args) });

    trackConversion("contact_form_submit");
    trackConversion("quote_form_submit", { value: 250 });

    expect(calls[0][2]).toEqual({});
    expect(calls[1][2]).toEqual({ value: 250, currency: "EUR" });
  });

  it("ignores an event name that is not in the union", () => {
    const calls: unknown[][] = [];
    withWindow({ gtag: (...args: unknown[]) => calls.push(args) });

    // Cast: guards against a stale string surviving a rename at runtime.
    trackConversion("toString" as never);
    trackConversion("not_a_real_event" as never);

    expect(calls).toHaveLength(0);
  });
});

describe("updateConsent", () => {
  it("no-ops with no window and with no gtag", () => {
    expect(() => updateConsent("accepted")).not.toThrow();
    withWindow({});
    expect(() => updateConsent("rejected")).not.toThrow();
  });

  it("grants on accept and keeps everything denied on reject", () => {
    const calls: unknown[][] = [];
    withWindow({ gtag: (...args: unknown[]) => calls.push(args) });

    updateConsent("accepted");
    expect(calls[0]).toEqual(["consent", "update", CONSENT_GRANTED]);
    expect(calls[1]).toEqual(["set", "ads_data_redaction", false]);

    calls.length = 0;
    updateConsent("rejected");
    expect(calls[0]).toEqual(["consent", "update", CONSENT_DEFAULT]);
    expect(calls[1]).toEqual(["set", "ads_data_redaction", true]);
  });
});
