import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const API_URL =
  process.env.VITE_API_URL || "https://admin-backend-qyhk.onrender.com";

export default defineConfig({
  plugins: [react()],

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

  resolve: {
    alias: {
      "@": "/src",
    },
  },

  build: {
    chunkSizeWarningLimit: 1600,
  },
});