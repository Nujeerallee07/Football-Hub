/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.api-sports.io" },
      { protocol: "https", hostname: "crests.football-data.org" },
      { protocol: "https", hostname: "**.cloudfront.net" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["axios"],
  },
};

module.exports = nextConfig;
