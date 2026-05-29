import type { NextConfig } from "next";
import { loadEnvLocal } from "./scripts/load-env.mjs";

// Windows sistem env (ör. example.supabase.co) .env.local'i ezmesin diye
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
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseImageRemotePatterns(),
  },
  // Supabase vendor-chunk kaybını önler; sunucu doğrudan node_modules kullanır
  webpack: (config, { dev }) => {
    if (dev) {
      // Bozuk HMR chunk'larında "__webpack_modules__[id] is not a function" riskini azaltır
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

export default nextConfig;
