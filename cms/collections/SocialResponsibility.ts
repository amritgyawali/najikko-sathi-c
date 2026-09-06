import type { CollectionConfig } from "payload";
import { isEditor, isPublishedOrStaff } from "../access";
import { statusField } from "../fields";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";

/**
 * The social responsibility work shown on /our-work.
 *
 * One entry is one piece of work: a title, an optional YouTube film, and an
 * optional photo album. An entry with only photographs is an album; an entry
 * with only a link is a film. Everything is uploaded in the dashboard, so
 * adding, replacing or removing media never needs a deploy.
 */
export const SocialResponsibility: CollectionConfig = {
  slug: "social-responsibility",
  labels: { singular: "Social responsibility entry", plural: "Social responsibility" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "date", "order"],
    group: "Content",
    description:
      "Films and photo albums from our social responsibility work, shown together on /our-work.",
    listSearchableFields: ["title", "summary"],
  },
  access: {
    read: isPublishedOrStaff,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: {
    afterChange: [revalidateDoc("", ["/our-work"])],
    afterDelete: [revalidateDocAfterDelete("", ["/our-work"])],
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "summary",
      type: "textarea",
      admin: { description: "A short description shown under the title." },
    },
    {
      name: "youtubeUrl",
      type: "text",
      label: "YouTube video",
      admin: {
        description:
          "Paste the YouTube link, for example https://www.youtube.com/watch?v=XXXXXXXXXXX. " +
          "Leave blank for a photo-only album.",
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true;
        return /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(value.trim())
          ? true
          : "Enter a YouTube link (youtube.com or youtu.be).";
      },
    },
    {
      name: "photos",
      type: "array",
      label: "Photo album",
      labels: { singular: "Photo", plural: "Photos" },
      admin: { description: "Upload as many photographs as you like and drag to reorder them." },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text" },
      ],
    },
    { name: "date", type: "date", admin: { position: "sidebar" } },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Lower numbers appear first." },
    },
    statusField,
  ],
};
