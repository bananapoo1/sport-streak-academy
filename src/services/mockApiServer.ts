import { ASSIGNMENT_CONFIG } from "@/config/adaptiveAssignment";
import { assignDrill, type DrillAttempt } from "@/services/assignmentAlgorithm";
import { trackEvent } from "@/services/analytics";
import type {
  AssignResponse,
  Drill,
  DrillResultRequest,
  DrillResultResponse,
  SessionCompleteRequest,
  SessionCompleteResponse,
  SessionStartRequest,
  SessionStartResponse,
  StreakState,
  XPState,
} from "@/types/dailyHabit";

const DB_KEY = "ssa.mock.api.db.v1";
// TODO: Replace localStorage mock persistence with server-backed storage (Supabase/Postgres)
// and authenticated request validation before production rollout.

interface CategoryConfidence {
  [category: string]: number;
}

interface UserDB {
  userId: string;
  xpState: XPState;
  streakState: StreakState;
  confidenceByCategory: CategoryConfidence;
  attempts: DrillAttempt[];
  reinforcementQueue: Record<string, string[]>;
}

interface SessionRecord {
  sessionId: string;
  userId: string;
  category: string;
  startedAtISO: string;
  assignedDrillId?: string;
  reinforcement?: boolean;
}

interface MockDB {
  users: Record<string, UserDB>;
  sessions: Record<string, SessionRecord>;
  drills: Drill[];
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getLevelFromXp(xp: number) {
  return Math.floor(xp / 250) + 1;
}

function getXpToNextLevel(xp: number) {
  const nextLevelXp = getLevelFromXp(xp) * 250;
  return Math.max(0, nextLevelXp - xp);
}

function createDrillPool() {
  const categories = ["shooting", "passing", "defense"];
  const tagsByCategory: Record<string, string[]> = {
    shooting: ["footwork", "release", "arc", "balance"],
    passing: ["vision", "timing", "accuracy", "movement"],
    defense: ["positioning", "reaction", "angles", "balance"],
  };

  const drills: Drill[] = [];
  for (const category of categories) {
    for (let index = 1; index <= 80; index += 1) {
      const difficultyScore = clamp(8 + index, 5, 95);
      const primaryTag = tagsByCategory[category][index % tagsByCategory[category].length];
      const secondaryTag = tagsByCategory[category][(index + 1) % tagsByCategory[category].length];
      drills.push({
        id: `${category}_drill_${index}`,
        title: `${category[0].toUpperCase()}${category.slice(1)} Drill ${index}`,
        category,
        difficultyScore,
        tags: [primaryTag, secondaryTag],
        content: {
          summary: `Practice ${category} with emphasis on ${primaryTag} and ${secondaryTag}.`,
          durationMinutes: 10,
        },
      });
    }
  }
  return drills;
}

function readDB(): MockDB {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as MockDB;
    } catch {
      localStorage.removeItem(DB_KEY);
    }
  }

  const initial: MockDB = {
    users: {},
    sessions: {},
    drills: createDrillPool(),
  };
  localStorage.setItem(DB_KEY, JSON.stringify(initial));
  return initial;
}

