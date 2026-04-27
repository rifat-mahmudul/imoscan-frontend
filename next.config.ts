import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.freepik.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "api.dicebear.com" },
      { hostname: "i.pravatar.cc" },
      { hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
