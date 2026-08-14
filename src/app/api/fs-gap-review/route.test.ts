import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/email-verify", () => ({ isVerified: vi.fn(() => true) }));
vi.mock("@/lib/portal", () => ({ pushToPortal: vi.fn(async () => {}) }));
vi.mock("@/lib/fs-review-engine", () => ({ engineFetch: vi.fn() }));
vi.mock("@/lib/ai-review", () => ({ augmentWithAiCommentary: vi.fn(async (d: unknown) => d) }));

import { isVerified } from "@/lib/email-verify";
import { pushToPortal } from "@/lib/portal";
import { engineFetch } from "@/lib/fs-review-engine";
import { augmentWithAiCommentary } from "@/lib/ai-review";
import { POST } from "./route";

function form(fields: Record<string, string | Blob>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v as any);
  return { formData: async () => fd } as any;
}

const engineOkBody = {
  company: "Acme Ltd",
  framework: "GAPSME",
  method: "block-extraction",
  stats: { checks_run: 10, checks_passed: 10, checks_failed: 0, framework: "GAPSME" },
  findings: [],
  confirmed: [],
  reportBase64: "",
  reportName: "r.pdf",
  annotatedDocxBase64: null,
  annotatedName: null,
  quote: { fee: 900, docKind: "audited_fs", basis: "secret-internal-basis" },
};

beforeEach(() => {
  vi.clearAllMocks();
  (isVerified as any).mockReturnValue(true);
  process.env.A4_FSREVIEW_URL = "https://engine.test";
});

function baseFields(): Record<string, string | Blob> {
  return {
    file: new File(["x"], "statements.pdf"),
    kind: "fs",
    email: "a@b.com",
    consent: "true",
    verifiedToken: "ok",
  };
}

it("calls augmentWithAiCommentary once the engine succeeds, and returns its result to the client", async () => {
  (engineFetch as any).mockResolvedValue(new Response(JSON.stringify(engineOkBody), { status: 200 }));
  (augmentWithAiCommentary as any).mockResolvedValue({ ...engineOkBody, quote: { fee: 900, docKind: "audited_fs" }, aiCommentary: "All clear." });

  const res = await POST(form(baseFields()));
  const body = await res.json();

  expect(augmentWithAiCommentary).toHaveBeenCalledTimes(1);
  expect(res.status).toBe(200);
  expect(body.aiCommentary).toBe("All clear.");
});

it("never sends the internal quote basis to augmentWithAiCommentary", async () => {
  (engineFetch as any).mockResolvedValue(new Response(JSON.stringify(engineOkBody), { status: 200 }));
  (augmentWithAiCommentary as any).mockImplementation(async (d: any) => d);

  await POST(form(baseFields()));

  const passedIn = (augmentWithAiCommentary as any).mock.calls[0][0];
  expect(passedIn.quote).toEqual({ fee: 900, docKind: "audited_fs" });
  expect(JSON.stringify(passedIn)).not.toContain("secret-internal-basis");
});

it("pushes the augmented findings and aiCommentary to the portal", async () => {
  (engineFetch as any).mockResolvedValue(new Response(JSON.stringify(engineOkBody), { status: 200 }));
  const augmented = {
    ...engineOkBody,
    quote: { fee: 900, docKind: "audited_fs" },
    findings: [{ ruleId: "ai-1", severity: "low", severityLabel: "Low", location: "X", description: "Y", source: "ai", where: "", current: "", corrected: "", action: "Z" }],
    aiCommentary: "All clear.",
  };
  (augmentWithAiCommentary as any).mockResolvedValue(augmented);

  await POST(form(baseFields()));

  const call = (pushToPortal as any).mock.calls[0][0];
  expect(call.meta.findings).toEqual(augmented.findings);
  expect(call.meta.aiCommentary).toBe("All clear.");
});

it("skips the AI step entirely when the engine call fails, and still pushes to the portal", async () => {
  (engineFetch as any).mockResolvedValue(new Response(JSON.stringify({ detail: "bad file" }), { status: 502 }));

  const res = await POST(form(baseFields()));

  expect(augmentWithAiCommentary).not.toHaveBeenCalled();
  expect(pushToPortal).toHaveBeenCalledTimes(1);
  expect(res.status).toBe(502);
});
