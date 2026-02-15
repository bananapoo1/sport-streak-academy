import type {
  AssignResponse,
  DrillResultRequest,
  DrillResultResponse,
  SessionCompleteRequest,
  SessionCompleteResponse,
  SessionStartRequest,
  SessionStartResponse,
} from "@/types/dailyHabit";

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function assignDrillForUser(userId: string, category: string): Promise<AssignResponse> {
  const response = await fetch(`/api/drills/assign?userId=${encodeURIComponent(userId)}&category=${encodeURIComponent(category)}`);
  return parseJsonOrThrow<AssignResponse>(response);
}

export async function postDrillResult(payload: DrillResultRequest): Promise<DrillResultResponse> {
  const response = await fetch("/api/drills/result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJsonOrThrow<DrillResultResponse>(response);
}

export async function startSession(payload: SessionStartRequest): Promise<SessionStartResponse> {
  const response = await fetch("/api/session/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJsonOrThrow<SessionStartResponse>(response);
}

export async function completeSession(payload: SessionCompleteRequest): Promise<SessionCompleteResponse> {
  const response = await fetch("/api/session/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJsonOrThrow<SessionCompleteResponse>(response);
}
