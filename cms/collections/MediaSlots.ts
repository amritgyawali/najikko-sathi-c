import type { CollectionConfig } from "payload";
import { isEditor } from "../access";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";

/**
 * The photo and video shown in the showcase band on a given page.
 *
 * This replaces the old hard-coded media table: an editor uploads a picture in
 * the dashboard and picks which page it belongs to, instead of copying a file
 * into the repository and redeploying.
 */
export const MediaSlots: CollectionConfig = {
  slug: "media-slots",
  labels: { singular: "Page media", plural: "Page media" },
  admin: {
    useAsTitle: "key",
    defaultColumns: ["key", "image", "updatedAt"],
    group: "Content",
    description: "The photo or video featured on each page.",
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: {
    afterChange: [revalidateDoc("", ["/", "/services", "/our-work", "/about", "/production", "/training"])],
    afterDelete: [revalidateDocAfterDelete("", ["/", "/services", "/our-work", "/about", "/production", "/training"])],
  },
  fields: [
    {
      name: "key",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Which page this belongs to: "home", "about", "services", "contact", or a service slug such as "documentary-film-production".',
      },
    },
    { name: "image", type: "upload", relationTo: "media" },
    { name: "caption", type: "text" },
    {
      name: "video",
      type: "group",
      fields: [
        { name: "src", type: "text", admin: { description: "URL of the video file." } },
        { name: "poster", type: "text", admin: { description: "URL of the still shown before playback." } },
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        { name: "transcript", type: "textarea" },
        { name: "duration", type: "text", admin: { description: 'ISO 8601, e.g. "PT2M30S".' } },
        { name: "uploadDate", type: "date" },
      ],
    },
  ],
};
