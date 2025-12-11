// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8611, // puerto de dev
    strictPort: true, // si el 8611 está ocupado, que no cambie solo
  },
  preview: {
    port: 8611, // mismo puerto para `yarn preview`
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
