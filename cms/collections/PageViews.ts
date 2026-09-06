import type { CollectionConfig } from "payload";
import { isAdmin, isEditor } from "../access";

/**
 * Self-hosted, cookie-free traffic log. One row per page view, written by
 * /api/track. It stores no personal data - only the path, the referring host
 * and a coarse device class - which keeps the stats useful without needing a
 * third-party analytics service or a cookie banner.
 */
export const PageViews: CollectionConfig = {
  slug: "pageviews",
  admin: {
    useAsTitle: "path",
    defaultColumns: ["path", "referrer", "device", "createdAt"],
    group: "Analytics",
    description:
      "The raw traffic log behind the dashboard overview. No cookies, no personal data, no third party.",
  },
  access: {
    read: isEditor,
    // Written only by the tracking endpoint, which uses Payload's local API and
    // therefore bypasses this rule via `overrideAccess`.
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  fields: [
    { name: "path", type: "text", required: true, index: true },
    { name: "referrer", type: "text" },
    {
      name: "device",
      type: "select",
      options: [
        { label: "Desktop", value: "desktop" },
        { label: "Mobile", value: "mobile" },
        { label: "Tablet", value: "tablet" },
      ],
    },
  ],
};
