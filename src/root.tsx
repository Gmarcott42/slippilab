import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { App } from "~/App";
import { ToastProvider } from "~/common/toaster";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>
);
