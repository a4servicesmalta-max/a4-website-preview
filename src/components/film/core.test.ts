import { describe, expect, it } from "vitest";
import { M, chan, cueSheet, fx, interpolate, pr } from "./core";

describe("film core", () => {
  it("builds cue start times from scene lengths", () => {
    const { Q, total } = cueSheet([
      { name: "A", dur: 0.5 },
      { name: "B", dur: 1.5 },
      { name: "C", dur: 1 },
    ]);
    expect(Q).toEqual({ A: 0, B: 0.5, C: 2 });
    expect(total).toBe(3);
  });

  it("clamps progress and settles the easings at their ends", () => {
    expect(pr(0, 1, 2)).toBe(0);
    expect(pr(2, 1, 2)).toBe(0.5);
    expect(pr(9, 1, 2)).toBe(1);
    expect(M.enter(1, 1)).toBe(0);
    expect(M.enter(5, 1)).toBe(1);
    expect(M.exit(0, 1)).toBe(0);
    expect(M.glide(5, 1)).toBe(1);
  });

  it("interpolates keyframes and holds outside them", () => {
    const f = interpolate([0, 1, 3], [10, 20, 0]);
    expect(f(-1)).toBe(10);
    expect(f(0.5)).toBe(15);
    expect(f(2)).toBe(10);
    expect(f(9)).toBe(0);
    expect(chan([0, 1], [0, 100], 0.5)).toBe(50);
  });

  it("fx rises in from blur and is at rest once entered", () => {
    const before = fx(0, 1, null);
    expect(before.opacity).toBe(0);
    expect(before.filter).toBe("blur(12.00px)");
    const rest = fx(5, 1, null);
    expect(rest.opacity).toBe(1);
    expect(rest.transform).toBe("translate(0px,0px) scale(1)");
    expect(rest.filter).toBe("none");
    const gone = fx(9, 1, 6);
    expect(gone.opacity).toBe(0);
  });
});
