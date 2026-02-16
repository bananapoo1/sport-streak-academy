// Inputs: userCategoryState {confidence, recentSuccessRate, lastPracticedISO}, drillPool[]
// Outputs: assigned Drill and metadata
function assignDrill(userCategoryState, drillPool, params = {}) {
  const C = userCategoryState.confidence; // 0..1
  const base = params.base ?? 30;
  const slope = params.slope ?? 40;
  let dTarget = clamp(Math.round(base + (C - 0.5) * slope), 1, 100);

  const deltaLow = Math.round(15 + (1 - C) * 15);
  const deltaHigh = Math.round(10 + C * 20);

  const candidates = drillPool.filter(d => d.difficultyScore >= dTarget - deltaLow && d.difficultyScore <= dTarget + deltaHigh);

  // compute score for each candidate
  function scoreCandidate(d) {
    const proximity = 1 - Math.abs(d.difficultyScore - dTarget) / 100;
    const novelty = recentDaysSince(d) > 14 ? 1 : Math.max(0, 1 - recentDaysSince(d) / 14);
    const successPenalty = getUserDrillFailureRate(userId, d.id) > 0.6 ? -0.5 : 0;
    const similarityBoost = isSimilarToRecentFailures(d) ? 0.2 : 0;
    const randomExplore = Math.random() < 0.05 ? 1 : 0;
    return proximity * 0.5 + novelty * 0.2 + similarityBoost + randomExplore + successPenalty;
  }

  // reinforcement handling
  const isStruggling = userCategoryState.recentSuccessRate !== undefined && userCategoryState.recentSuccessRate < 0.6;
  if (isStruggling) {
    dTarget = Math.max(1, dTarget - 10); // lower target
    // increase weight of similar-to-failed drills to repeat, or select easier variants
  }

  // pick highest scoring candidate
  const sorted = candidates.map(d => ({d, s: scoreCandidate(d)})).sort((a,b)=>b.s-a.s);
  const chosen = sorted.length ? sorted[0].d : randomDrillFromPool(drillPool);
  return { drill: chosen, meta: { confidenceBefore: C, dTarget, isReinforcement: isStruggling }};
}