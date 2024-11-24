/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "", // Leave empty for default port
        pathname: "/u/**", // Match any user avatar
      },
    ],
  },
};

module.exports = nextConfig;
