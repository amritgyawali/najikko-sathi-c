import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
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
import { cloudinaryStorage } from "./cms/storage/cloudinary";
import { databasePoolConfig } from "./cms/database";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Cloudinary is preferred when configured. Vercel Blob remains supported.
const cloudinaryURL = process.env.CLOUDINARY_URL;
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

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
      // Traffic and content statistics, shown at the top of the dashboard.
      beforeDashboard: ["/cms/components/DashboardStats#DashboardStats"],
      // A way to register, shown under the login form.
      afterLogin: ["/cms/components/LoginSignupLink#LoginSignupLink"],
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
  ],
  globals: [Homepage, Navigation, Announcement, Appearance, Footer, SiteSettings],
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
