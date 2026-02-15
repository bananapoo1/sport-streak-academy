type RolloutFlag = { enabled: boolean; rollout: number };

type CtaVariant = { id: string; text: string; weight: number };

type FeatureConfig = {
  daily_card_v2: RolloutFlag;
  adaptive_assignment: RolloutFlag;
  celebration_confetti: RolloutFlag;
  cta_variant_text: { variants: CtaVariant[] };
  reduce_motion: { default: boolean };
};

const featureConfig: FeatureConfig = {
  daily_card_v2: { enabled: true, rollout: 1.0 },
  adaptive_assignment: { enabled: true, rollout: 1.0 },
  celebration_confetti: { enabled: true, rollout: 1.0 },
  cta_variant_text: {
    variants: [
      { id: "A", text: "Start 10-min session", weight: 0.5 },
      { id: "B", text: "Quick session — 10 min", weight: 0.5 },
    ],
  },
  reduce_motion: { default: false },
};

function hashToUnit(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return (Math.abs(hash) % 1000) / 1000;
}

export function isFeatureEnabled(flag: keyof Pick<FeatureConfig, "daily_card_v2" | "adaptive_assignment" | "celebration_confetti">, identity: string): boolean {
  const f = featureConfig[flag];
  if (!f.enabled) {
    return false;
  }
  return hashToUnit(`${flag}:${identity}`) <= f.rollout;
}

export function getReduceMotionDefault() {
  return featureConfig.reduce_motion.default;
}

export function getCtaVariant(identity: string): CtaVariant {
  const roll = hashToUnit(`cta:${identity}`);
  let accumulator = 0;
  for (const variant of featureConfig.cta_variant_text.variants) {
    accumulator += variant.weight;
    if (roll <= accumulator) {
      return variant;
    }
  }
  return featureConfig.cta_variant_text.variants[0];
}

export { featureConfig };
