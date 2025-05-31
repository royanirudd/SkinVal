import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.com",
        port: "",
        pathname: "/**/*", // Adjust this depending on the actual image path
      },
    ],
  },
};

export default nextConfig;
