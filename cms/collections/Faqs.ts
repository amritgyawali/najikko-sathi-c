import type { CollectionConfig } from "payload";
import { isEditor } from "../access";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";

/**
 * Reusable questions and answers. Each row picks the page it belongs to, and
 * the site publishes them with FAQ structured data so they can appear as rich
 * results in search.
 */
export const Faqs: CollectionConfig = {
  slug: "faqs",
  labels: { singular: "FAQ", plural: "FAQs" },
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "placement", "order"],
    group: "Content",
    description: "Questions and answers shown on the website.",
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: {
    afterChange: [revalidateDoc("", ["/", "/services", "/contact", "/training", "/production"])],
    afterDelete: [revalidateDocAfterDelete("", ["/", "/services", "/contact", "/training", "/production"])],
  },
  fields: [
    { name: "question", type: "text", required: true },
    { name: "answer", type: "textarea", required: true },
    {
      name: "placement",
      type: "select",
      required: true,
      defaultValue: "contact",
      index: true,
      options: [
        { label: "Contact page", value: "contact" },
        { label: "Services page", value: "services" },
        { label: "Training page", value: "training" },
        { label: "Production page", value: "production" },
      ],
      admin: { position: "sidebar" },
    },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
