import { it, expect, vi, beforeEach } from "vitest";
vi.mock("@/lib/portal", () => ({ pushToPortal: vi.fn(async () => {}) }));
vi.mock("@/lib/portal-chat", () => ({ pushChatToPortal: vi.fn(async () => ({ threadId: "t1" })) }));
vi.mock("@/lib/portal-lead", () => ({
  pushLeadToPortal: vi.fn(async () => true),
  // Campaign attribution from the first-touch cookie; "organic" here.
  provenanceOf: vi.fn(() => undefined),
}));
import { pushChatToPortal } from "@/lib/portal-chat";
import { pushLeadToPortal } from "@/lib/portal-lead";
import { POST } from "./route";

// The route only ever touches req.json/cookies/headers.
const req = (o: unknown) =>
  ({
    json: async () => o,
    cookies: { get: () => undefined },
    headers: { get: () => null },
  }) as never;

beforeEach(() => vi.clearAllMocks());

it("drops a submission whose honeypot is filled, without telling the bot", async () => {
  const r = await POST(req({ name: "N", email: "a@b.com", issue: "hi", company_website: "http://spam" }));
  expect(r.status).toBe(200);
  expect(await r.json()).toEqual({ ok: true, thread: true });
  expect(pushChatToPortal).not.toHaveBeenCalled();
  expect(pushLeadToPortal).not.toHaveBeenCalled();
});

it("opens the support thread with the captured name and email, and lets the portal file the lead", async () => {
  const r = await POST(req({ name: " Jane ", email: " jane@x.com ", issue: " help ", company_website: "" }));
  expect(r.status).toBe(200);
  expect(pushChatToPortal).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Jane", email: "jane@x.com", message: "help" })
  );
  // The chat session already records the WebsiteLead — a second one would double-lead.
  expect(pushLeadToPortal).not.toHaveBeenCalled();
});

it("files the lead itself only when the support thread could not be opened", async () => {
  vi.mocked(pushChatToPortal).mockResolvedValueOnce(null);
  const r = await POST(req({ name: "Jane", email: "jane@x.com", issue: "help", company_website: "" }));
  expect(r.status).toBe(200);
  expect(pushLeadToPortal).toHaveBeenCalledWith({ name: "Jane", email: "jane@x.com", message: "help" });
});
