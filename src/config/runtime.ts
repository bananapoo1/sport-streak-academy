const REQUIRED_VITE_KEYS = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;

export function validateRuntimeConfig() {
  if (import.meta.env.MODE === "test") {
    return;
  }

  const missing = REQUIRED_VITE_KEYS.filter((key) => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export function shouldInstallMockApiServer() {
  return import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_API === "true";
}
