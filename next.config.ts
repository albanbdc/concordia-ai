import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};

    // ✅ Alias @ -> racine du projet (fiable sur Vercel)
    config.resolve.alias["@"] = __dirname;

    return config;
  },
};

export default nextConfig;
