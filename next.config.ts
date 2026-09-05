import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 88],
    // Dashboard uploads are served by the configured storage provider.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/v7paiwof/**" },
    ],
  },
};

export default withPayload(nextConfig);
