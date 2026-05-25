import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: ["favicon.svg", "pwa-192.svg", "pwa-512.svg"],
      manifest: {
        name: "Krishna's Kitchen",
        short_name: "Kitchen",
        description: "Mobile-first kitchen operations PWA.",
        theme_color: "#14532d",
        background_color: "#fff7ed",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "/pwa-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      registerType: "autoUpdate",
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        navigateFallback: "/index.html"
      }
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@krishnas-kitchen/types": fileURLToPath(
        new URL("../../packages/types/src/index.ts", import.meta.url)
      ),
      "@krishnas-kitchen/ui": fileURLToPath(
        new URL("../../packages/ui/src/index.ts", import.meta.url)
      ),
      "@krishnas-kitchen/utils": fileURLToPath(
        new URL("../../packages/utils/src/index.ts", import.meta.url)
      )
    }
  },
  server: {
    port: 5173,
    strictPort: false
  }
});
