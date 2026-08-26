import { describe, it, expect } from "vitest";
import {
  BOOKING_QUALIFIERS,
  BOOKING_MESSAGE_MAX,
  buildBookingAnswers,
  buildBookingMessage,
} from "./booking-answers";

describe("buildBookingAnswers", () => {
  it("drops every unanswered key", () => {
    expect(buildBookingAnswers({})).toEqual({});
    expect(
      buildBookingAnswers({ businessType: null, employees: undefined, adminTime: "", fees: "   " }),
    ).toEqual({});
  });

  it("keeps only the questions that were answered", () => {
    expect(buildBookingAnswers({ employees: "2–10", fees: null })).toEqual({ employees: "2–10" });
  });

  it("sends plain-text labels, trimmed, for every question", () => {
    expect(
      buildBookingAnswers({
        businessType: " Trading company ",
        employees: "Just me",
        adminTime: "It never ends",
        fees: "€15k+",
      }),
    ).toEqual({
      businessType: "Trading company",
      employees: "Just me",
      adminTime: "It never ends",
      fees: "€15k+",
    });
  });

  it("only ever emits keys the panel can actually ask about", () => {
    const answers = buildBookingAnswers({
      businessType: "Holding or property",
      // @ts-expect-error — a stray key must not reach the wire
      nonsense: "should not travel",
    });
    expect(Object.keys(answers)).toEqual(["businessType"]);
  });
});

describe("BOOKING_QUALIFIERS", () => {
  it("asks the four questions in the agreed order", () => {
    expect(BOOKING_QUALIFIERS.map((q) => q.key)).toEqual([
      "businessType",
      "employees",
      "adminTime",
      "fees",
    ]);
  });

  it("gives every question at least two options and a question label", () => {
    for (const q of BOOKING_QUALIFIERS) {
      expect(q.label.endsWith("?")).toBe(true);
      expect(q.options.length).toBeGreaterThan(1);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
  });
});

describe("buildBookingMessage", () => {
  it("is empty when there is no website", () => {
    expect(buildBookingMessage("")).toBe("");
    expect(buildBookingMessage("   ")).toBe("");
  });

  it("prefixes the website so the Leads list reads it at a glance", () => {
    expect(buildBookingMessage(" borg.mt ")).toBe("Website: borg.mt");
  });

  it("never exceeds the backend's message cap", () => {
    expect(buildBookingMessage("x".repeat(5000)).length).toBe(BOOKING_MESSAGE_MAX);
  });
});
