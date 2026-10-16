import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: resolve(import.meta.dirname),
  publicDir: resolve(import.meta.dirname, "../../public"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "../../src"),
      "next/image": resolve(import.meta.dirname, "image.tsx"),
    },
  },
  server: { host: "127.0.0.1", port: 3101, strictPort: true },
});
