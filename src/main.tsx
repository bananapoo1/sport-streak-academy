import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installMockApiServer } from "@/services/mockApiServer";

installMockApiServer();

createRoot(document.getElementById("root")!).render(<App />);
