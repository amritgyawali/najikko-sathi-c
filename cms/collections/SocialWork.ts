import type { CollectionConfig } from "payload";
import { isEditor, isPublishedOrStaff } from "../access";
import { placementsField, slugField, statusField, THUMB_CELL } from "../fields";
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
 * title, a short description for its card, the full account of it, as many
 * photographs as it took, and as many YouTube films as were made of it. Each
 * film carries its own title and description too, so a gallery of several
 * videos reads as more than a wall of players.
 *
 * /social-work shows only the cards - a cover photograph, a title and a line or
 * two - so a visitor can see everything at once rather than scrolling past one
 * whole album to reach the next. Opening a card goes to /social-work/<address>,
 * where that entry has a page of its own carrying the full description, every
 * photograph and every film.
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
    defaultColumns: ["coverImage", "title", "slug", "status", "date", "order"],
    group: "Content",
    description:
      "Photo albums and YouTube films from our social work. /social-work shows one card per " +
      "entry, and each card opens the entry's own page. Add an entry, upload its photographs, " +
      "paste its video links, and publish.",
    listSearchableFields: ["title", "summary", "description"],
  },
  access: {
    read: isPublishedOrStaff,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: {
    // The first argument is the prefix of the entry's own page, so saving an
    // entry purges /social-work/<address> along with every band that lists it.
    afterChange: [revalidateDoc("/social-work", PAGES)],
    afterDelete: [revalidateDocAfterDelete("/social-work", PAGES)],
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "summary",
      type: "textarea",
      label: "Short description",
      admin: {
        description:
          "The line or two printed on this entry's card on /social-work, under its title. " +
          "Leave it empty and the opening of the full description below is used instead.",
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "About this work",
      admin: {
        description:
          "The full account of it, printed on the entry's own page above the photographs " +
          "and films.",
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
          "Optional. The picture on this entry's card, and the one that leads its page. The " +
          "first photograph in the album below stands in when this is left empty.",
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
    slugField(),
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
