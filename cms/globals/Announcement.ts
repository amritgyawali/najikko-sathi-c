import type { GlobalConfig } from "payload";
import { isEditor } from "../access";
import { revalidateSite } from "../hooks/revalidate";

/**
 * A site-wide notice strip above the header - used for a campaign, a notice, or
 * an event. It can be scheduled, so it appears and disappears on its own.
 */
export const Announcement: GlobalConfig = {
  slug: "announcement",
  label: "Announcement bar",
  admin: { group: "Site", description: "A notice shown at the top of every page." },
  access: { read: () => true, update: isEditor },
  hooks: { afterChange: [revalidateSite] },
  fields: [
    { name: "enabled", type: "checkbox", defaultValue: false },
    { name: "message", type: "text" },
    {
      type: "row",
      fields: [
        { name: "linkLabel", type: "text", admin: { width: "50%" } },
        { name: "linkHref", type: "text", admin: { width: "50%" } },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "startsAt",
          type: "date",
          admin: { width: "50%", description: "Leave blank to show immediately." },
        },
        {
          name: "endsAt",
          type: "date",
          admin: { width: "50%", description: "Leave blank to show until switched off." },
        },
      ],
    },
    {
      name: "tone",
      type: "select",
      defaultValue: "info",
      options: [
        { label: "Information", value: "info" },
        { label: "Highlight", value: "highlight" },
        { label: "Urgent", value: "urgent" },
      ],
    },
  ],
};
