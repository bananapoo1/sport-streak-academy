import { expect, test } from "@playwright/test";

test.describe("Daily habit + adaptive assignment", () => {
  test("home daily card starts and completes session", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByLabel("Daily home card")).toBeVisible();
    await page.getByLabel("Start daily session").click();
    await expect(page).toHaveURL(/\/drills/);
  });

  test("low confidence user sees reinforcement before improving", async ({ page }) => {
    await page.goto("/");

    const report = await page.evaluate(async () => {
      const userId = "e2e_low_confidence";
      localStorage.removeItem("ssa.mock.api.db.v1");

      const initial = await fetch(`/api/drills/assign?userId=${userId}&category=shooting`).then((response) => response.json());
      const drillId = initial.drill.id as string;

      for (let index = 0; index < 3; index += 1) {
        await fetch("/api/drills/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            drillId,
            outcome: "fail",
            durationMinutes: 10,
          }),
        });
      }

      const reinforcement = await fetch(`/api/drills/assign?userId=${userId}&category=shooting`).then((response) => response.json());

      const successResult = await fetch("/api/drills/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          drillId: reinforcement.drill.id,
          outcome: "success",
          durationMinutes: 10,
        }),
      }).then((response) => response.json());

      const completeSessionResult = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, dateISO: new Date().toISOString(), suggestedDuration: 10, difficulty: "easy", category: "shooting" }),
      }).then((response) => response.json());

      const completed = await fetch("/api/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: completeSessionResult.sessionId,
          durationMinutes: 10,
          xpEarned: 10,
          completed: true,
          drillId: completeSessionResult.assignedDrill?.id,
          drillOutcome: "success",
        }),
      }).then((response) => response.json());

      const postImprove = await fetch(`/api/drills/assign?userId=${userId}&category=shooting`).then((response) => response.json());

      return {
        reinforcement,
        postImprove,
        completed,
        successResult,
        initial,
      };
    });

    expect(report.reinforcement.meta.isReinforcement).toBeTruthy();
    expect(report.reinforcement.meta.dTarget).toBeLessThanOrEqual(report.initial.meta.dTarget);
    expect(report.successResult.updatedConfidence).toBeGreaterThan(report.reinforcement.meta.confidenceBefore);
    expect(report.completed.updatedCategoryConfidence).toBeGreaterThan(0.3);
    expect(report.postImprove.meta.dTarget).toBeGreaterThanOrEqual(report.reinforcement.meta.dTarget);
  });
});
