import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// ✅ Load environment variables
const API_URL =
  process.env.VITE_API_URL || "https://admin-backend-qyhk.onrender.com";

export default defineConfig({
  plugins: [react()],

  // ✅ Local dev server only (Vercel ignores this)
  server: {
    port: 5175,
    open: true,
    proxy: {
      "/api": {
        target: API_URL,
        changeOrigin: true,
        secure: true,
      },
    },
  },

  // ✅ Aliases for clean imports
  resolve: {
    alias: {
      "@": "/src",
    },
  },

  // ✅ Optional but recommended: disable big chunk warnings
  build: {
    chunkSizeWarningLimit: 1600,
  },
});
