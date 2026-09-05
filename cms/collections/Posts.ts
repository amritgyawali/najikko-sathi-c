import type { CollectionConfig } from "payload";
import { isEditorOrOwner, isPublishedOrStaff } from "../access";
import { seoField, slugField, statusField } from "../fields";

/**
 * News articles, blog entries, commentary and investigations. One collection
 * with a `type` field keeps authoring in a single place while still letting the
 * website list each kind separately.
 */
export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "type", "status", "publishedAt", "author"],
    group: "Content",
    description: "News, blogs, commentary and investigative pieces.",
  },
  versions: { drafts: true },
  access: {
    read: isPublishedOrStaff,
    create: ({ req }) => Boolean(req.user),
    update: isEditorOrOwner,
    delete: isEditorOrOwner,
  },
  fields: [
    { name: "title", type: "text", required: true },
    slugField(),
    {
      name: "type",
      type: "select",
      required: true,
      defaultValue: "news",
      index: true,
      options: [
        { label: "News", value: "news" },
        { label: "Blog", value: "blog" },
        { label: "Commentary", value: "commentary" },
        { label: "Investigation", value: "investigation" },
      ],
      admin: { position: "sidebar" },
    },
    statusField,
    {
      name: "publishedAt",
      type: "date",
      defaultValue: () => new Date().toISOString(),
      admin: { position: "sidebar", date: { pickerAppearance: "dayAndTime" } },
    },
    {
      name: "featured",
      type: "checkbox",
      admin: { position: "sidebar", description: "Show this on the homepage." },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar" },
      // Stamp the creator so the "authors edit their own posts" rule has
      // something to match against.
      defaultValue: ({ user }) => user?.id,
    },
    { name: "coverImage", type: "upload", relationTo: "media" },
    {
      name: "excerpt",
      type: "textarea",
      maxLength: 300,
      admin: { description: "Short summary used in listings and link previews." },
    },
    { name: "content", type: "richText" },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text", required: true }],
    },
    seoField,
  ],
};
