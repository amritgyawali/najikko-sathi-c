import type { CollectionConfig } from "payload";
import { isAdmin, isEditor, isEditorField } from "../access";

/**
 * Messages sent through the contact form. Anyone may create one; only staff can
 * read or triage them, so the dashboard doubles as the company's inbox.
 */
export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  labels: { singular: "Enquiry", plural: "Enquiries" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "service", "state", "createdAt"],
    group: "Enquiries",
    description: "Messages sent through the website contact form.",
  },
  access: {
    create: () => true,
    read: isEditor,
    update: isEditor,
    delete: isAdmin,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "phone", type: "text" },
    { name: "service", type: "text", admin: { description: "The service the visitor was looking at." } },
    { name: "message", type: "textarea", required: true },
    {
      name: "state",
      type: "select",
      defaultValue: "new",
      // Triage is staff-only; a visitor cannot post an enquiry as "closed".
      access: { create: isEditorField, update: isEditorField },
      options: [
        { label: "New", value: "new" },
        { label: "In progress", value: "in-progress" },
        { label: "Replied", value: "replied" },
        { label: "Closed", value: "closed" },
        { label: "Spam", value: "spam" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "assignedTo",
      type: "relationship",
      relationTo: "users",
      access: { create: isEditorField, update: isEditorField },
      admin: { position: "sidebar" },
    },
    {
      name: "notes",
      type: "textarea",
      access: { create: isEditorField, update: isEditorField },
      admin: { description: "Internal only. Never shown on the website." },
    },
    {
      name: "sourcePath",
      type: "text",
      admin: { readOnly: true, description: "The page the enquiry was sent from." },
    },
  ],
};