function writeDB(db: MockDB) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getOrCreateUser(db: MockDB, userId: string): UserDB {
  if (!db.users[userId]) {
    db.users[userId] = {
      userId,
      xpState: { xp: 0, level: 1, xpToNextLevel: 250 },
      streakState: { current: 0, longest: 0, lastActiveISO: null, freezeTokens: 0 },
      confidenceByCategory: { shooting: 0.42, passing: 0.5, defense: 0.38 },
      attempts: [],
      reinforcementQueue: {},
    };
  }
  return db.users[userId];
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function computeXpAward(outcome: "success" | "partial" | "fail", reinforcement: boolean) {
  const base = ASSIGNMENT_CONFIG.xp.base;
  const withOutcome =
    outcome === "success"
      ? base + ASSIGNMENT_CONFIG.xp.successBonus
      : outcome === "partial"
        ? base + ASSIGNMENT_CONFIG.xp.partialBonus
        : base;

  const reinforcementAdjusted = reinforcement ? withOutcome * ASSIGNMENT_CONFIG.xp.reinforcementMultiplier : withOutcome;
  return clamp(
    Math.round(reinforcementAdjusted),
    ASSIGNMENT_CONFIG.xp.minAward,
    ASSIGNMENT_CONFIG.xp.maxAward,
  );
}

function updateConfidence(current: number, outcome: "success" | "partial" | "fail", reinforcement: boolean) {
  const cfg = ASSIGNMENT_CONFIG.confidence;
  let delta = outcome === "success" ? cfg.successDelta : outcome === "partial" ? cfg.partialDelta : cfg.failDelta;

  if (reinforcement && outcome === "success") {
    delta += cfg.reinforcementSuccessBonus;
  }

  if (reinforcement && outcome === "fail") {
    delta += cfg.reinforcementFailPenaltyReduction;
  }

  return clamp(current + delta, cfg.min, cfg.max);
}

function updateStreak(streak: StreakState, dateISO: string) {
  const dateOnly = dateISO.slice(0, 10);
  const last = streak.lastActiveISO?.slice(0, 10);

  if (last === dateOnly) {
    return { ...streak, lastActiveISO: dateISO, changed: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayOnly = yesterday.toISOString().slice(0, 10);
  const nextCurrent = last === yesterdayOnly ? streak.current + 1 : 1;

  return {
    current: nextCurrent,
    longest: Math.max(streak.longest, nextCurrent),
    lastActiveISO: dateISO,
    freezeTokens: streak.freezeTokens,
    changed: true,
  };
}

function parseBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}

function daysSinceIso(iso?: string) {
  if (!iso) return 999;
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

function mapSkillToConfidenceSeed(skillLevel: string | null) {
  switch (skillLevel) {
    case "beginner":
      return 0.32;
    case "intermediate":
      return 0.5;
    case "advanced":
      return 0.72;
    default:
      return null;
  }
}

function mapDifficultyToBias(difficulty: string | null) {
  switch (difficulty) {
    case "easy":
      return -0.12;
    case "hard":
      return 0.12;
    default:
      return 0;
  }
}

function mapGoalToBias(goal: string | null) {
  switch (goal) {
    case "pro":
      return 0.08;
    case "scouted":
      return 0.06;
    case "scholarship":
      return 0.04;
    case "best-team":
      return 0.02;
    default:
      return 0;
  }
}

async function handleAssign(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "guest_user";
  const category = url.searchParams.get("category") ?? "shooting";
  const requestedDifficulty = url.searchParams.get("difficulty");
  const skillLevel = url.searchParams.get("skillLevel");
  const goal = url.searchParams.get("goal");

  const db = readDB();
  const user = getOrCreateUser(db, userId);

  const categoryAttempts = user.attempts.filter((attempt) => attempt.category === category);
  const lastCategoryAttempt = categoryAttempts[categoryAttempts.length - 1];
  const inactivityDays = daysSinceIso(lastCategoryAttempt?.timestampISO);
  const recoveryBias = inactivityDays >= 2 ? -0.14 : 0;
  const confidenceSeed = mapSkillToConfidenceSeed(skillLevel);
  if (categoryAttempts.length === 0 && confidenceSeed !== null) {
    user.confidenceByCategory[category] = confidenceSeed;
  }

  const storedConfidence = user.confidenceByCategory[category] ?? 0.5;
  const assignmentConfidence = clamp(
    storedConfidence + mapDifficultyToBias(requestedDifficulty) + mapGoalToBias(goal) + recoveryBias,
    0,
    1,
  );

  const assignment: AssignResponse = assignDrill({
    category,
    confidence: assignmentConfidence,
    drills: db.drills,
    history: user.attempts,
    reinforcementQueue: user.reinforcementQueue[category] ?? [],
  });

  if (assignment.meta.isReinforcement) {
    const queue = user.reinforcementQueue[category] ?? [];
    if (!queue.includes(assignment.drill.id)) {
      queue.push(assignment.drill.id);
    }
    user.reinforcementQueue[category] = queue.slice(0, ASSIGNMENT_CONFIG.struggle.repeatSessionsWindow);
  }

  trackEvent("drill_assigned", {
    category,
    drillId: assignment.drill.id,
    confidenceBefore: assignment.meta.confidenceBefore,
    dTarget: assignment.meta.dTarget,
    isReinforcement: assignment.meta.isReinforcement,
    assignmentReason: assignment.meta.reason,
    recoveryMode: inactivityDays >= 2,
  }, userId);

  writeDB(db);
  return json(assignment);
}

async function handleDrillResult(request: Request) {
  const body = await parseBody<DrillResultRequest>(request);
  const db = readDB();
  const user = getOrCreateUser(db, body.userId);
  const drill = db.drills.find((entry) => entry.id === body.drillId);

  if (!drill) {
    return json({ message: "Drill not found" }, 404);
  }

  const isReinforcement = Boolean((user.reinforcementQueue[drill.category] ?? []).includes(drill.id));
  const current = user.confidenceByCategory[drill.category] ?? 0.5;
  const updated = body.confidenceAfter ?? updateConfidence(current, body.outcome, isReinforcement);
  user.confidenceByCategory[drill.category] = clamp(updated, 0, 1);

  const xpAwarded = computeXpAward(body.outcome, isReinforcement);

  user.attempts.push({
    drillId: body.drillId,
    category: drill.category,
    outcome: body.outcome,
    timestampISO: new Date().toISOString(),
    difficultyScore: drill.difficultyScore,
    tags: drill.tags ?? [],
  });

  if (body.outcome === "success") {
    const currentQueue = user.reinforcementQueue[drill.category] ?? [];
    user.reinforcementQueue[drill.category] = currentQueue.filter((id) => id !== drill.id);
  }

  const response: DrillResultResponse = {
    updatedConfidence: user.confidenceByCategory[drill.category],
    xpAwarded,
    streakUpdated: true,
  };

  trackEvent("drill_result", {
    drillId: body.drillId,
    category: drill.category,
    outcome: body.outcome,
    updatedConfidence: response.updatedConfidence,
    xpAwarded,
    reinforcement: isReinforcement,
  }, body.userId);

  writeDB(db);
  return json(response);
}

async function handleSessionStart(request: Request) {
  const body = await parseBody<SessionStartRequest>(request);
  const db = readDB();
  const user = getOrCreateUser(db, body.userId);

  const sessionId = `session_${Math.random().toString(36).slice(2, 10)}`;
  const category = body.category ?? "shooting";
  let assignedDrill: Drill | undefined;
  let assignedMeta: AssignResponse["meta"] | undefined;

  const categoryAttempts = user.attempts.filter((attempt) => attempt.category === category);
  const lastCategoryAttempt = categoryAttempts[categoryAttempts.length - 1];
  const inactivityDays = daysSinceIso(lastCategoryAttempt?.timestampISO);
  const recoveryMode = inactivityDays >= 2;
  const effectiveDuration = recoveryMode
    ? Math.min(body.suggestedDuration, 10)
    : body.suggestedDuration;

  const assignRequestUrl = new URL(request.url, window.location.origin);
  assignRequestUrl.searchParams.set("userId", body.userId);
  assignRequestUrl.searchParams.set("category", category);
  assignRequestUrl.searchParams.set("difficulty", body.difficulty);
  assignRequestUrl.searchParams.set("skillLevel", body.skillLevel ?? "");
  assignRequestUrl.searchParams.set("goal", body.goal ?? "");

  const assignResponse = await handleAssign(new Request(assignRequestUrl.toString()));
  if (assignResponse.ok) {
    const assigned = (await assignResponse.json()) as AssignResponse;
    assignedMeta = assigned.meta;
    assignedDrill = {
      ...assigned.drill,
      content: {
        ...assigned.drill.content,
        durationMinutes: effectiveDuration,
      },
    };
    db.sessions[sessionId] = {
      sessionId,
      userId: body.userId,
      category,
      startedAtISO: body.dateISO,
      assignedDrillId: assigned.drill.id,
      reinforcement: assigned.meta.isReinforcement,
    };
  }

  trackEvent("session_start", {
    sessionId,
    category,
    suggestedDuration: effectiveDuration,
    requestedDuration: body.suggestedDuration,
    recoveryMode,
    difficulty: body.difficulty,
    assignedDrillId: assignedDrill?.id,
  }, body.userId);

  writeDB(db);

  const attemptsInCategory = user.attempts.filter((attempt) => attempt.category === category).length;
  const shouldShowWhy = attemptsInCategory < 5 || attemptsInCategory % 5 === 0;
  const reasonBits: string[] = [];
  if (recoveryMode) {
    reasonBits.push("eased back in after a short break");
  }
  if (body.skillLevel) {
    reasonBits.push(`matched to your ${body.skillLevel} level`);
  }
  if (body.goal) {
    reasonBits.push(`aligned with your ${body.goal.replace(/-/g, " ")} goal`);
  }
  if (assignedDrill?.category) {
    reasonBits.push(`focused on ${assignedDrill.category}`);
  }

  const response: SessionStartResponse = {
    sessionId,
    assignedDrill,
    assignedMeta,
    assignmentExplanation: {
      showWhy: shouldShowWhy,
      message: reasonBits.length > 0
        ? `Chosen because it ${reasonBits.join(" and ")}.`
        : "Chosen to match your current momentum and keep progress steady.",
    },
  };

  return json(response);
}

async function handleSessionComplete(request: Request) {
  const body = await parseBody<SessionCompleteRequest>(request);
  const db = readDB();
  const session = db.sessions[body.sessionId];

  if (!session) {
    return json({ message: "Session not found" }, 404);
  }

  const user = getOrCreateUser(db, session.userId);
  const drillId = body.drillId ?? session.assignedDrillId;

  let updatedConfidence = user.confidenceByCategory[session.category] ?? 0.5;
  let xpAwarded = clamp(body.xpEarned, ASSIGNMENT_CONFIG.xp.minAward, ASSIGNMENT_CONFIG.xp.maxAward);

  if (drillId && body.drillOutcome) {
    const drillResult = await handleDrillResult(
      new Request(new URL("/api/drills/result", window.location.origin), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.userId,
          drillId,
          outcome: body.drillOutcome,
          durationMinutes: body.durationMinutes,
          confidenceAfter: body.confidenceAfter,
        } satisfies DrillResultRequest),
      })
    );

    const resultJson = (await drillResult.json()) as DrillResultResponse;
    updatedConfidence = resultJson.updatedConfidence;
    xpAwarded = resultJson.xpAwarded;
  }

  user.xpState.xp += xpAwarded;
  user.xpState.level = getLevelFromXp(user.xpState.xp);
  user.xpState.xpToNextLevel = getXpToNextLevel(user.xpState.xp);

  const nextStreak = updateStreak(user.streakState, new Date().toISOString());
  user.streakState = {
    current: nextStreak.current,
    longest: nextStreak.longest,
    lastActiveISO: nextStreak.lastActiveISO,
    freezeTokens: nextStreak.freezeTokens,
  };

  const response: SessionCompleteResponse = {
    xpState: user.xpState,
    streakState: user.streakState,
    xpAwarded,
    badgesEarned: [],
    updatedCategoryConfidence: updatedConfidence,
  };

  trackEvent("xp_awarded", { xpAwarded, totalXp: user.xpState.xp }, session.userId);
  if (nextStreak.changed) {
    trackEvent("streak_extended", { streak: user.streakState.current }, session.userId);
  }

  trackEvent("session_complete", {
    sessionId: body.sessionId,
    completed: body.completed,
    durationMinutes: body.durationMinutes,
    xpAwarded,
    drillId,
    drillOutcome: body.drillOutcome,
    streak: user.streakState.current,
  }, session.userId);

  writeDB(db);
  return json(response);
}

export function resetMockApiState() {
  localStorage.removeItem(DB_KEY);
}

export function installMockApiServer() {
  if (typeof window === "undefined") {
    return;
  }

  const current = window.fetch.bind(window);
  if ((window as Window & { __ssaMockApiInstalled?: boolean }).__ssaMockApiInstalled) {
    return;
  }

  (window as Window & { __ssaMockApiInstalled?: boolean }).__ssaMockApiInstalled = true;

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request
      ? input
      : new Request(typeof input === "string" && input.startsWith("/") ? new URL(input, window.location.origin) : input, init);
    const url = new URL(request.url, window.location.origin);

    if (!url.pathname.startsWith("/api/")) {
      return current(input, init);
    }

    if (url.pathname === "/api/drills/assign" && request.method === "GET") {
      return handleAssign(request);
    }

    if (url.pathname === "/api/drills/result" && request.method === "POST") {
      return handleDrillResult(request);
    }

    if (url.pathname === "/api/session/start" && request.method === "POST") {
      return handleSessionStart(request);
    }

    if (url.pathname === "/api/session/complete" && request.method === "POST") {
      return handleSessionComplete(request);
    }

    return json({ message: "Unknown endpoint" }, 404);
  };
}
