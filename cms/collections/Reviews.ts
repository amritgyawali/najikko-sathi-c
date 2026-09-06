import type { CollectionConfig } from "payload";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";
import { isEditor, isEditorField } from "../access";
import { placementsField, STATE_CELL, THUMB_CELL } from "../fields";

/**
 * Client testimonials. Reviews can arrive from the public submission endpoint,
 * so nothing is shown on the website until a staff member approves it.
 */
export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["avatar", "name", "role", "rating", "approved", "placements"],
    group: "Content",
    description:
      "Client testimonials. Nothing here reaches the website until it is approved.",
    listSearchableFields: ["name", "quote"],
  },
  access: {
    // Visitors only ever see approved reviews; staff see the moderation queue.
    read: ({ req }) => (req.user ? true : { approved: { equals: true } }),
    create: () => true,
    update: isEditor,
    delete: isEditor,
  },
  hooks: {
    afterChange: [revalidateDoc("", ["/"])],
    afterDelete: [revalidateDocAfterDelete("", ["/"])],
  },

  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", admin: { description: "Job title or organisation." } },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
      admin: {
        position: "sidebar",
        description: "Out of five.",
        components: { Cell: "/cms/components/cells/RatingCell#RatingCell" },
      },
    },
    { name: "quote", type: "textarea", required: true, maxLength: 600 },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
      label: "Photograph",
      admin: { components: { Cell: THUMB_CELL } },
    },
    {
      name: "approved",
      type: "checkbox",
      defaultValue: false,
      // A public submission must not be able to approve itself.
      access: { create: isEditorField, update: isEditorField },
      admin: {
        position: "sidebar",
        description: "Only approved reviews appear on the site.",
        components: { Cell: STATE_CELL },
      },
    },
    {
      name: "featured",
      type: "checkbox",
      access: { create: isEditorField, update: isEditorField },
      admin: {
        position: "sidebar",
        description: "Show this one first.",
        components: { Cell: STATE_CELL },
      },
    },
    placementsField({
      thing: "review",
      everywhere: "on every page that carries a reviews band",
      // A visitor submitting a review must not choose where it is published.
      access: { create: isEditorField, update: isEditorField },
    }),
  ],
};
