import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Media } from "./cms/collections/Media";
import { Offers } from "./cms/collections/Offers";
import { PageViews } from "./cms/collections/PageViews";
import { Pages } from "./cms/collections/Pages";
import { Posts } from "./cms/collections/Posts";
import { Reviews } from "./cms/collections/Reviews";
import { Users } from "./cms/collections/Users";
import { Appearance } from "./cms/globals/Appearance";
import { Footer } from "./cms/globals/Footer";
import { Homepage } from "./cms/globals/Homepage";
import { Navigation } from "./cms/globals/Navigation";
import { SiteSettings } from "./cms/globals/SiteSettings";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Vercel's filesystem is read-only, so uploads must go to blob storage there.
// Locally the token is usually absent and Payload falls back to ./media.
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: {
      titleSuffix: "- Najikko Sathi Dashboard",
    },
    components: {
      // Traffic and content statistics, shown at the top of the dashboard.
      beforeDashboard: ["/cms/components/DashboardStats#DashboardStats"],
    },
  },
  collections: [Pages, Posts, Offers, Reviews, Media, Users, PageViews],
  globals: [Homepage, Navigation, Appearance, Footer, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
  }),
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  plugins: blobToken
    ? [vercelBlobStorage({ enabled: true, collections: { media: true }, token: blobToken })]
    : [],
});
