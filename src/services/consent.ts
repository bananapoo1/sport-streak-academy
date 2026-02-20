export type ConsentStatus = "granted" | "denied" | "unknown";

const CONSENT_KEY = "ssa.analytics.consent.v1";

function getDefaultConsent(): ConsentStatus {
  const configured = import.meta.env.VITE_ANALYTICS_DEFAULT_CONSENT;
  if (configured === "granted" || configured === "denied") {
    return configured;
  }
  return "unknown";
}

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") {
    return getDefaultConsent();
  }

  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored === "granted" || stored === "denied") {
    return stored;
  }

  return getDefaultConsent();
}

export function setConsentStatus(status: Exclude<ConsentStatus, "unknown">) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(CONSENT_KEY, status);
}

export function hasConsentDecision(): boolean {
  const status = getConsentStatus();
  return status === "granted" || status === "denied";
}

export function canTrackAnalytics(): boolean {
  return getConsentStatus() === "granted";
}
