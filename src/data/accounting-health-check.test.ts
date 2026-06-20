import { describe, it, expect } from "vitest";
import { QUESTIONS, scoreHealthCheck } from "./accounting-health-check";

const bestAnswers = () => Object.fromEntries(QUESTIONS.map((q) => [q.id, 0])); // index 0 = best
const worstAnswers = () => Object.fromEntries(QUESTIONS.map((q) => [q.id, q.answers.length - 1]));

describe("scoreHealthCheck", () => {
  it("has 8 questions whose weights sum to 100", () => {
    expect(QUESTIONS).toHaveLength(8);
    expect(QUESTIONS.reduce((s, q) => s + q.weight, 0)).toBe(100);
  });
  it("scores all-best as 100 / Healthy", () => {
    const r = scoreHealthCheck(bestAnswers());
    expect(r.score).toBe(100);
    expect(r.band).toBe("Healthy");
  });
  it("scores all-worst as 0 / At risk", () => {
    const r = scoreHealthCheck(worstAnswers());
    expect(r.score).toBe(0);
    expect(r.band).toBe("At risk");
  });
  it("returns one result row per question, worst-first", () => {
    const r = scoreHealthCheck(worstAnswers());
    expect(r.results).toHaveLength(8);
    for (let i = 1; i < r.results.length; i++) {
      expect(r.results[i - 1].points).toBeLessThanOrEqual(r.results[i].points);
    }
  });
  it("bands at the boundaries", () => {
    expect(scoreHealthCheck.bandFor(80)).toBe("Healthy");
    expect(scoreHealthCheck.bandFor(79)).toBe("Some gaps");
    expect(scoreHealthCheck.bandFor(50)).toBe("Some gaps");
    expect(scoreHealthCheck.bandFor(49)).toBe("At risk");
  });
});
