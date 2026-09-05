import type { CollectionConfig } from "payload";
import { isEditor, isEditorField } from "../access";

/**
 * Client testimonials. Reviews can arrive from the public submission endpoint,
 * so nothing is shown on the website until a staff member approves it.
 */
export const Reviews: CollectionConfig = {
  slug: "reviews",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "rating", "approved", "featured", "createdAt"],
    group: "Content",
    description: "Client testimonials shown on the website.",
  },
  access: {
    // Visitors only ever see approved reviews; staff see the moderation queue.
    read: ({ req }) => (req.user ? true : { approved: { equals: true } }),
    create: () => true,
    update: isEditor,
    delete: isEditor,
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
      admin: { position: "sidebar" },
    },
    { name: "quote", type: "textarea", required: true, maxLength: 600 },
    { name: "avatar", type: "upload", relationTo: "media" },
    {
      name: "approved",
      type: "checkbox",
      defaultValue: false,
      // A public submission must not be able to approve itself.
      access: { create: isEditorField, update: isEditorField },
      admin: { position: "sidebar", description: "Only approved reviews appear on the site." },
    },
    {
      name: "featured",
      type: "checkbox",
      access: { create: isEditorField, update: isEditorField },
      admin: { position: "sidebar" },
    },
  ],
};
