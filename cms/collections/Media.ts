import type { CollectionConfig } from "payload";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";
import { isEditor } from "../access";

/**
 * Central file library. Every photograph and film on the website is uploaded
 * here once and referenced elsewhere, so swapping a file updates it everywhere
 * at once.
 *
 * Films are stored beside the photographs rather than in a collection of their
 * own: the storage adapter already knows how to hand a video to Cloudinary, and
 * one library means an editor has one place to look for a file they uploaded.
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Content",
    description: "Photos, films and files used across the website.",
  },
  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  upload: {
    // Films are accepted here, but the host decides how large an upload may
    // be: on Vercel a request body cannot exceed 4.5 MB, so anything longer
    // than a short clip is better published on YouTube. Page media takes a
    // YouTube link or a file address for exactly that case.
    mimeTypes: ["image/*", "video/*", "application/pdf"],
    focalPoint: true,
    imageSizes: [
      { name: "thumbnail", width: 480, height: undefined, position: "centre" },
      { name: "card", width: 900, height: undefined, position: "centre" },
      { name: "hero", width: 2400, height: undefined, position: "centre" },
    ],
  },
  hooks: {
    afterChange: [revalidateDoc("", ["/"])],
    afterDelete: [revalidateDocAfterDelete("", ["/"])],
  },

  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      admin: {
        description: "Describe the picture or film for screen readers and search engines.",
      },
    },
    {
      name: "credit",
      type: "text",
      admin: { description: "Optional photographer or source credit." },
    },
  ],
};
