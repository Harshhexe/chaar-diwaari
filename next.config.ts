import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [420, 640, 828, 1080, 1440, 1920, 2560],
    /**
     * Artwork and stills are served from the platforms' own CDNs and optimised
     * through next/image rather than being copied into this repo. Only these
     * four hosts are permitted; anything else is refused at build time.
     *
     *  - is1-ssl.mzstatic.com : Apple Music artwork + artist images
     *  - i.scdn.co            : Spotify artist images
     *  - i.ytimg.com          : YouTube thumbnails
     */
    remotePatterns: [
      { protocol: "https", hostname: "is1-ssl.mzstatic.com", pathname: "/image/**" },
      { protocol: "https", hostname: "i.scdn.co", pathname: "/image/**" },
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: ["motion", "gsap"],
  },
};

export default nextConfig;
