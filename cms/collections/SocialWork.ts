import type { CollectionConfig } from "payload";
import { isEditor, isPublishedOrStaff } from "../access";
import { placementsField, statusField, THUMB_CELL } from "../fields";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";

/** The pages a social work entry can reach, for purging their cached render. */
const PAGES = ["/social-work", "/our-work", "/"];

/** An ordinary YouTube watch or share link. */
const youtubeLink = (value: string | null | undefined): true | string => {
  if (!value) return true;
  return /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)\//i.test(value.trim())
    ? true
    : "Enter a YouTube link (youtube.com or youtu.be).";
};

/**
 * The social work shown on /social-work.
 *
 * One entry is one piece of work, and everything about it is uploaded here: a
 * title, a description, as many photographs as it took, and as many YouTube
 * films as were made of it. Each film carries its own title and description
 * too, so a gallery of several videos reads as more than a wall of players.
 *
 * Nothing about an entry needs a deploy. An editor adds the entry, drags the
 * photographs into order, pastes the YouTube links, publishes, and the page
 * carries it on the next request.
 */
export const SocialWork: CollectionConfig = {
  slug: "social-work",
  labels: { singular: "Social work entry", plural: "Social Work" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["coverImage", "title", "status", "date", "order"],
    group: "Content",
    description:
      "Photo albums and YouTube films from our social work, shown together on /social-work. " +
      "Add an entry, upload its photographs, paste its video links, and publish.",
    listSearchableFields: ["title", "description"],
  },
  access: {
    read: isPublishedOrStaff,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: {
    afterChange: [revalidateDoc("", PAGES)],
    afterDelete: [revalidateDocAfterDelete("", PAGES)],
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "description",
      type: "textarea",
      label: "About this work",
      admin: {
        description:
          "What the photographs and films below show. Printed under the title.",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      label: "Cover photograph",
      filterOptions: { mimeType: { contains: "image" } },
      admin: {
        description:
          "Optional. Leads the entry, and names it in the list here. The album below is used " +
          "when this is left empty.",
        components: { Cell: THUMB_CELL },
      },
    },
    {
      name: "photos",
      type: "array",
      label: "Photographs",
      labels: { singular: "Photograph", plural: "Photographs" },
      admin: {
        description:
          "Upload as many as you like and drag to reorder them. Each one can carry a caption " +
          "describing what it shows.",
      },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        {
          name: "caption",
          type: "text",
          admin: { description: "Printed under the photograph. Optional." },
        },
      ],
    },
    {
      name: "videos",
      type: "array",
      label: "Videos",
      labels: { singular: "Video", plural: "Videos" },
      admin: {
        description:
          "Paste a YouTube link for each film. Add as many as you like and drag to reorder them.",
      },
      fields: [
        {
          name: "youtubeUrl",
          type: "text",
          label: "YouTube link",
          required: true,
          validate: youtubeLink,
          admin: {
            description:
              "An ordinary watch or share link, for example " +
              "https://www.youtube.com/watch?v=XXXXXXXXXXX.",
          },
        },
        {
          name: "title",
          type: "text",
          admin: { description: "Printed above the player. Optional." },
        },
        {
          name: "description",
          type: "textarea",
          label: "About this video",
          admin: { description: "Printed under the player. Optional." },
        },
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
    placementsField({
      thing: "entry",
      everywhere: "on every page that carries a social work band",
    }),
  ],
};
