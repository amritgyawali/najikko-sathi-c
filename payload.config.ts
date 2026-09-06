import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig, type CollectionConfig, type Field, type GlobalConfig } from "payload";
import sharp from "sharp";

import { Enquiries } from "./cms/collections/Enquiries";
import { Faqs } from "./cms/collections/Faqs";
import { Media } from "./cms/collections/Media";
import { MediaSlots } from "./cms/collections/MediaSlots";
import { Offers } from "./cms/collections/Offers";
import { PageViews } from "./cms/collections/PageViews";
import { Pages } from "./cms/collections/Pages";
import { Posts } from "./cms/collections/Posts";
import { Redirects } from "./cms/collections/Redirects";
import { Reviews } from "./cms/collections/Reviews";
import { ServiceCategories } from "./cms/collections/ServiceCategories";
import { Services } from "./cms/collections/Services";
import { SocialResponsibility } from "./cms/collections/SocialResponsibility";
import { TeamMembers } from "./cms/collections/TeamMembers";
import { Users } from "./cms/collections/Users";
import { Announcement } from "./cms/globals/Announcement";
import { Appearance } from "./cms/globals/Appearance";
import { Footer } from "./cms/globals/Footer";
import { Homepage } from "./cms/globals/Homepage";
import { Navigation } from "./cms/globals/Navigation";
import { SiteSettings } from "./cms/globals/SiteSettings";
import { sitePagesEndpoint } from "./cms/endpoints/site-pages";
import { cloudinaryStorage } from "./cms/storage/cloudinary";
import { databasePoolConfig } from "./cms/database";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Cloudinary is preferred when configured. Vercel Blob remains supported.
const cloudinaryURL = process.env.CLOUDINARY_URL;
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

/**
 * Puts the "on the website" address everywhere content is managed: at the top
 * of every document and global, and as a Link column on every list table -
 * rather than repeating the same block in twenty config files. Both components
 * work the address out themselves from the document or the row.
 *
 * Collections and globals hang the slot off different keys, so there are two
 * wrappers rather than one.
 */
const LIVE_LINK = "/cms/components/LiveLink#LiveLink";
const LIVE_LINK_CELL = "/cms/components/LiveLinkCell#LiveLinkCell";

/** A column of live addresses. Holds no data, so it needs no migration. */
const liveLinkColumn: Field = {
  name: "liveLink",
  type: "ui",
  label: "Link",
  admin: { components: { Cell: LIVE_LINK_CELL } },
};

const withLiveLink = (config: CollectionConfig): CollectionConfig => ({
  ...config,
  admin: {
    ...config.admin,
    // A collection that names its columns would otherwise hide the new one.
    ...(config.admin?.defaultColumns
      ? { defaultColumns: [...config.admin.defaultColumns, liveLinkColumn.name!] }
      : {}),
    components: {
      ...config.admin?.components,
      edit: {
        ...config.admin?.components?.edit,
        beforeDocumentControls: [
          ...(config.admin?.components?.edit?.beforeDocumentControls ?? []),
          LIVE_LINK,
        ],
      },
    },
  },
  fields: [...config.fields, liveLinkColumn],
});

const withGlobalLiveLink = (config: GlobalConfig): GlobalConfig => ({
  ...config,
  admin: {
    ...config.admin,
    components: {
      ...config.admin?.components,
      elements: {
        ...config.admin?.components?.elements,
        beforeDocumentControls: [
          ...(config.admin?.components?.elements?.beforeDocumentControls ?? []),
          LIVE_LINK,
        ],
      },
    },
  },
});

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: {
      titleSuffix: "- Najikko Sathi Dashboard",
    },
    // Initials drawn locally. The default sends an MD5 of the signed-in
    // administrator's email to gravatar.com on every dashboard page load, and
    // renders a broken image whenever that request is blocked.
    avatar: "default",
    components: {
      // Traffic and content statistics, then the live list of the site's
      // pages and where each one is edited, at the top of the dashboard.
      beforeDashboard: [
        "/cms/components/DashboardStats#DashboardStats",
        "/cms/components/SitePages#SitePages",
      ],
      // A way to register, shown under the login form.
      afterLogin: ["/cms/components/LoginSignupLink#LoginSignupLink"],
      // Back to the overview, and out to the public site, above the menu.
      beforeNavLinks: ["/cms/components/NavDashboardLink#NavDashboardLink"],
      // Light / dark switch, in the header beside the account menu.
      actions: ["/cms/components/ThemeToggle#ThemeToggle"],
    },
  },
  collections: [
    Pages,
    Posts,
    Services,
    ServiceCategories,
    Offers,
    Reviews,
    Faqs,
    SocialResponsibility,
    TeamMembers,
    Enquiries,
    Media,
    MediaSlots,
    Redirects,
    Users,
    PageViews,
  ].map(withLiveLink),
  globals: [Homepage, Navigation, Announcement, Appearance, Footer, SiteSettings].map(withGlobalLiveLink),
  // The dashboard's "add the website's pages" button posts here.
  endpoints: [sitePagesEndpoint],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: databasePoolConfig(),
    // Use checked-in migrations even during local development, since a local
    // server may be connected to the same hosted database as production.
    push: false,
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  plugins: cloudinaryURL
    ? [cloudinaryStorage(cloudinaryURL)]
    : blobToken
      ? [vercelBlobStorage({ enabled: true, collections: { media: true }, token: blobToken })]
      : [],
});
