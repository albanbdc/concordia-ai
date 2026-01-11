const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname);
const sentinelPath = path.join(root, "VERCEL_SENTINEL.txt");

/** @type {import('next').NextConfig} */
module.exports = {
  webpack: (config) => {
    // Log visible in Vercel build logs
    console.log("[CONFIG] root =", root);
    console.log("[CONFIG] sentinel exists =", fs.existsSync(sentinelPath));

    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias["@"] = root;

    // Log alias
    console.log("[CONFIG] alias @ =", config.resolve.alias["@"]);

    return config;
  },
};
