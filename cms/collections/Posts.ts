import type { CollectionConfig } from "payload";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";
import { isEditorOrOwner, isPublishedOrStaff } from "../access";
import { seoField, slugField, statusField, THUMB_CELL } from "../fields";

/**
 * News articles, blog entries, commentary and investigations. One collection
 * with a `type` field keeps authoring in a single place while still letting the
 * website list each kind separately.
 */
export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["coverImage", "title", "type", "status", "publishedAt"],
    group: "Content",
    description:
      "News, blogs, commentary and investigative pieces. Published ones appear at /posts, newest first.",
    listSearchableFields: ["title", "excerpt"],
  },
  versions: { drafts: true },
  access: {
    read: isPublishedOrStaff,
    create: ({ req }) => Boolean(req.user),
    update: isEditorOrOwner,
    delete: isEditorOrOwner,
  },
  hooks: {
    afterChange: [revalidateDoc("/posts", ["/", "/posts"])],
    afterDelete: [revalidateDocAfterDelete("/posts", ["/", "/posts"])],
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
      name: "publishAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description: "Optional. The post stays hidden until this time.",
      },
    },
    {
      name: "unpublishAt",
      type: "date",
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description: "Optional. The post disappears from the site after this time.",
      },
    },
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
    {
      type: "tabs",
      tabs: [
        {
          label: "The piece",
          description: "Everything a reader sees, in the order they meet it.",
          fields: [
            {
              name: "coverImage",
              type: "upload",
              relationTo: "media",
              label: "Cover photograph",
              admin: {
                description: "Shown at the top of the post and in link previews.",
                components: { Cell: THUMB_CELL },
              },
            },
            {
              name: "excerpt",
              type: "textarea",
              maxLength: 300,
              label: "Standfirst",
              admin: {
                description: "One or two sentences. Used in listings, search results and link previews.",
              },
            },
            { name: "content", type: "richText", label: "Body" },
            {
              name: "tags",
              type: "array",
              labels: { singular: "Tag", plural: "Tags" },
              admin: { description: "Optional. Used for grouping and for search." },
              fields: [{ name: "tag", type: "text", required: true }],
            },
          ],
        },
        {
          label: "Search results",
          description: "Overrides what a search engine shows. Left blank, the title and standfirst are used.",
          fields: [seoField],
        },
      ],
    },
  ],
};
