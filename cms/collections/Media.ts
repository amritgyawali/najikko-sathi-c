import type { CollectionConfig } from "payload";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";
import { isEditor } from "../access";

/**
 * Central image library. Every photo on the website is uploaded here once and
 * referenced elsewhere, so swapping a picture updates it everywhere at once.
 */
export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Content",
    description: "Photos and files used across the website.",
  },
  access: {
    read: () => true,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  upload: {
    mimeTypes: ["image/*", "application/pdf"],
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
        description: "Describe the image for screen readers and search engines.",
      },
    },
    {
      name: "credit",
      type: "text",
      admin: { description: "Optional photographer or source credit." },
    },
  ],
};
