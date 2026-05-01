import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Ensure a single copy of react is used across all deps (prevents context conflicts)
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // Force Vite to pre-bundle these so they share one React context instance
    include: ["leaflet", "react-leaflet"],
  },
  build: {
    sourcemap: false, // Disabling sourcemaps in prod speeds up build and reduces size
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "react-vendor";
            }
            if (id.includes("@supabase")) {
              return "supabase-vendor";
            }
            if (id.includes("lucide-react")) {
              return "lucide-vendor";
            }
            if (id.includes("framer-motion")) {
              return "framer-vendor";
            }
            if (id.includes("recharts")) {
              return "recharts-vendor";
            }
            return "vendor";
          }
        },
      },
    },
  },
}));

