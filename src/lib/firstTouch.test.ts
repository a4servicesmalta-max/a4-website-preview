import { describe, expect, it } from "vitest";
import {
  ATTRIBUTION_COOKIE,
  attributionFromRequest,
  decodeAttribution,
  encodeAttribution,
  parseAttribution,
} from "./firstTouch";

/** A minimal stand-in for the NextRequest shape these helpers actually read. */
function reqWithCookie(header: string | null) {
  return { headers: { get: (name: string) => (name === "cookie" ? header : null) } };
}

describe("parseAttribution", () => {
  it("reads the UTM tags and both platforms' click IDs", () => {
    const attribution = parseAttribution(
      "?utm_source=google&utm_medium=cpc&utm_campaign=Malta+Audit&gclid=ABC123&li_fat_id=XYZ789"
    );
    expect(attribution).toEqual({
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "Malta Audit",
      gclid: "ABC123",
      liFatId: "XYZ789",
    });
  });

  it("records a click ID even when the ad carried no UTM tags at all", () => {
    // Google appends gclid by default with no tracking template configured.
    // If this returned null, that traffic would be permanently unattributable.
    expect(parseAttribution("?gclid=ONLY-CLICK-ID")).toEqual({ gclid: "ONLY-CLICK-ID" });
  });

  it("returns null for organic traffic, so the caller can tell it apart from empty values", () => {
    expect(parseAttribution("")).toBeNull();
    expect(parseAttribution("?ref=newsletter")).toBeNull();
    expect(parseAttribution("?utm_source=&gclid=")).toBeNull();
  });

  it("caps values so a hand-crafted URL cannot write an unbounded cookie", () => {
    const long = "x".repeat(5000);
    const attribution = parseAttribution(`?utm_campaign=${long}&gclid=${long}`);
    expect(attribution!.utmCampaign!.length).toBe(160);
    // Click IDs get a longer ceiling: a truncated gclid is useless for the one
    // job it has, and Google's has grown over the years.
    expect(attribution!.gclid!.length).toBe(512);
  });
});

describe("cookie round-trip", () => {
  it("survives campaign names containing the characters a cookie cannot hold", () => {
    // A raw ";" or "," in a cookie value truncates it — campaign names have both.
    const original = { utmCampaign: "Audit; Tax, Payroll = Q3", gclid: "ABC" };
    expect(decodeAttribution(encodeAttribution(original))).toEqual(original);
  });

  it("reads the attribution cookie out of a header holding several cookies", () => {
    const value = encodeAttribution({ utmSource: "linkedin", utmCampaign: "Bookkeeping" });
    const header = `session=abc123; ${ATTRIBUTION_COOKIE}=${value}; theme=dark`;
    expect(attributionFromRequest(reqWithCookie(header))).toEqual({
      utmSource: "linkedin",
      utmCampaign: "Bookkeeping",
    });
  });

  it("returns undefined when there is no cookie at all", () => {
    expect(attributionFromRequest(reqWithCookie(null))).toBeUndefined();
    expect(attributionFromRequest(reqWithCookie("session=abc123"))).toBeUndefined();
  });

  it("never throws on a request with no readable headers", () => {
    // This runs on the path of every lead submission. Attribution is a
    // nice-to-have; it must never be the reason an enquiry fails to send.
    for (const req of [
      {} as never,
      { headers: undefined } as never,
      { headers: {} } as never,
      {
        headers: {
          get() {
            throw new Error("no headers here");
          },
        },
      } as never,
    ]) {
      expect(() => attributionFromRequest(req)).not.toThrow();
      expect(attributionFromRequest(req)).toBeUndefined();
    }
  });
});

describe("decodeAttribution treats the cookie as hostile input", () => {
  it("never throws on a mangled value — a broken cookie costs attribution, not the lead", () => {
    for (const bad of ["", "not-json", "%%%", "null", "[]", '"a string"', "{{"]) {
      expect(() => decodeAttribution(bad)).not.toThrow();
      expect(decodeAttribution(bad)).toBeNull();
    }
  });

  it("drops unknown keys instead of forwarding them to the portal", () => {
    const hostile = encodeURIComponent(
      JSON.stringify({ utmSource: "google", isAdmin: true, __proto__: { x: 1 }, note: "<script>" })
    );
    expect(decodeAttribution(hostile)).toEqual({ utmSource: "google" });
  });

  it("drops non-string values and re-caps lengths rather than trusting what it wrote", () => {
    const hostile = encodeURIComponent(
      JSON.stringify({ utmSource: 42, utmCampaign: "y".repeat(9000), gclid: null })
    );
    const decoded = decodeAttribution(hostile);
    expect(decoded).not.toHaveProperty("utmSource");
    expect(decoded).not.toHaveProperty("gclid");
    expect(decoded!.utmCampaign!.length).toBe(160);
  });
});
