import { describe, it, expect } from "vitest";
import { withLocale } from "./localized-path";

describe("withLocale", () => {
  it("prefixes a plain path with the locale", () => {
    expect(withLocale("en", "/contact")).toBe("/en/contact");
  });
  it("prefixes root with the locale", () => {
    expect(withLocale("en", "/")).toBe("/en");
  });
  it("keeps a pure same-page hash anchor unprefixed", () => {
    expect(withLocale("en", "#apply")).toBe("#apply");
  });
  it("keeps a same-page hash anchor unprefixed on any locale", () => {
    expect(withLocale("fr", "#estimate")).toBe("#estimate");
  });
  it("returns external URLs unchanged", () => {
    expect(withLocale("en", "https://example.com")).toBe("https://example.com");
  });
});
