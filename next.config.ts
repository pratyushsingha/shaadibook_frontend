import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "localhost",
      "media.shaadialbum.in",
      "shaaadibook.s3.ap-south-1.amazonaws.com",
      "source.unsplash.com"
    ],
  },
};

export default nextConfig;
