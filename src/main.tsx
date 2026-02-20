import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installMockApiServer } from "@/services/mockApiServer";
import { validateRuntimeConfig, shouldInstallMockApiServer } from "@/config/runtime";
import { initGlobalErrorMonitoring } from "@/services/errorMonitoring";

validateRuntimeConfig();
initGlobalErrorMonitoring();

if (shouldInstallMockApiServer()) {
	installMockApiServer();
}

createRoot(document.getElementById("root")!).render(<App />);
