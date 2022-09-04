import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  assetsInclude: [/.*zip$/, /.*ttf$/],
  plugins: [react(), tsconfigPaths()],
});
