import { describe, expect, it } from "vitest";
import {
  buildPresenceBody,
  externalReferrer,
  isValidSid,
  parseUtm,
  randomSid,
} from "./presence";

describe("presence body", () => {
  it("generates a valid sid", () => {
    const s = randomSid();
    expect(isValidSid(s)).toBe(true);
    expect(s).toHaveLength(32);
    expect(randomSid()).not.toBe(s);
  });

  it("omits same-host and empty referrers, keeps off-site ones", () => {
    expect(externalReferrer("", "a4.com.mt")).toBeUndefined();
    expect(externalReferrer("https://a4.com.mt/en/audit", "a4.com.mt")).toBeUndefined();
    expect(externalReferrer("https://www.google.com/", "a4.com.mt")).toBe("https://www.google.com/");
    expect(externalReferrer("not a url", "a4.com.mt")).toBeUndefined();
  });

  it("parses only the three campaign utm keys", () => {
    expect(parseUtm("?utm_source=li&utm_medium=cpc&utm_campaign=x&utm_term=t&foo=1")).toEqual({
      utm_source: "li",
      utm_medium: "cpc",
      utm_campaign: "x",
    });
    expect(parseUtm("")).toEqual({});
  });

  it("builds the wire body with no personal fields", () => {
    const body = buildPresenceBody(
      "abc",
      "/en/audit",
      "https://a4.com.mt/en",
      { utm_source: "li" },
      "a4.com.mt",
      "leave",
    );
    expect(body).toEqual({ sid: "abc", page: "/en/audit", utm_source: "li", event: "leave" });
    expect(buildPresenceBody("abc", "", "", {}, "a4.com.mt")).toEqual({ sid: "abc", page: "/" });
  });
});
