import { beforeEach, describe, expect, it } from "vitest";
import { installMockApiServer, resetMockApiState } from "@/services/mockApiServer";
import { assignDrillForUser, completeSession, startSession } from "@/services/drillAssignment";

describe("daily habit assign -> complete integration", () => {
  beforeEach(() => {
    resetMockApiState();
    installMockApiServer();
  });

  it("assigns a drill and returns updated xp/streak on complete", async () => {
    const userId = "integration_user";
    const assigned = await assignDrillForUser(userId, "shooting");

    expect(assigned.drill.id).toBeTruthy();
    expect(assigned.meta.confidenceBefore).toBeGreaterThanOrEqual(0);

    const start = await startSession({
      userId,
      dateISO: new Date().toISOString(),
      suggestedDuration: 10,
      difficulty: "medium",
      category: "shooting",
    });

    const complete = await completeSession({
      sessionId: start.sessionId,
      durationMinutes: 10,
      xpEarned: 25,
      completed: true,
      drillId: start.assignedDrill?.id,
      drillOutcome: "success",
    });

    expect(complete.xpAwarded).toBeGreaterThan(0);
    expect(complete.xpState.xp).toBeGreaterThan(0);
    expect(complete.streakState.current).toBeGreaterThanOrEqual(1);
    expect(complete.updatedCategoryConfidence).toBeGreaterThan(assigned.meta.confidenceBefore);
  });
});
