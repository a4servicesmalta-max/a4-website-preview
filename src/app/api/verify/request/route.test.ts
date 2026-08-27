import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("@/lib/portal-verify", () => ({ postBackend: vi.fn() }));
import { postBackend } from "@/lib/portal-verify";
import { POST } from "./route";
const body = (o: unknown) => ({ json: async () => o } as any);
beforeEach(() => vi.clearAllMocks());

it("400 on an invalid email without touching the backend", async () => {
  const r = await POST(body({ email: "nope" }));
  expect(r.status).toBe(400);
  expect(postBackend).not.toHaveBeenCalled();
});
it("maps a backend success to the shape the UI expects", async () => {
  (postBackend as any).mockResolvedValue({ ok: true, data: { delivered: true, challengeToken: "ch" } });
  const r = await POST(body({ email: "a@b.com" }));
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ ok: true, delivered: true, challengeToken: "ch" });
  expect(postBackend).toHaveBeenCalledWith("email-verify/request", { email: "a@b.com" }, expect.any(String));
});
it("passes the backend status and message through on failure (never a bare 500)", async () => {
  (postBackend as any).mockResolvedValue({ ok: false, status: 503, message: "Mail is down" });
  const r = await POST(body({ email: "a@b.com" }));
  expect(r.status).toBe(503);
  expect(await r.json()).toEqual({ error: "Mail is down" });
});
