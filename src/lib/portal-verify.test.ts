import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkVerified, sendAuditQuoteEmail, postBackend, A4_ORIGIN } from "./portal-verify";

const fetchMock = vi.fn();
beforeEach(() => { fetchMock.mockReset(); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => vi.unstubAllGlobals());

const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

describe("checkVerified (fail closed)", () => {
  it("true only when the backend says verified:true, sending the A4 Origin", async () => {
    fetchMock.mockResolvedValue(reply(200, { success: true, data: { verified: true } }));
    expect(await checkVerified("a@b.com", "tok")).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/public\/email-verify\/check$/);
    expect(init.headers.Origin).toBe(A4_ORIGIN);
    expect(JSON.parse(init.body)).toEqual({ email: "a@b.com", verifiedToken: "tok" });
  });
  it("false on verified:false, non-2xx, malformed body, network error, or missing token", async () => {
    fetchMock.mockResolvedValueOnce(reply(200, { data: { verified: false } }));
    expect(await checkVerified("a@b.com", "tok")).toBe(false);
    fetchMock.mockResolvedValueOnce(reply(401, { message: "bad token" }));
    expect(await checkVerified("a@b.com", "tok")).toBe(false);
    fetchMock.mockResolvedValueOnce(new Response("not json", { status: 200 }));
    expect(await checkVerified("a@b.com", "tok")).toBe(false);
    fetchMock.mockRejectedValueOnce(new Error("ECONNRESET"));
    expect(await checkVerified("a@b.com", "tok")).toBe(false);
    expect(await checkVerified("a@b.com", "")).toBe(false);
  });
});

describe("sendAuditQuoteEmail", () => {
  it("rounds the fee and returns the backend's emailed flag", async () => {
    fetchMock.mockResolvedValue(reply(200, { data: { emailed: true } }));
    expect(await sendAuditQuoteEmail({ email: "a@b.com", verifiedToken: "t", name: "A", fee: 899.6, docKind: "audited_fs" })).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/public\/audit-quote-email$/);
    expect(JSON.parse(init.body).fee).toBe(900);
  });
  it("false on 401 / network error", async () => {
    fetchMock.mockResolvedValueOnce(reply(401, { message: "invalid token" }));
    expect(await sendAuditQuoteEmail({ email: "a@b.com", verifiedToken: "t", fee: 1 })).toBe(false);
    fetchMock.mockRejectedValueOnce(new Error("timeout"));
    expect(await sendAuditQuoteEmail({ email: "a@b.com", verifiedToken: "t", fee: 1 })).toBe(false);
  });
});

describe("postBackend", () => {
  it("passes the backend status + message through on failure, and a 503 with the fallback on network error", async () => {
    fetchMock.mockResolvedValueOnce(reply(429, { message: "Too many requests" }));
    expect(await postBackend("email-verify/request", {}, "fallback")).toEqual({ ok: false, status: 429, message: "Too many requests" });
    fetchMock.mockRejectedValueOnce(new Error("down"));
    expect(await postBackend("email-verify/request", {}, "fallback")).toEqual({ ok: false, status: 503, message: "fallback" });
  });
});
