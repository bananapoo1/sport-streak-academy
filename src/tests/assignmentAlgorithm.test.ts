import { describe, expect, it } from "vitest";
import { assignDrill, type DrillAttempt } from "@/services/assignmentAlgorithm";
import type { Drill } from "@/types/dailyHabit";

function buildDrill(id: string, difficultyScore: number, tags: string[] = ["footwork"]): Drill {
  return {
    id,
    title: id,
    category: "shooting",
    difficultyScore,
    content: { summary: "x", durationMinutes: 10 },
    tags,
  };
}

describe("adaptive assignment algorithm", () => {
  it("Case A: confident user gets higher target difficulty", () => {
    const drills = [buildDrill("d1", 30), buildDrill("d2", 42), buildDrill("d3", 60)];

    const result = assignDrill({
      category: "shooting",
      confidence: 0.85,
      drills,
      history: [],
    });

    expect(result.meta.dTarget).toBeGreaterThan(40);
    expect(result.drill.difficultyScore).toBeGreaterThanOrEqual(35);
    expect(result.meta.isReinforcement).toBe(false);
  });

  it("Case B: low confidence + struggle triggers reinforcement", () => {
    const drills = [
      buildDrill("easy", 18, ["release"]),
      buildDrill("medium", 36, ["release"]),
      buildDrill("hard", 54, ["arc"]),
    ];

    const history: DrillAttempt[] = [
      { drillId: "hard", category: "shooting", outcome: "fail", timestampISO: new Date().toISOString(), difficultyScore: 54, tags: ["arc"] },
      { drillId: "medium", category: "shooting", outcome: "fail", timestampISO: new Date().toISOString(), difficultyScore: 36, tags: ["release"] },
      { drillId: "medium", category: "shooting", outcome: "partial", timestampISO: new Date().toISOString(), difficultyScore: 36, tags: ["release"] },
    ];

    const result = assignDrill({
      category: "shooting",
      confidence: 0.3,
      drills,
      history,
    });

    expect(result.meta.isReinforcement).toBe(true);
    expect(result.meta.dTarget).toBeLessThan(30);
    expect(result.meta.reason).toContain("reinforcement");
  });

  it("Case C: exploration can pick novel option when Math.random is low", () => {
    const original = Math.random;
    Math.random = () => 0.01;

    const drills = [buildDrill("novel", 48), buildDrill("familiar", 45)];

    const result = assignDrill({
      category: "shooting",
      confidence: 0.7,
      drills,
      history: [
        { drillId: "familiar", category: "shooting", outcome: "success", timestampISO: new Date().toISOString(), difficultyScore: 45, tags: ["footwork"] },
      ],
    });

    expect(["novel", "familiar"]).toContain(result.drill.id);
    expect(result.meta.reason).toContain("exploration");

    Math.random = original;
  });
});
