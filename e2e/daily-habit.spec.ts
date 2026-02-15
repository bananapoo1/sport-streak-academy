import { expect, test } from "@playwright/test";

test.describe("Daily habit + adaptive assignment", () => {
  test("home daily card starts and completes session", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByLabel("Daily home card")).toBeVisible();
    await page.getByLabel("Start daily session").click();
    await expect(page.getByText("Assigned drill")).toBeVisible();

    await page.getByLabel("Complete session successfully").click();
    await expect(page.getByText("Session complete")).toBeVisible();
  });

  test("low confidence user sees reinforcement before improving", async ({ page }) => {
    await page.goto("/");

    const report = await page.evaluate(async () => {
      const userId = "e2e_low_confidence";
      localStorage.removeItem("ssa.mock.api.db.v1");

      const initial = await fetch(`/api/drills/assign?userId=${userId}&category=shooting`).then((response) => response.json());

      for (let index = 0; index < 2; index += 1) {
        const session = await fetch("/api/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, dateISO: new Date().toISOString(), suggestedDuration: 10, difficulty: "easy", category: "shooting" }),
        }).then((response) => response.json());

        await fetch("/api/session/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.sessionId,
            durationMinutes: 10,
            xpEarned: 10,
            completed: true,
            drillId: session.assignedDrill?.id,
            drillOutcome: "fail",
          }),
        });
      }

      const reinforcement = await fetch(`/api/drills/assign?userId=${userId}&category=shooting`).then((response) => response.json());

      const successSession = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, dateISO: new Date().toISOString(), suggestedDuration: 10, difficulty: "easy", category: "shooting" }),
      }).then((response) => response.json());

      const completed = await fetch("/api/session/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: successSession.sessionId,
          durationMinutes: 10,
          xpEarned: 10,
          completed: true,
          drillId: successSession.assignedDrill?.id,
          drillOutcome: "success",
        }),
      }).then((response) => response.json());

      const postImprove = await fetch(`/api/drills/assign?userId=${userId}&category=shooting`).then((response) => response.json());

      return {
        reinforcement,
        postImprove,
        completed,
        initial,
      };
    });

    expect(report.reinforcement.meta.isReinforcement).toBeTruthy();
    expect(report.completed.updatedCategoryConfidence).toBeGreaterThan(0.3);
    expect(report.postImprove.meta.dTarget).toBeGreaterThanOrEqual(report.reinforcement.meta.dTarget);
  });
});
