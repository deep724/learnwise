import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (/recharts|d3-|victory-vendor|react-smooth/.test(id))
              return "charts";
            if (
              /react-dom|react-router|\/react\//.test(id.replaceAll("\\", "/"))
            )
              return "react-vendor";
          }
        },
      },
    },
  },
});
