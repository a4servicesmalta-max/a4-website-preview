import { describe, it, expect } from "vitest";
import {
  issueQuoteLock,
  readQuoteLock,
  LOCK_TTL_MS,
} from "./quote-lock";

const T0 = 1_800_000_000_000;

describe("quote lock", () => {
  it("returns the same fee to the same visitor — the whole point", () => {
    const token = issueQuoteLock(1650, "audit", "owner@example.com", T0);
    const lock = readQuoteLock(token, "audit", "owner@example.com", T0 + 60_000);
    expect(lock?.fee).toBe(1650);
  });

  it("works with no email — the new-tab case, before one is given", () => {
    const token = issueQuoteLock(1650, "audit", null, T0);
    expect(readQuoteLock(token, "audit", undefined, T0)?.fee).toBe(1650);
  });

  it("holds for 30 days and not a moment longer", () => {
    const token = issueQuoteLock(1650, "audit", null, T0);
    expect(readQuoteLock(token, "audit", null, T0 + LOCK_TTL_MS - 1)).not.toBeNull();
    expect(readQuoteLock(token, "audit", null, T0 + LOCK_TTL_MS + 1)).toBeNull();
  });

  it("refuses a lock issued to a different email — a shared machine must not leak a fee", () => {
    const token = issueQuoteLock(1650, "audit", "first@example.com", T0);
    expect(readQuoteLock(token, "audit", "second@example.com", T0)).toBeNull();
    // …but the original owner still gets theirs, case-insensitively.
    expect(readQuoteLock(token, "audit", "FIRST@Example.com ", T0)?.fee).toBe(1650);
  });

  it("cannot be edited: tampering with the fee invalidates the signature", () => {
    const token = issueQuoteLock(1650, "audit", null, T0);
    const [body, mac] = token.split(".");
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    expect(payload.f).toBe(1650);
    payload.f = 600;                                   // a visitor tries to talk us down
    const forged = `${Buffer.from(JSON.stringify(payload)).toString("base64url")}.${mac}`;
    expect(readQuoteLock(forged, "audit", null, T0)).toBeNull();
  });

  it("rejects junk rather than throwing — a mangled cookie must not 500 a page", () => {
    for (const junk of ["", "  ", "not-a-token", "a.b", "....", "x".repeat(500)]) {
      expect(() => readQuoteLock(junk, "audit", null, T0)).not.toThrow();
      expect(readQuoteLock(junk, "audit", null, T0)).toBeNull();
    }
    expect(readQuoteLock(undefined, "audit")).toBeNull();
    expect(readQuoteLock(null, "audit")).toBeNull();
  });

  it("does not honour a lock minted for another kind of quote", () => {
    const token = issueQuoteLock(1650, "audit", null, T0);
    expect(readQuoteLock(token, "bookkeeping" as "audit", null, T0)).toBeNull();
  });
});
