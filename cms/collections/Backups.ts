import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

/**
 * The daily copies of everything in the dashboard.
 *
 * One row is one snapshot: the whole of the content, as JSON, in the same
 * database as the content itself. A snapshot is taken automatically once a day
 * (cms/endpoints/backups.ts, run by the schedule in vercel.json), before every
 * restore, and whenever an administrator asks for one.
 *
 * Rows are never edited. A backup that could be altered is not a backup, so the
 * only things anyone can do here are read one, restore it, and delete it - and
 * only an administrator can do any of them, because a snapshot holds every
 * enquiry the site has ever received.
 */
export const Backups: CollectionConfig = {
  slug: "backups",
  labels: { singular: "Backup", plural: "Backups" },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "takenAt", "reason", "summary", "documents"],
    group: "Administration",
    description:
      "A copy of everything in the dashboard, taken once a day. Open one to put the site back to how it was.",
    components: {
      edit: {
        beforeDocumentControls: ["/cms/components/RestoreBackup#RestoreBackup"],
      },
      beforeList: ["/cms/components/BackupNowButton#BackupNowButton"],
    },
  },
  defaultSort: "-takenAt",
  access: {
    read: isAdmin,
    // Copies are written by the schedule and by the buttons, both of which go
    // through the endpoint. Closing the door here takes "Create New" off the
    // list as well: a backup typed in by hand describes a moment that never
    // happened, and restoring one would be a strange way to lose a site.
    create: () => false,
    // A backup is a record of a moment. Editing one would make it a fiction.
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
      admin: { readOnly: true, description: "Names the moment this copy was taken." },
    },
    {
      name: "takenAt",
      type: "date",
      required: true,
      index: true,
      admin: {
        readOnly: true,
        date: { pickerAppearance: "dayAndTime" },
        position: "sidebar",
      },
    },
    {
      name: "reason",
      type: "select",
      required: true,
      defaultValue: "daily",
      index: true,
      options: [
        { label: "Daily - taken by the schedule", value: "daily" },
        { label: "Asked for - taken by hand", value: "manual" },
        { label: "Before a restore - the safety net", value: "beforeRestore" },
      ],
      admin: { readOnly: true, position: "sidebar" },
    },
    {
      name: "summary",
      type: "text",
      admin: { readOnly: true, description: "What this copy holds." },
    },
    {
      name: "documents",
      type: "number",
      admin: { readOnly: true, position: "sidebar", description: "Documents in this copy." },
    },
    {
      name: "problems",
      type: "textarea",
      admin: {
        readOnly: true,
        description:
          "Anything that could not be read when this copy was taken. Empty means the copy is complete.",
      },
    },
    {
      name: "data",
      type: "json",
      required: true,
      admin: {
        // The whole site as one JSON object: megabytes of it, and nothing an
        // editor would read in a form field. The restore panel above offers it
        // as a download instead.
        hidden: true,
      },
    },
  ],
};
