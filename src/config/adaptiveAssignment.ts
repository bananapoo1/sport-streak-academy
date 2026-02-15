export const ASSIGNMENT_CONFIG = {
  difficulty: {
    base: 30,
    slope: 40,
    min: 5,
    max: 95,
  },
  struggle: {
    lookbackAttempts: 3,
    successRateThreshold: 0.6,
    temporaryTargetReduction: 8,
    repeatSessionsWindow: 2,
  },
  scoring: {
    proximityWeight: 0.45,
    noveltyWeight: 0.2,
    failurePenaltyWeight: 0.2,
    similarityWeight: 0.15,
    explorationEpsilon: 0.08,
  },
  confidence: {
    min: 0,
    max: 1,
    successDelta: 0.03,
    partialDelta: 0.01,
    failDelta: -0.04,
    reinforcementSuccessBonus: 0.05,
    reinforcementFailPenaltyReduction: 0.02,
  },
  xp: {
    base: 24,
    successBonus: 10,
    partialBonus: 4,
    reinforcementMultiplier: 0.85,
    minAward: 8,
    maxAward: 60,
  },
} as const;
