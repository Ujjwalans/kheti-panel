import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Lets the client call "/api/..." during development without CORS
      // headaches; the axios client below builds absolute URLs from
      // VITE_API_URL, so this is a convenience fallback rather than the
      // only path.
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
