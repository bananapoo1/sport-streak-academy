import { describe, expect, it } from "vitest";
import { getRingGeometry } from "@/components/ProgressRing";

describe("ProgressRing geometry", () => {
  it("computes radius, circumference, and offset", () => {
    const geometry = getRingGeometry(100, 10, 50);

    expect(geometry.radius).toBe(45);
    expect(geometry.circumference).toBeCloseTo(2 * Math.PI * 45, 5);
    expect(geometry.strokeDashoffset).toBeCloseTo(geometry.circumference / 2, 5);
  });

  it("clamps progress between 0 and 100", () => {
    const low = getRingGeometry(96, 8, -20);
    const high = getRingGeometry(96, 8, 140);

    expect(low.normalizedProgress).toBe(0);
    expect(high.normalizedProgress).toBe(100);
  });
});
