import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // App Hosting serves images as-is; the loader picks pre-generated WebP copies instead.
    loader: "custom",
    loaderFile: "./src/presentation/ui/image-loader.ts",
    // 90 is reserved for photos of Nayra; 75 stays the default elsewhere.
    qualities: [75, 90],
    // Gallery photos are served from Cloud Storage (or its emulator in development).
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/v0/b/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "9199", pathname: "/v0/b/**" },
    ],
    // The Storage emulator runs on 127.0.0.1, which Next blocks by default. Never set in production.
    dangerouslyAllowLocalIP: Boolean(process.env.FIREBASE_STORAGE_EMULATOR_HOST),
  },
  // The EPK PDF route reads fonts and its cover photo from disk at request time. They live in
  // src/assets, never public/: tracing a public/ file makes App Hosting skip copying public/.
  outputFileTracingIncludes: {
    "/panel/epk/pdf": ["./src/assets/fonts/**", "./src/assets/images/**"],
  },
  experimental: {
    // Gallery uploads accept photos up to 10 MB (validated again in the Server Action);
    // the extra 1 MB covers multipart overhead. The proxy buffers the body, so it needs the same room.
    serverActions: { bodySizeLimit: "11mb" },
    proxyClientMaxBodySize: "11mb",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
