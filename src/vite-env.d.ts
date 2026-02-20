/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL?: string;
	readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
	readonly VITE_SUPABASE_PROJECT_ID?: string;
	readonly VITE_ENABLE_MOCK_API?: string;
	readonly VITE_ANALYTICS_DEFAULT_CONSENT?: "granted" | "denied";
	readonly VITE_ERROR_REPORT_ENDPOINT?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
