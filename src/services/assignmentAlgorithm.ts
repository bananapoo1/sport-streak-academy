import { ASSIGNMENT_CONFIG } from "@/config/adaptiveAssignment";
import type { AssignResponse, Drill, DrillOutcome } from "@/types/dailyHabit";

export interface DrillAttempt {
  drillId: string;
  category: string;
  outcome: DrillOutcome;
  timestampISO: string;
  difficultyScore: number;
  tags: string[];
}

export interface AssignmentInput {
  category: string;
  confidence: number;
  drills: Drill[];
  history: DrillAttempt[];
  reinforcementQueue?: string[];
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const daysSince = (iso?: string) => {
  if (!iso) return 999;
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, (now - then) / (1000 * 60 * 60 * 24));
};

function computeTargetDifficulty(confidence: number) {
  const { base, slope, min, max } = ASSIGNMENT_CONFIG.difficulty;
  return clamp(base + (confidence - 0.5) * slope, min, max);
}

function detectStruggle(history: DrillAttempt[], category: string) {
  const lookback = ASSIGNMENT_CONFIG.struggle.lookbackAttempts;
  const recent = history.filter((attempt) => attempt.category === category).slice(-lookback);
  if (recent.length === 0) {
    return { isStruggling: false, successRate: 1 };
  }

  const successLike = recent.filter((attempt) => attempt.outcome === "success" || attempt.outcome === "partial").length;
  const successRate = successLike / recent.length;
  return {
    isStruggling: successRate < ASSIGNMENT_CONFIG.struggle.successRateThreshold,
    successRate,
  };
}

function similarityToRecentFailures(drill: Drill, failures: DrillAttempt[]) {
  if (!failures.length) {
    return 0;
  }

  const drillTags = new Set(drill.tags ?? []);
  let best = 0;

  for (const failure of failures) {
    const failureTags = new Set(failure.tags);
    const overlap = [...drillTags].filter((tag) => failureTags.has(tag)).length;
    const tagSimilarity = drillTags.size ? overlap / drillTags.size : 0;
    const difficultySimilarity = 1 - Math.min(Math.abs(drill.difficultyScore - failure.difficultyScore) / 25, 1);
    best = Math.max(best, (tagSimilarity * 0.65) + (difficultySimilarity * 0.35));
  }

  return best;
}

function chooseByScore(candidates: Drill[], scoreMap: Map<string, number>) {
  const sorted = [...candidates].sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0));
  return sorted[0];
}

export function assignDrill(input: AssignmentInput): AssignResponse {
  const confidence = clamp(input.confidence, 0, 1);
  const struggle = detectStruggle(input.history, input.category);

  let dTarget = computeTargetDifficulty(confidence);
  if (struggle.isStruggling) {
    dTarget = clamp(
      dTarget - ASSIGNMENT_CONFIG.struggle.temporaryTargetReduction,
      ASSIGNMENT_CONFIG.difficulty.min,
      ASSIGNMENT_CONFIG.difficulty.max,
    );
  }

  const deltaLow = 15 + (1 - confidence) * 15;
  const deltaHigh = 10 + confidence * 20;
  const windowLow = clamp(dTarget - deltaLow, ASSIGNMENT_CONFIG.difficulty.min, ASSIGNMENT_CONFIG.difficulty.max);
  const windowHigh = clamp(dTarget + deltaHigh, ASSIGNMENT_CONFIG.difficulty.min, ASSIGNMENT_CONFIG.difficulty.max);

  const categoryDrills = input.drills.filter((drill) => drill.category === input.category);
  const fallback = categoryDrills.length > 0 ? categoryDrills : input.drills;
  let candidates = fallback.filter((drill) => drill.difficultyScore >= windowLow && drill.difficultyScore <= windowHigh);

  if (input.reinforcementQueue?.length) {
    const queued = fallback.find((drill) => drill.id === input.reinforcementQueue?.[0]);
    if (queued) {
      candidates = [queued, ...candidates.filter((candidate) => candidate.id !== queued.id)];
    }
  }

  if (candidates.length === 0) {
    candidates = [...fallback].sort((a, b) => Math.abs(a.difficultyScore - dTarget) - Math.abs(b.difficultyScore - dTarget)).slice(0, 10);
  }

  const recentAttempts = input.history.filter((attempt) => attempt.category === input.category);
  const recentFailures = recentAttempts.filter((attempt) => attempt.outcome === "fail").slice(-3);
  const drillLastAttempt = new Map<string, string>();
  const drillFails = new Map<string, number>();

  for (const attempt of recentAttempts) {
    drillLastAttempt.set(attempt.drillId, attempt.timestampISO);
    if (attempt.outcome === "fail") {
      drillFails.set(attempt.drillId, (drillFails.get(attempt.drillId) ?? 0) + 1);
    }
  }

  const scoreMap = new Map<string, number>();
  for (const candidate of candidates) {
    const proximity = 1 - Math.min(Math.abs(candidate.difficultyScore - dTarget) / 35, 1);
    const novelty = Math.min(daysSince(drillLastAttempt.get(candidate.id)) / 14, 1);
    const failures = drillFails.get(candidate.id) ?? 0;

    const baseFailurePenalty = Math.min(failures * 0.2, 0.7);
    const failureScore = struggle.isStruggling ? 1 - (baseFailurePenalty * 0.35) : 1 - baseFailurePenalty;
    const similarity = similarityToRecentFailures(candidate, recentFailures);

    const weighted =
      (proximity * ASSIGNMENT_CONFIG.scoring.proximityWeight) +
      (novelty * ASSIGNMENT_CONFIG.scoring.noveltyWeight) +
      (failureScore * ASSIGNMENT_CONFIG.scoring.failurePenaltyWeight) +
      ((struggle.isStruggling ? similarity : similarity * 0.4) * ASSIGNMENT_CONFIG.scoring.similarityWeight);

    scoreMap.set(candidate.id, weighted);
  }

  const shouldExplore = Math.random() < ASSIGNMENT_CONFIG.scoring.explorationEpsilon;
  const selected = shouldExplore
    ? candidates[Math.floor(Math.random() * candidates.length)]
    : chooseByScore(candidates, scoreMap);

  if (!selected) {
    throw new Error("No drill candidates available for assignment");
  }

  const reasonParts = [
    `confidence_${confidence.toFixed(2)}`,
    shouldExplore ? "exploration" : "best_score",
    struggle.isStruggling ? "reinforcement_similar" : "standard_progression",
  ];

  return {
    drill: selected,
    meta: {
      confidenceBefore: confidence,
      dTarget,
      window: { low: windowLow, high: windowHigh },
      isReinforcement: struggle.isStruggling,
      reason: reasonParts.join("_"),
    },
  };
}
