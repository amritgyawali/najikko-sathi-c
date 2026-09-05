import type { CollectionConfig } from "payload";
import { isEditor } from "../access";
import { revalidateDoc, revalidateDocAfterDelete } from "../hooks/revalidate";
import { slugField } from "../fields";

/**
 * The groupings the services page is organised into. Kept separate from the
 * services themselves so a new grouping can be added without touching code.
 */
export const ServiceCategories: CollectionConfig = {
  slug: "service-categories",
  labels: { singular: "Service category", plural: "Service categories" },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "title", "order"],
    group: "Services",
    description: "The sections the services page is grouped into.",
  },
  access: { read: () => true, create: isEditor, update: isEditor, delete: isEditor },
  hooks: {
    afterChange: [revalidateDoc("/services", ["/", "/services"])],
    afterDelete: [revalidateDocAfterDelete("/services", ["/", "/services"])],
  },
  fields: [
    { name: "label", type: "text", required: true, admin: { description: 'Short name, e.g. "Production".' } },
    slugField("label"),
    { name: "title", type: "text", required: true, admin: { description: "Heading shown above this group." } },
    { name: "description", type: "textarea" },
    {
      name: "href",
      type: "text",
      admin: { description: 'Where "explore" links point, e.g. "/production".' },
    },
    {
      name: "icon",
      type: "select",
      defaultValue: "clapperboard",
      options: [
        { label: "Production (clapperboard)", value: "clapperboard" },
        { label: "Social media (megaphone)", value: "megaphone" },
        { label: "Training (graduation cap)", value: "graduationCap" },
        { label: "Research (magnifier)", value: "search" },
        { label: "Camera", value: "camera" },
        { label: "Newspaper", value: "newspaper" },
      ],
    },
    { name: "order", type: "number", defaultValue: 0, admin: { position: "sidebar" } },
  ],
};
