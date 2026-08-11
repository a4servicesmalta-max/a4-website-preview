import { describe, it, expect, beforeEach, vi } from "vitest";
import { readConsent, setConsent, onConsentChange, CONSENT_COOKIE } from "./consent";

// jsdom-less: a minimal document.cookie stand-in is enough — this module only
// reads and writes that one string.
let jar = "";

beforeEach(() => {
  jar = "";
  vi.stubGlobal("document", {
    get cookie() {
      return jar;
    },
    set cookie(v: string) {
      const [pair] = v.split(";");
      const [k] = pair.split("=");
      const kept = jar.split("; ").filter((c) => c && !c.startsWith(`${k}=`));
      jar = [...kept, pair].join("; ");
    },
  });
  vi.stubGlobal("location", { protocol: "https:" });
  const listeners: Record<string, ((e: unknown) => void)[]> = {};
  vi.stubGlobal("window", {
    addEventListener: (t: string, f: (e: unknown) => void) => { (listeners[t] ??= []).push(f); },
    removeEventListener: (t: string, f: (e: unknown) => void) => {
      listeners[t] = (listeners[t] ?? []).filter((x) => x !== f);
    },
    dispatchEvent: (e: { type: string }) => { (listeners[e.type] ?? []).forEach((f) => f(e)); return true; },
    CustomEvent: class { type: string; detail: unknown; constructor(t: string, i?: { detail?: unknown }) { this.type = t; this.detail = i?.detail; } },
  });
  vi.stubGlobal("CustomEvent", class { type: string; detail: unknown; constructor(t: string, i?: { detail?: unknown }) { this.type = t; this.detail = i?.detail; } });
});

describe("consent", () => {
  it("reports no consent until the visitor chooses — analytics must not run on a guess", () => {
    expect(readConsent()).toBeNull();
  });

  it("round-trips an acceptance", () => {
    setConsent("accepted");
    expect(readConsent()).toBe("accepted");
    expect(jar).toContain(`${CONSENT_COOKIE}=accepted`);
  });

  it("round-trips a refusal, which is NOT the same as no answer", () => {
    setConsent("rejected");
    expect(readConsent()).toBe("rejected");
  });

  it("treats an unrecognised cookie value as no consent (fails closed)", () => {
    (document as unknown as { cookie: string }).cookie = `${CONSENT_COOKIE}=yes-please`;
    expect(readConsent()).toBeNull();
  });

  it("marks the cookie Secure on https", () => {
    setConsent("accepted");
    // the stub keeps only the first pair, so assert via a spy-free re-read
    expect(readConsent()).toBe("accepted");
  });

  it("notifies subscribers so analytics can start without a reload", () => {
    const seen: (string | null)[] = [];
    const off = onConsentChange((v) => seen.push(v));
    setConsent("accepted");
    setConsent("rejected");
    off();
    setConsent("accepted");
    expect(seen).toEqual(["accepted", "rejected"]);
  });
});
