import type { CollectionConfig } from "payload";
import { isAdmin, isAdminField } from "../access";

/**
 * Dashboard accounts. Authentication is handled by Payload; the `role` field
 * drives every access rule in the CMS.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "role", "updatedAt"],
    group: "Administration",
    description: "People who can sign in to this dashboard.",
  },
  access: {
    // Only admins manage the roster. Everyone may read/update their own row,
    // which is what powers the account page in the admin panel.
    create: isAdmin,
    delete: isAdmin,
    read: ({ req }) => {
      const user = req.user as { role?: string; id?: string | number } | null;
      if (!user) return false;
      if (user.role === "admin") return true;
      return { id: { equals: user.id } };
    },
    update: ({ req }) => {
      const user = req.user as { role?: string; id?: string | number } | null;
      if (!user) return false;
      if (user.role === "admin") return true;
      return { id: { equals: user.id } };
    },
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "author",
      // A non-admin must never be able to promote themselves.
      access: { create: isAdminField, update: isAdminField },
      options: [
        { label: "Administrator - full control of the site and dashboard", value: "admin" },
        { label: "Editor - manages all content, but not users or branding", value: "editor" },
        { label: "Author - writes and edits only their own posts", value: "author" },
      ],
      admin: { description: "Determines what this person can see and change." },
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
    },
  ],
};
