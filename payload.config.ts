import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig, type CollectionConfig, type Field, type GlobalConfig } from "payload";
import sharp from "sharp";

import { Backups } from "./cms/collections/Backups";
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
import { SocialWork } from "./cms/collections/SocialWork";
import { TeamMembers } from "./cms/collections/TeamMembers";
import { Users } from "./cms/collections/Users";
import { WellWishers } from "./cms/collections/WellWishers";
import { Announcement } from "./cms/globals/Announcement";
import { Appearance } from "./cms/globals/Appearance";
import { Footer } from "./cms/globals/Footer";
import { Homepage } from "./cms/globals/Homepage";
import { Navigation } from "./cms/globals/Navigation";
import { SiteSettings } from "./cms/globals/SiteSettings";
import { sitePagesEndpoint } from "./cms/endpoints/site-pages";
import { backupEndpoints } from "./cms/endpoints/backups";
import { siteToolEndpoints } from "./cms/endpoints/site-tools";
import { dashboardSearchEndpoint } from "./cms/search/endpoint";
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

/**
 * Collections whose documents never have a page of their own. A column of
 * em-dashes tells an editor nothing, so these keep the plain table they had
 * before the address column existed. Backups are here for a second reason: the
 * slot the address would occupy is the one the restore panel uses.
 */
const PRIVATE_COLLECTIONS = new Set(["enquiries", "users", "pageviews", "reviews", "backups"]);

const withLiveLink = (config: CollectionConfig): CollectionConfig => (PRIVATE_COLLECTIONS.has(config.slug) ? config : {
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

/**
 * Edit, publish, unpublish and delete on every row, next to the tick box.
 *
 * The column is declared first so it lands immediately after the selection
 * checkbox, which is where a row's own controls belong: the eye reaches them
 * before it has read the row, and they stay in the same place on every screen.
 *
 * Holds no data, so like the address column it needs no migration. The traffic
 * log is left out - its rows are records of what happened, not things to edit.
 */
const ROW_ACTIONS_CELL = "/cms/components/RowActionsCell#RowActionsCell";

const rowActionsColumn: Field = {
  name: "rowActions",
  type: "ui",
  label: "Actions",
  admin: { components: { Cell: ROW_ACTIONS_CELL } },
};

const NO_ROW_ACTIONS = new Set(["pageviews"]);

const withRowActions = (config: CollectionConfig): CollectionConfig => (NO_ROW_ACTIONS.has(config.slug) ? config : {
  ...config,
  admin: {
    ...config.admin,
    // A collection that names its columns would otherwise hide the new one.
    ...(config.admin?.defaultColumns
      ? { defaultColumns: [rowActionsColumn.name!, ...config.admin.defaultColumns] }
      : {}),
  },
  fields: [...config.fields, rowActionsColumn],
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
      // The whole dashboard home: traffic and what is waiting, every page with
      // one link per thing that can be changed on it, every place a picture
      // goes, what a search engine makes of the site, whether it is set up
      // properly, and the jobs that are not editing anything.
      beforeDashboard: ["/cms/components/dashboard/DashboardHome#DashboardHome"],
      // A way to register, shown under the login form.
      afterLogin: ["/cms/components/LoginSignupLink#LoginSignupLink"],
      // Back to the overview, and out to the public site, above the menu.
      beforeNavLinks: ["/cms/components/NavDashboardLink#NavDashboardLink"],
      // In the header, on every screen: the search box that reaches everything
      // by name, and the light / dark switch.
      actions: [
        "/cms/components/dashboard/CommandPalette#CommandPalette",
        "/cms/components/ThemeToggle#ThemeToggle",
      ],
      // Above every screen: the box that looks for a word inside the content
      // itself, rather than for a document by its name.
      header: ["/cms/components/GlobalSearch#GlobalSearch"],
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
    SocialWork,
    TeamMembers,
    WellWishers,
    Enquiries,
    Media,
    MediaSlots,
    Redirects,
    Users,
    PageViews,
    Backups,
  ].map(withLiveLink).map(withRowActions),
  globals: [Homepage, Navigation, Announcement, Appearance, Footer, SiteSettings].map(withGlobalLiveLink),
  // The dashboard's "add the website's pages" button posts here, and so do the
  // daily backup schedule, the restore button, and the dashboard's own toolbox:
  // one search across every collection, "rebuild the website", and the exports.
  endpoints: [sitePagesEndpoint, ...backupEndpoints, ...siteToolEndpoints, dashboardSearchEndpoint],
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
