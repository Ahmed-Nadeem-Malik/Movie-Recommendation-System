/**
 * Application entry point
 *
 * Renders the main App component with React 19 StrictMode for development checks.
 * Uses the new createRoot API for optimal performance.
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Mount the React application to the DOM
createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
