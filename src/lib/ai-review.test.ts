import { describe, it, expect, vi, beforeEach } from "vitest";

const createMock = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: createMock };
  },
}));

import { augmentWithAiCommentary } from "./ai-review";
import type { ReviewResponse } from "@/app/api/fs-gap-review/types";

function baseData(): ReviewResponse {
  return {
    company: "Acme Ltd",
    framework: "GAPSME",
    method: "block-extraction",
    stats: { checks_run: 10, checks_passed: 9, checks_failed: 1, framework: "GAPSME" },
    findings: [
      {
        ruleId: "r1",
        severity: "medium",
        severityLabel: "Medium",
        location: "Note 12",
        description: "Depreciation policy not disclosed.",
        source: "engine",
        where: "",
        current: "",
        corrected: "",
        action: "Add a depreciation policy note.",
      },
    ],
    confirmed: ["Going concern basis stated"],
    reportBase64: "",
    reportName: "report.pdf",
    annotatedDocxBase64: null,
    annotatedName: null,
    quote: { fee: 900, docKind: "audited_fs" },
  };
}

function toolUseResponse(input: unknown) {
  return { content: [{ type: "tool_use", id: "t1", name: "submit_review_commentary", input }] };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ANTHROPIC_API_KEY = "test-key";
});

it("returns data unchanged when ANTHROPIC_API_KEY is unset", async () => {
  delete process.env.ANTHROPIC_API_KEY;
  const data = baseData();
  const result = await augmentWithAiCommentary(data);
  expect(result).toEqual(data);
  expect(createMock).not.toHaveBeenCalled();
});

it("appends AI findings with source 'ai' and sets aiCommentary on success", async () => {
  createMock.mockResolvedValue(
    toolUseResponse({
      commentary: "Overall a clean file; one disclosure gap to close before the audit.",
      findings: [
        { severity: "low", location: "Cash flow", description: "No comparative cash flow shown.", action: "Add prior-year comparatives." },
      ],
    }),
  );
  const data = baseData();
  const result = await augmentWithAiCommentary(data);
  expect(result.aiCommentary).toBe("Overall a clean file; one disclosure gap to close before the audit.");
  expect(result.findings).toHaveLength(2);
  expect(result.findings[1]).toMatchObject({
    source: "ai",
    severity: "low",
    severityLabel: "Low",
    location: "Cash flow",
    description: "No comparative cash flow shown.",
    action: "Add prior-year comparatives.",
  });
  // Original engine finding untouched.
  expect(result.findings[0]).toEqual(data.findings[0]);
});

it("passes only structured fields to the model, never the raw file", async () => {
  createMock.mockResolvedValue(toolUseResponse({ commentary: "ok", findings: [] }));
  await augmentWithAiCommentary(baseData());
  const call = createMock.mock.calls[0][0];
  const sentText = call.messages[0].content;
  const sent = JSON.parse(sentText);
  expect(sent).toEqual({
    framework: "GAPSME",
    stats: { checks_run: 10, checks_passed: 9, checks_failed: 1, framework: "GAPSME" },
    findings: [{ severity: "medium", location: "Note 12", description: "Depreciation policy not disclosed." }],
    confirmed: ["Going concern basis stated"],
    quote: { fee: 900, docKind: "audited_fs" },
  });
  expect(sentText).not.toContain("reportBase64");
});

it("falls back to unchanged data when the API call throws", async () => {
  createMock.mockRejectedValue(new Error("network down"));
  const data = baseData();
  const result = await augmentWithAiCommentary(data);
  expect(result).toEqual(data);
});

it("falls back to unchanged data when no tool_use block is returned", async () => {
  createMock.mockResolvedValue({ content: [{ type: "text", text: "I refuse." }] });
  const data = baseData();
  const result = await augmentWithAiCommentary(data);
  expect(result).toEqual(data);
});

it("falls back to unchanged data when the tool response is malformed", async () => {
  createMock.mockResolvedValue(toolUseResponse({ commentary: 42, findings: "not an array" }));
  const data = baseData();
  const result = await augmentWithAiCommentary(data);
  expect(result).toEqual(data);
});

it("passes an explicit 20s timeout to the SDK call, well under the route's 120s maxDuration", async () => {
  createMock.mockResolvedValue(toolUseResponse({ commentary: "ok", findings: [] }));
  await augmentWithAiCommentary(baseData());
  const options = createMock.mock.calls[0][1];
  expect(options).toMatchObject({ timeout: 20000 });
});

it("defaults an unknown severity value to 'info' rather than throwing", async () => {
  createMock.mockResolvedValue(
    toolUseResponse({ commentary: "ok", findings: [{ severity: "urgent!!", location: "X", description: "Y", action: "Z" }] }),
  );
  const result = await augmentWithAiCommentary(baseData());
  expect(result.findings[1].severity).toBe("info");
  expect(result.findings[1].severityLabel).toBe("Info");
});
