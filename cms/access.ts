import type { Access, FieldAccess } from "payload";

export type Role = "admin" | "editor" | "author";

type MaybeUser = { role?: Role; id?: string | number } | null | undefined;

const roleOf = (user: MaybeUser): Role | undefined => user?.role;

/** Anyone who is logged in, regardless of role. */
export const isLoggedIn: Access = ({ req }) => Boolean(req.user);

/** Only full administrators. Used for Users, Appearance, and destructive actions. */
export const isAdmin: Access = ({ req }) => roleOf(req.user as MaybeUser) === "admin";

export const isAdminField: FieldAccess = ({ req }) => roleOf(req.user as MaybeUser) === "admin";

/** Administrators and editors: the people who manage site-wide content. */
export const isEditor: Access = ({ req }) => {
  const role = roleOf(req.user as MaybeUser);
  return role === "admin" || role === "editor";
};

export const isEditorField: FieldAccess = ({ req }) => {
  const role = roleOf(req.user as MaybeUser);
  return role === "admin" || role === "editor";
};

/**
 * Editors manage everything; authors may only touch rows they created.
 * Returning a `where` clause lets Payload filter list views as well as
 * enforce the rule on individual documents.
 */
export const isEditorOrOwner: Access = ({ req }) => {
  const user = req.user as MaybeUser;
  const role = roleOf(user);
  if (role === "admin" || role === "editor") return true;
  if (role === "author" && user?.id) return { author: { equals: user.id } };
  return false;
};

/**
 * Published content is public. Anything still in draft is visible only to
 * signed-in staff, so previews never leak to visitors.
 */
export const isPublishedOrStaff: Access = ({ req }) => {
  if (req.user) return true;
  return { status: { equals: "published" } };
};
