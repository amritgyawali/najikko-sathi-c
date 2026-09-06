import type { CollectionConfig } from "payload";
import { isAdmin, isEditor, isEditorField } from "../access";
import { STATE_CELL } from "../fields";

/**
 * Messages sent through the contact form. Anyone may create one; only staff can
 * read or triage them, so the dashboard doubles as the company's inbox.
 */
export const Enquiries: CollectionConfig = {
  slug: "enquiries",
  labels: { singular: "Enquiry", plural: "Enquiries" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "service", "state", "createdAt"],
    group: "Enquiries",
    description:
      "Messages sent through the website contact form. Private: nothing here is ever published.",
    listSearchableFields: ["name", "email", "message"],
  },
  access: {
    create: () => true,
    read: isEditor,
    update: isEditor,
    delete: isAdmin,
  },
  fields: [
    {
      type: "row",
      fields: [
        { name: "name", type: "text", required: true, admin: { width: "34%" } },
        { name: "email", type: "email", required: true, admin: { width: "38%" } },
        { name: "phone", type: "text", admin: { width: "28%" } },
      ],
    },
    {
      name: "service",
      type: "text",
      admin: { description: "The service the visitor was looking at when they wrote in." },
    },
    {
      name: "message",
      type: "textarea",
      required: true,
      label: "Their message",
      admin: { rows: 8 },
    },
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
      admin: {
        position: "sidebar",
        description: "Where this message has got to.",
        components: { Cell: STATE_CELL },
      },
    },
    {
      name: "assignedTo",
      type: "relationship",
      relationTo: "users",
      label: "Being handled by",
      access: { create: isEditorField, update: isEditorField },
      admin: { position: "sidebar", description: "Whoever is answering this one." },
    },
    {
      name: "notes",
      type: "textarea",
      label: "Internal notes",
      access: { create: isEditorField, update: isEditorField },
      admin: {
        rows: 4,
        description: "For the team only. Never shown on the website and never sent to the sender.",
      },
    },
    {
      name: "sourcePath",
      type: "text",
      admin: { readOnly: true, description: "The page the enquiry was sent from." },
    },
  ],
};
