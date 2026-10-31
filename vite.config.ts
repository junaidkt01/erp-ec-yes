import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const DAY_IN_SECONDS = 60 * 60 * 24;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // "prompt" keeps a new version waiting until the user chooses Update Now.
      registerType: "prompt",
      // Registered from useServiceWorkerUpdate so the app controls the update flow.
      injectRegister: false,
      manifest: {
        id: "/",
        name: "YES INDIA SCHOOLS ERP",
        short_name: "YES ERP",
        description: "School management for YES India Schools.",
        lang: "en",
        dir: "ltr",
        start_url: "/dashboard",
        scope: "/",
        display: "standalone",
        orientation: "any",
        theme_color: "#605dec",
        background_color: "#f4f3fe",
        categories: ["education", "productivity"],
        icons: [
          { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/pwa/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/pwa/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        cacheId: "yes-erp",
        clientsClaim: true,
        skipWaiting: false,
        cleanupOutdatedCaches: true,

        // App shell only. Large images and on-demand libraries use runtime caching below.
        globPatterns: ["index.html", "assets/*.{js,css}", "svgs/**/*.svg", "header_icons/*.svg", "sidebar_icons/*.svg", "pwa/*.png", "favicon.png"],
        globIgnores: ["assets/dash*.js", "assets/hls*.js", "assets/exceljs*.js"],

        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],

        // Ordered: the first matching route wins, so the API rule must stay first.
        runtimeCaching: [
          {
            // Auth, ERP data and uploaded files. TanStack Query is the only API cache.
            urlPattern: /^https?:\/\/[^/]+\/api\//,
            handler: "NetworkOnly",
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "yes-erp-fonts-css-v1",
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 4, maxAgeSeconds: 30 * DAY_IN_SECONDS },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: "CacheFirst",
            options: {
              cacheName: "yes-erp-fonts-v1",
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 12, maxAgeSeconds: 365 * DAY_IN_SECONDS },
            },
          },
          {
            urlPattern: ({ request, sameOrigin }) => sameOrigin && request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "yes-erp-images-v1",
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * DAY_IN_SECONDS, purgeOnQuotaError: true },
            },
          },
          {
            urlPattern: /\/assets\/(dash|hls|exceljs).*\.js$/,
            handler: "CacheFirst",
            options: {
              cacheName: "yes-erp-libraries-v1",
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 6, maxAgeSeconds: 30 * DAY_IN_SECONDS, purgeOnQuotaError: true },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Hashes stay stable across releases, so updates skip re-downloading these.
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-data": ["@tanstack/react-query", "axios", "zustand"],
        },
      },
    },
  },
});
