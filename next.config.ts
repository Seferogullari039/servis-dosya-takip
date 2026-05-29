import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { loadEnvLocal } from "./scripts/load-env.mjs";

loadEnvLocal(true);

function supabaseImageRemotePatterns():
  NonNullable<NextConfig["images"]>["remotePatterns"] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    const host = new URL(url).hostname;
    return [
      {
        protocol: "https",
        hostname: host,
        pathname: "/storage/v1/object/public/work-order-images/**",
      },
      {
        protocol: "https",
        hostname: host,
        pathname: "/storage/v1/render/image/public/work-order-images/**",
      },
    ];
  } catch {
    return [];
  }
}

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "supabase-api",
          expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: { maxEntries: 64, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: ({ request }) => request.destination === "document",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          expiration: { maxEntries: 16, maxAgeSeconds: 24 * 60 * 60 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImageRemotePatterns(),
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "named",
      };
    }
    return config;
  },
  serverExternalPackages: [
    "@react-pdf/renderer",
    "pg",
    "@supabase/supabase-js",
    "@supabase/ssr",
    "firebase-admin",
  ],
  outputFileTracingIncludes: {
    "/api/pdf/**": [
      "./public/fonts/pdf/**/*",
      "./node_modules/@fontsource/roboto/files/roboto-latin-ext-*.woff",
      "./node_modules/@fontsource/roboto/files/roboto-latin-ext-*.woff2",
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb",
    },
  },
};

export default withPWA(nextConfig);
