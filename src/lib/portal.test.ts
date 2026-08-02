import { beforeEach, describe, expect, it, vi } from "vitest";
import { pushToPortal } from "./portal";

/**
 * pushToPortal must reach BOTH inboxes: the ops portal's Requests endpoint and
 * the partner portal's Leads CRM. The partner-portal call has to satisfy
 * portal-backend's websiteLeadSchema, whose two sharp edges are a required
 * `name` and a `source` enum of exactly ['contact','callback'] — sending the
 * A4 source string verbatim would 400 and the lead would vanish silently.
 */

const call = (url: string) =>
  (globalThis.fetch as unknown as { mock: { calls: [string, { body: string }][] } }).mock.calls.find(
    ([u]) => u.includes(url)
  );
const bodyOf = (url: string) => JSON.parse(call(url)![1].body);

beforeEach(() => {
  vi.restoreAllMocks();
  process.env.A4_PORTAL_URL = "https://team.example.com";
  process.env.A4_PORTAL_INGEST_KEY = "k";
  globalThis.fetch = vi.fn(async () => new Response("{}", { status: 201 })) as unknown as typeof fetch;
});

describe("pushToPortal", () => {
  it("posts to both the ops portal and the partner leads endpoint", async () => {
    await pushToPortal({ name: "Jane", email: "jane@borg.mt", message: "hi", source: "contact" });
    expect(call("/api/requests")).toBeTruthy();
    expect(call("/public/website-leads")).toBeTruthy();
  });

  it("always sends source 'contact' — never the A4 source string", async () => {
    await pushToPortal({ name: "J", email: "j@b.mt", source: "fs-review" });
    expect(bodyOf("/public/website-leads").source).toBe("contact");
  });

  it("keeps the real A4 source visible in the message", async () => {
    await pushToPortal({ name: "J", email: "j@b.mt", service: "FS/TB review (tb)", source: "fs-review", message: "uploaded a file" });
    const m = bodyOf("/public/website-leads").message;
    expect(m).toMatch(/^\[a4\.com\.mt — /);          // origin is unmistakable
    expect(m).toContain("FS/TB review (tb)");
    expect(m).toContain("fs-review");
    expect(m).toContain("uploaded a file");
  });

  it("derives a name when the form did not collect one (lead-magnet)", async () => {
    await pushToPortal({ email: "solo@borg.mt", service: "Lead magnet: x", source: "lead-magnet" });
    expect(bodyOf("/public/website-leads").name).toBe("solo");
  });

  it("prefers company over the email local-part", async () => {
    await pushToPortal({ email: "solo@borg.mt", company: "Borg Trading Ltd" });
    expect(bodyOf("/public/website-leads").name).toBe("Borg Trading Ltd");
  });

  it("always stamps the origin site, even with no service or message", async () => {
    await pushToPortal({ name: "J", email: "j@b.mt" });
    expect(bodyOf("/public/website-leads").message).toContain("a4.com.mt");
  });

  it("skips the lead when there is no email to file it against", async () => {
    await pushToPortal({ name: "No Email" });
    expect(call("/public/website-leads")).toBeUndefined();
  });

  it("still files the lead when the ops portal is unconfigured", async () => {
    delete process.env.A4_PORTAL_URL;
    await pushToPortal({ name: "J", email: "j@b.mt" });
    expect(call("/api/requests")).toBeUndefined();
    expect(call("/public/website-leads")).toBeTruthy();
  });

  it("never throws, and one inbox failing does not suppress the other", async () => {
    globalThis.fetch = vi.fn(async (u: string) => {
      if (String(u).includes("/api/requests")) throw new Error("ops portal down");
      return new Response("{}", { status: 201 });
    }) as unknown as typeof fetch;
    await expect(pushToPortal({ name: "J", email: "j@b.mt" })).resolves.toBeUndefined();
    expect(call("/public/website-leads")).toBeTruthy();
  });

  it("truncates an oversized message to the schema ceiling", async () => {
    await pushToPortal({ name: "J", email: "j@b.mt", message: "x".repeat(5000) });
    expect(bodyOf("/public/website-leads").message.length).toBeLessThanOrEqual(4000);
  });
});
