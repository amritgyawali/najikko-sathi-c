import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

/**
 * The Cloudinary cloud a dashboard upload is stored in, taken from the
 * connection string so a change of account does not silently stop every
 * uploaded photograph from being optimized. Falls back to the account the site
 * has always used, which keeps a build with no environment file working.
 */
const cloudinaryCloud = (() => {
  try {
    return new URL(process.env.CLOUDINARY_URL ?? "").hostname || "v7paiwof";
  } catch {
    return "v7paiwof";
  }
})();

const nextConfig: NextConfig = {
  agentRules: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 88],
    // Dashboard uploads are served by the configured storage provider.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "res.cloudinary.com", pathname: `/${cloudinaryCloud}/**` },
    ],
  },
};

export default withPayload(nextConfig);
