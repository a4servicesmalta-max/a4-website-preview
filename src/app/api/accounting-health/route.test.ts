import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/email-verify", () => ({ isVerified: vi.fn(() => false) }));
import { isVerified } from "@/lib/email-verify";
import { POST } from "./route";

function form(fields: Record<string, string | Blob>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v as any);
  return { formData: async () => fd } as any;
}

beforeEach(() => { vi.clearAllMocks(); process.env.A4_ACCOUNTING_URL = "https://engine.test"; });

it("401s when email not verified", async () => {
  (isVerified as any).mockReturnValue(false);
  const res = await POST(form({ tb: new File(["x"], "tb.csv"), email: "a@b.com", consent: "true", verifiedToken: "bad" }));
  expect(res.status).toBe(401);
});

it("503s when engine url unset", async () => {
  (isVerified as any).mockReturnValue(true);
  delete process.env.A4_ACCOUNTING_URL;
  const res = await POST(form({ tb: new File(["x"], "tb.csv"), email: "a@b.com", consent: "true", verifiedToken: "ok" }));
  expect(res.status).toBe(503);
});

it("forwards to engine when verified", async () => {
  (isVerified as any).mockReturnValue(true);
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ score: 80, band: "Healthy" }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  const res = await POST(form({ tb: new File(["x"], "tb.csv"), email: "a@b.com", consent: "true", verifiedToken: "ok" }));
  expect(res.status).toBe(200);
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/api/health-review"), expect.objectContaining({ method: "POST" }));
});

it("400s with no files", async () => {
  (isVerified as any).mockReturnValue(true);
  const res = await POST(form({ email: "a@b.com", consent: "true", verifiedToken: "ok" }));
  expect(res.status).toBe(400);
});
