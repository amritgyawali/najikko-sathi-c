import type { CollectionConfig } from "payload";
import { isEditor } from "../access";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";
import { mediaPlaceholderPaths, mediaPlaceholders } from "../../lib/site-map";

/**
 * The photograph and the film shown on a given page.
 *
 * Every blue placeholder on the website is one row here. An editor opens the
 * row for a page, uploads a picture or a film, saves, and the placeholder is
 * replaced on the next request - no file copied into the repository and no
 * deployment. The dashboard's "Page media" panel lists every placeholder and
 * links straight to its row, so nobody has to remember these keys.
 *
 * A film can arrive three ways, and the page uses the first one that is filled
 * in: an uploaded file, a YouTube link, or the address of a film hosted
 * elsewhere. The link is what to reach for when a film is too large for the
 * host's upload limit.
 */

/** The keys the website itself draws, listed for the editor's benefit. */
const knownKeys = mediaPlaceholders
  .map((placeholder) => `"${placeholder.key}" (${placeholder.path})`)
  .join(", ");

export const MediaSlots: CollectionConfig = {
  slug: "media-slots",
  labels: { singular: "Page media", plural: "Page media" },
  admin: {
    useAsTitle: "key",
    defaultColumns: ["key", "image", "updatedAt"],
    group: "Content",
    description:
      "The photograph or film featured on each page. Open a row, upload a picture or a film, and save.",
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: {
    // A film or a photograph can appear on any of these pages, and a service
    // page takes its key from the service's slug, so the whole site is purged.
    afterChange: [revalidateDoc("", mediaPlaceholderPaths)],
    afterDelete: [revalidateDocAfterDelete("", mediaPlaceholderPaths)],
  },
  fields: [
    {
      name: "key",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "Placeholder",
      admin: {
        description: `Which placeholder this fills: ${knownKeys}, or a service slug such as "documentary-film-production" for a service page.`,
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Photograph",
      filterOptions: { mimeType: { contains: "image" } },
      admin: { description: "Replaces the blue photo placeholder on this page." },
    },
    {
      name: "caption",
      type: "text",
      admin: { description: "Printed under the photograph. Optional." },
    },
    {
      name: "video",
      type: "group",
      label: "Film",
      admin: {
        description:
          "Fill in one of the three sources below. An uploaded file is used first, then a YouTube link, then an address.",
      },
      fields: [
        {
          name: "file",
          type: "upload",
          relationTo: "media",
          label: "Upload a film",
          filterOptions: { mimeType: { contains: "video" } },
          admin: {
            description:
              "An MP4 or WebM file. Large films are better published on YouTube and linked below - a host usually caps how much can be uploaded in one request.",
          },
        },
        {
          name: "youtubeUrl",
          type: "text",
          label: "YouTube link",
          admin: { description: "Paste an ordinary watch or share link." },
        },
        {
          name: "src",
          type: "text",
          label: "Film address",
          admin: { description: "The address of a film hosted somewhere else." },
        },
        {
          name: "posterImage",
          type: "upload",
          relationTo: "media",
          label: "Still image",
          filterOptions: { mimeType: { contains: "image" } },
          admin: { description: "Shown before the film is played. Optional." },
        },
        {
          name: "poster",
          type: "text",
          label: "Still image address",
          admin: { description: "Only needed when the still is hosted elsewhere." },
        },
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        {
          name: "transcript",
          type: "textarea",
          admin: { description: "What is said in the film, as readable text. Helps search engines." },
        },
        { name: "duration", type: "text", admin: { description: 'ISO 8601, e.g. "PT2M30S".' } },
        { name: "uploadDate", type: "date" },
      ],
    },
  ],
};
