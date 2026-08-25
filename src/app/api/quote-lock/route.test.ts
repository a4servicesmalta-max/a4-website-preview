import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { issueQuoteLock, LOCK_COOKIE, LOCK_TTL_MS } from "@/lib/quote-lock";

function req(cookie?: string, qs = "?kind=audit") {
  const r = new NextRequest(`https://a4.com.mt/api/quote-lock${qs}`);
  if (cookie) r.cookies.set(LOCK_COOKIE, cookie);
  return r;
}

describe("GET /api/quote-lock", () => {
  it("returns the held fee when the cookie carries a valid lock", async () => {
    const body = await (await GET(req(issueQuoteLock(1650, "audit", "owner@example.com")))).json();
    expect(body.locked).toBe(true);
    expect(body.fee).toBe(1650);
    expect(body.expiresAt - body.issuedAt).toBe(LOCK_TTL_MS);
  });

  it("says not locked when there is no cookie at all", async () => {
    expect((await (await GET(req())).json()).locked).toBe(false);
  });

  it("refuses a lock belonging to a different email", async () => {
    const token = issueQuoteLock(1650, "audit", "first@example.com");
    const mine = await (await GET(req(token, "?kind=audit&email=first@example.com"))).json();
    expect(mine.fee).toBe(1650);
    const theirs = await (await GET(req(token, "?kind=audit&email=second@example.com"))).json();
    expect(theirs.locked).toBe(false);
  });

  it("never returns the basis or the prior fee we read from their statements", async () => {
    const body = await (await GET(req(issueQuoteLock(1650, "audit", null)))).json();
    for (const leak of ["basis", "detail", "detectedFees", "avgFee", "sizeModelFloor"]) {
      expect(body).not.toHaveProperty(leak);
    }
  });

  it("falls back to the audit quote rather than trusting an unknown kind", async () => {
    const body = await (await GET(req(issueQuoteLock(1650, "audit", null), "?kind=../etc/passwd"))).json();
    expect(body.locked).toBe(true);
    expect(body.kind).toBe("audit");
  });

  it("does not throw on a mangled cookie", async () => {
    const res = await GET(req("not.a.valid.token"));
    expect(res.status).toBe(200);
    expect((await res.json()).locked).toBe(false);
  });
});
