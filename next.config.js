const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias["react-router-dom"] = path.resolve(
      __dirname,
      "src/lib/router.js"
    );
    return config;
  }
};

module.exports = nextConfig;
