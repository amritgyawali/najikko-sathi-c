import type { CollectionConfig } from "payload";
import { isEditor, isPublishedOrStaff } from "../access";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";
import { seoField, slugField, statusField } from "../fields";

/**
 * The service portfolio. Each document renders its own page at
 * /services/<slug>, and also feeds the services index, the homepage grid and
 * the footer, so editing one here updates every place it appears.
 */
export const Services: CollectionConfig = {
  slug: "services",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "status", "order"],
    group: "Services",
    description: "Everything the company offers, one document per service.",
  },
  versions: { drafts: true },
  access: {
    read: isPublishedOrStaff,
    create: isEditor,
    update: isEditor,
    delete: isEditor,
  },
  hooks: {
    afterChange: [revalidateDoc("/services", ["/", "/services"])],
    afterDelete: [revalidateDocAfterDelete("/services", ["/", "/services"])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Overview",
          fields: [
            { name: "title", type: "text", required: true },
            {
              name: "shortTitle",
              type: "text",
              required: true,
              admin: { description: "Used on cards and in breadcrumbs." },
            },
            {
              name: "description",
              type: "textarea",
              required: true,
              admin: { description: "One or two sentences, shown on cards and in the page header." },
            },
            { name: "image", type: "upload", relationTo: "media" },
            { name: "intro", type: "textarea", required: true },
            { name: "audience", type: "textarea", label: "Who this is for" },
            { name: "preparation", type: "textarea", label: "What to prepare" },
          ],
        },
        {
          label: "Scope",
          fields: [
            {
              name: "deliverables",
              type: "array",
              label: "What we can work on",
              fields: [{ name: "item", type: "text", required: true }],
            },
            {
              name: "steps",
              type: "array",
              label: "How it comes together",
              fields: [
                { name: "title", type: "text", required: true },
                { name: "description", type: "textarea", required: true },
              ],
            },
            {
              name: "faq",
              type: "array",
              label: "Questions",
              fields: [
                { name: "question", type: "text", required: true },
                { name: "answer", type: "textarea", required: true },
              ],
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "metaDescription",
              type: "textarea",
              admin: { description: "Search-result description for this service page." },
            },
            seoField,
          ],
        },
      ],
    },
    slugField(),
    statusField,
    {
      name: "category",
      type: "relationship",
      relationTo: "service-categories",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Lower numbers appear first." },
    },
    {
      name: "featured",
      type: "checkbox",
      admin: { position: "sidebar", description: "Highlight on the homepage grid." },
    },
  ],
};
