import type { CollectionConfig } from "payload";
import { APIError } from "payload";
import { isAdmin, isAdminField } from "../access";
import { STATE_CELL, THUMB_CELL } from "../fields";

/**
 * Dashboard accounts. Authentication is handled by Payload; the `role` field
 * drives every access rule in the CMS.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "name",
    defaultColumns: ["avatar", "name", "email", "role", "approved"],
    group: "Administration",
    description:
      "People who can sign in to this dashboard. A new sign-up waits here until an administrator approves it.",
    listSearchableFields: ["name", "email"],
  },
  access: {
    // Anyone may register, but the role and approval fields below are locked to
    // administrators, so a new sign-up can only ever be an unapproved author.
    // The beforeLogin hook then keeps them out until someone approves them.
    create: () => true,
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
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== "create") return data;
        // Whoever registers first owns the site, so that account is made an
        // approved administrator. Everyone after them waits for approval.
        const existing = await req.payload.count({ collection: "users", overrideAccess: true });
        if (existing.totalDocs === 0) {
          return { ...data, role: "admin", approved: true };
        }
        return data;
      },
    ],
    beforeLogin: [
      ({ user }) => {
        if (!(user as { approved?: boolean }).approved) {
          throw new APIError(
            "This account is waiting for an administrator to approve it.",
            403,
            undefined,
            true,
          );
        }
      },
    ],
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
      admin: {
        description: "Determines what this person can see and change.",
        components: { Cell: STATE_CELL },
      },
    },
    {
      name: "approved",
      type: "checkbox",
      defaultValue: false,
      // Locked to administrators: a self-registered account cannot approve
      // itself, whatever it sends.
      access: { create: isAdminField, update: isAdminField },
      admin: {
        position: "sidebar",
        description: "Until this is ticked, the account cannot sign in.",
        components: { Cell: STATE_CELL },
      },
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
      label: "Photograph",
      admin: { components: { Cell: THUMB_CELL } },
    },
  ],
};
