import { describe, it, expect } from "vitest";
import { withLocale } from "./localized-path";

describe("withLocale", () => {
  it("leaves a plain path bare for the default locale", () => {
    expect(withLocale("en", "/contact")).toBe("/contact");
  });
  it("prefixes a plain path with a non-default locale", () => {
    expect(withLocale("fr", "/contact")).toBe("/fr/contact");
  });
  it("leaves root bare for the default locale", () => {
    expect(withLocale("en", "/")).toBe("/");
  });
  it("prefixes root with a non-default locale", () => {
    expect(withLocale("fr", "/")).toBe("/fr");
  });
  it("keeps a pure same-page hash anchor unprefixed", () => {
    expect(withLocale("en", "#apply")).toBe("#apply");
  });
  it("keeps query before fragment on a same-page reference", () => {
    expect(withLocale("en", "?ref=x#apply")).toBe("?ref=x#apply");
  });
  it("keeps a same-page hash anchor unprefixed on any locale", () => {
    expect(withLocale("fr", "#estimate")).toBe("#estimate");
  });
  it("returns external URLs unchanged", () => {
    expect(withLocale("en", "https://example.com")).toBe("https://example.com");
  });
  it("strips an already-localized default-locale path down to bare", () => {
    expect(withLocale("en", "/en/contact")).toBe("/contact");
  });
  it("retargets an already-localized path to the requested locale", () => {
    expect(withLocale("en", "/fr/contact")).toBe("/contact");
    expect(withLocale("fr", "/en/contact")).toBe("/fr/contact");
    expect(withLocale("de", "/fr/contact")).toBe("/de/contact");
  });
  it("retargets a bare locale root", () => {
    expect(withLocale("de", "/en")).toBe("/de");
    expect(withLocale("en", "/fr")).toBe("/");
  });
  it("keeps query and hash rooted when stripping down to the locale root", () => {
    expect(withLocale("en", "/en?ref=x")).toBe("/?ref=x");
    expect(withLocale("en", "/en#apply")).toBe("/#apply");
    expect(withLocale("fr", "/en?ref=x")).toBe("/fr?ref=x");
  });
});
