import type { Block } from "payload";

import { sectionBlocks } from "./sections";

/**
 * The building blocks available in the page builder. An admin composes a page
 * by stacking these in any order, without touching code.
 *
 * Two families sit side by side. The blocks below are the free-form ones - a
 * hero, some text, a card grid, a gallery - for a page invented in the
 * dashboard. cms/sections.ts holds the sections the website's own pages are
 * built from, so those pages can be edited in exactly the same way. Both are
 * offered on every page, and both render through
 * app/(frontend)/_components/PageSections.tsx.
 */

export const HeroBlock: Block = {
  slug: "hero",
  labels: { singular: "Hero", plural: "Heroes" },
  fields: [
    { name: "kicker", type: "text" },
    { name: "heading", type: "text", required: true },
    { name: "subheading", type: "textarea" },
    { name: "background", type: "upload", relationTo: "media" },
    {
      name: "actions",
      type: "array",
      maxRows: 2,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
        {
          name: "style",
          type: "select",
          defaultValue: "primary",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Secondary", value: "secondary" },
          ],
        },
      ],
    },
  ],
};

export const RichTextBlock: Block = {
  slug: "richText",
  labels: { singular: "Text section", plural: "Text sections" },
  fields: [
    { name: "heading", type: "text" },
    { name: "content", type: "richText", required: true },
  ],
};

export const CardGridBlock: Block = {
  slug: "cardGrid",
  labels: { singular: "Card grid", plural: "Card grids" },
  fields: [
    { name: "kicker", type: "text" },
    { name: "heading", type: "text" },
    { name: "intro", type: "textarea" },
    {
      name: "cards",
      type: "array",
      minRows: 1,
      fields: [
        { name: "title", type: "text", required: true },
        { name: "description", type: "textarea" },
        { name: "href", type: "text" },
        { name: "image", type: "upload", relationTo: "media" },
      ],
    },
  ],
};

export const GalleryBlock: Block = {
  slug: "gallery",
  labels: { singular: "Gallery", plural: "Galleries" },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "images",
      type: "array",
      minRows: 1,
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "caption", type: "text" },
      ],
    },
  ],
};

export const CtaBlock: Block = {
  slug: "cta",
  labels: { singular: "Call to action", plural: "Calls to action" },
  fields: [
    { name: "heading", type: "text", required: true },
    { name: "body", type: "textarea" },
    { name: "buttonLabel", type: "text", required: true },
    { name: "buttonHref", type: "text", required: true },
  ],
};

export const ReviewsBlock: Block = {
  slug: "reviewsBlock",
  labels: { singular: "Reviews", plural: "Reviews" },
  fields: [
    { name: "heading", type: "text", defaultValue: "What our clients say" },
    {
      name: "source",
      type: "select",
      defaultValue: "featured",
      options: [
        { label: "Featured reviews only", value: "featured" },
        { label: "All approved reviews", value: "all" },
      ],
    },
    { name: "limit", type: "number", defaultValue: 6, min: 1, max: 24 },
  ],
};

export const PostsBlock: Block = {
  slug: "postsBlock",
  labels: { singular: "Post list", plural: "Post lists" },
  fields: [
    { name: "heading", type: "text" },
    {
      name: "type",
      type: "select",
      defaultValue: "news",
      options: [
        { label: "News", value: "news" },
        { label: "Blog", value: "blog" },
        { label: "Commentary", value: "commentary" },
        { label: "Investigation", value: "investigation" },
        { label: "Any", value: "any" },
      ],
    },
    { name: "limit", type: "number", defaultValue: 3, min: 1, max: 24 },
  ],
};

export const OffersBlock: Block = {
  slug: "offersBlock",
  labels: { singular: "Offer list", plural: "Offer lists" },
  fields: [
    { name: "heading", type: "text", defaultValue: "Current offers" },
    { name: "limit", type: "number", defaultValue: 3, min: 1, max: 24 },
  ],
};

/** The free-form page-builder blocks, on their own. */
export const builderBlocks: Block[] = [
  HeroBlock,
  RichTextBlock,
  CardGridBlock,
  GalleryBlock,
  CtaBlock,
  ReviewsBlock,
  PostsBlock,
  OffersBlock,
];

/** Everything a page can be made of: the website's sections, then the builder. */
export const layoutBlocks: Block[] = [...sectionBlocks, ...builderBlocks];
