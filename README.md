# Najikko Sathi Media Pvt. Ltd.

A responsive Next.js 16, React 19, and TypeScript website for Najikko Sathi Media in
Anamnagar, Kathmandu. The original homepage palette, typography, and visual language are
shared across all pages.

Content is managed through a full admin dashboard powered by
[Payload CMS 3](https://payloadcms.com), which runs inside this same app.

- Public site: `/`
- Admin dashboard: `/admin`

## What the dashboard controls

| Area | Where in the dashboard | Appears on |
| --- | --- | --- |
| Traffic, top pages, referrers, devices, enquiry queue | Dashboard home | - |
| The website's pages, in navbar order, and where each one is edited | Dashboard home → Website pages | - |
| The 16 services and their detail pages | Services → Services | `/services`, `/services/<slug>`, `/our-work`, and every discipline page |
| Service groupings | Services → Service categories | `/services` sections |
| News, blogs, commentary, investigations | Content → Posts | `/posts`, `/posts/<slug>` |
| Promotions and packages | Content → Offers | `/offers` |
| Client testimonials, with an approval queue | Content → Reviews | Review blocks |
| Social responsibility films and photo albums | Content → Social responsibility | `/our-work` |
| New website pages, built from layout blocks | Content → Pages | `/<slug>` |
| Questions and answers | Content → FAQs | Contact, services, training, production |
| The people on the about page | Content → Team | `/about` |
| Photos and files | Content → Media | Everywhere |
| The photo or video featured on each page | Content → Page media | Every page's showcase band |
| Contact form messages, with triage and notes | Enquiries | Sent from `/contact` |
| Front page copy and imagery | Site → Homepage & page copy → Home | `/` |
| Chairman and director messages | Site → Homepage & page copy → Home - leadership | `/` |
| Headings above the service grid, the production band, the Right Sanchar band | Site → Homepage & page copy | `/services`, `/production`, `/right-sanchar` |
| Company logo, shown in the header and the media system wheel | Site → Site Settings | Every page |
| Navbar links, order and header button | Site → Navigation | Every page |
| Site-wide notice, with a schedule | Site → Announcement bar | Every page |
| Website colours, corner radius, heading font | Site → Appearance | Every page |
| Footer columns and links | Site → Footer | Every page |
| Company name, address, phones, VAT, SEO | Site → Site Settings | Every page |
| Old URLs redirected to new ones | Administration → Redirects | Applied by `proxy.ts` |
| Dashboard accounts, roles and approving sign-ups | Administration → Users | - |

### The homepage

The front page is the media system wheel, the introduction, the leadership
messages, and the page's own photo and film. The wheel's six petals -
production, social media handling, training, research and development, IT, and
advertisement - each link to that discipline's page, and the company logo
uploaded in **Site → Site Settings** sits at its centre. Until a logo is
uploaded the centre falls back to the initials mark.

The service grid, the production band, and the Right Sanchar band used to sit
on the homepage as well. They now open `/services`, `/production`, and
`/right-sanchar` respectively, and still read their copy from
**Site → Homepage & page copy**, so nothing an editor had written was lost when
they moved. Every tab there is named after the page it appears on — *Home -
hero*, *Home - about*, *Home - leadership*, *Services page*, *Production page*,
*Right Sanchar page* — so the dashboard never claims to be editing the front
page when the words come out somewhere else.

The **Home - leadership** tab is empty to begin with, and the carousel appears
on the homepage as soon as the first message is saved there. Add one entry for
the chairman and one for the director: the carousel then moves on by itself
every five seconds, with arrows for stepping through it by hand.

### Website pages, on the dashboard home

Under the traffic overview, **Website pages** lists the menu exactly as a
visitor sees it — in order, with the pages that sit under **Our Work**, and with
the pages built in **Content → Pages** appended just as the header appends them.
Each row links to every dashboard area that writes that page's content.

Nothing here is a copy that someone has to keep up to date. The panel resolves
the menu on every load from the same two sources as the public header (the links
in **Site → Navigation** and pages published with *show in navigation* ticked),
through the same function, so reordering the menu or publishing a page shows up
on the next dashboard load. A menu link with no page behind it is called out in
red, which is how a typo in a link gets noticed before a visitor finds it.

Which dashboard areas edit which page comes from `lib/site-map.ts`, the one list
of the site's pages. `npm run check:pages` fails if a route exists with no entry
there, or an entry names a route that no longer exists, so a page cannot be
added to the site and quietly missed by the dashboard.

### Social responsibility

**Content → Social responsibility** drives the section of the same name on
`/our-work`. Each entry has a title, an optional summary, an optional YouTube
link, and an optional photo album. Paste an ordinary YouTube watch URL and the
film is embedded; upload photographs with captions and they become an album.
An entry can be both, or either one on its own. Entries are ordered by the
**Order** field and only appear once **Published**.

Because the site renders per request, a photograph added, replaced, or removed
in the dashboard is on the public page on the next load - there is nothing to
rebuild and no cache to clear.

Two more tools sit on the dashboard home: **Download backup**, which exports every
collection and global as one JSON file (administrators only), and the **search page**
at `/search`, which searches services, writing, offers, and pages.

### How changes reach the website

Public pages are rendered per request (`export const dynamic = "force-dynamic"`),
so anything saved in the dashboard is live on the next page load - no deploy, no
cache to clear. Payload hooks in `cms/hooks/revalidate.ts` additionally purge
Next's router cache on every save.

This trades a prerendered response for content that is never stale, which is the
right way round for a site whose whole point is being editable. If the site ever
outgrows it, the fix is to cache the CMS reads and revalidate them by tag rather
than to prerender the pages again.

### Scheduling

Posts and offers have **Publish at** and **Unpublish at**. Content outside its
window is hidden from the website and from the sitemap, without anyone having to
remember to unpublish it. The announcement bar has the same start and end dates.

### Signing up and signing in

The dashboard login is at `/admin`. Under the login form there is a **Create one**
link to `/signup`.

- The **first** account created on a fresh database becomes an approved
  administrator and can sign in straight away.
- Every account after that is created as an **unapproved author** and cannot sign
  in until an administrator ticks **Approved** on it in Administration → Users.

Role and approval are locked to administrators at the field level, so a sign-up
cannot make itself an admin - not through the sign-up form and not by posting
directly to the REST API.

If you would rather nobody could register at all, set `create` back to `isAdmin`
in `cms/collections/Users.ts` and remove the `afterLogin` component from
`payload.config.ts`.

### Roles

| Role | Can do |
| --- | --- |
| **Administrator** | Everything, including branding and user management |
| **Editor** | All content, plus navigation, footer, homepage and site settings |
| **Author** | Create posts, and edit only their own |

Access rules live in `cms/access.ts` and are enforced by Payload on every entry
point (admin panel, REST and GraphQL alike).

## Local setup

You need a Postgres database. [Neon](https://neon.tech), [Supabase](https://supabase.com)
and Vercel Postgres all have a free tier that comfortably fits this site.

```bash
npm ci
cp .env.example .env      # then fill in PAYLOAD_SECRET and DATABASE_URI
npm run migrate           # create the database schema
SEED_ADMIN_PASSWORD='choose-a-strong-password' npm run seed
npm run dev
```

`npm run seed` loads the site's existing copy into the CMS and creates the first
administrator, so the dashboard opens pre-filled rather than blank. Re-running
it overwrites seeded globals, services, categories, and FAQs with repository
content. Existing users are preserved. Run it once during initial setup; avoid
running it after editors have customized that content.

Automatic development schema changes are disabled. Run `npm run migrate` before
starting development against a newly created database.

Open <http://localhost:3000/admin> and sign in with the seeded account.

## Deploying to Vercel

Set these environment variables in the Vercel project:

| Variable | Notes |
| --- | --- |
| `PAYLOAD_SECRET` | Any long random string (`openssl rand -base64 32`) |
| `DATABASE_URI` | Supabase transaction pooler (port 6543), with the database password percent-encoded. Session pooling can exhaust connections on Vercel |
| `DATABASE_SSL_CA` | Supabase root certificate from Database Settings → SSL Configuration. PEM text or escaped `\n` newlines; verifies the server certificate |
| `DATABASE_MIGRATION_URI` | Optional direct/session connection when `DATABASE_URI` uses the transaction pooler |
| `CLOUDINARY_URL` | `cloudinary://<api_key>:<api_secret>@<cloud_name>`, used for dashboard uploads |
| `BLOB_READ_WRITE_TOKEN` | Optional alternative when `CLOUDINARY_URL` is empty |
| `NEXT_PUBLIC_SERVER_URL` | The production URL |

Supabase API keys are not database passwords and are not needed by this CMS.
Payload handles dashboard authentication and accesses Postgres on the server.
The security migration enables row level security and removes Supabase browser
API permissions on the 70 CMS tables, including users, sessions, and enquiries.
Future migrations that add tables must apply the same restrictions.

Cloudinary stores originals and the thumbnail, card, and hero versions generated
by Payload. PDFs use raw storage. The Cloudinary cloud allowed by Next Image is
configured in `next.config.ts`. Cloudinary may require enabling PDF delivery in
the account's security settings. Server uploads on Vercel must fit within its
4.5 MB request limit, including multipart form overhead.

Keep credentials in an ignored `.env` locally and encrypted production variables
on Vercel. Do not share the production database with untrusted preview builds.
Create the first administrator with the seed before making the connected admin
dashboard public.

Vercel Functions run in Sydney (`syd1`) beside this Supabase project's database
(`ap-southeast-2`). Each function uses at most five pooled client connections,
leaving room for Payload's reserved connection, transactions, and lock checks.

`npm run build` runs pending migrations first, so a deploy applies schema
changes automatically. After changing anything in `cms/`, generate a migration
and commit it:

```bash
npm run migrate:create my_change
npm run generate:types
```

## Troubleshooting

**`npm run migrate` (or `npm run build`) appears to hang.**
Running `npm run dev` pushes the schema directly and records a marker row named
`dev` in the `payload_migrations` table. `payload migrate` does not terminate
while that row is present. Production databases never have it, since `next dev`
is not run against them. If you share one database between `npm run dev` and
`npm run build` locally, clear the marker first:

```sql
DELETE FROM payload_migrations WHERE name = 'dev';
```

**`npm run check:pages` fails.**
The site and `lib/site-map.ts` disagree: a page was added or removed without
updating that list. The message names the paths. Fixing it is what keeps the
dashboard's **Website pages** panel describing the real website.

**`npm run check:site` fails on navigation assertions.**
It verifies the site against the default navigation, so run it with the CMS at its
seeded state. Editing Navigation in the dashboard, or publishing a page with
"show in navigation" enabled, changes the menu the script asserts against.

**A page takes several seconds and shows the old, built-in content.**
The CMS is unreachable, so the site fell back to `app/(frontend)/_data/site.ts`
(see below). Check `DATABASE_URI` and that the database is reachable; the server
log will contain `[cms] could not connect, serving fallback content`.

## Content safety net

The site reads its content from Payload but falls back to the copy checked into
`app/(frontend)/_data/site.ts` whenever the CMS is unreachable or not yet
configured — see `lib/content.ts`. This means the website keeps rendering
exactly as it does today if the database is down or before it has been set up,
rather than showing an error page.

## Analytics

Page views are recorded by `app/(frontend)/track/route.ts` into the `pageviews`
collection: path, referring host and a coarse device class only. No cookies and
nothing that identifies a visitor, so no consent banner is required. The
dashboard summary is `cms/components/DashboardStats.tsx`.

## Reviews from visitors

The `reviews` collection accepts public submissions (`POST /api/reviews`), but
`approved` and `featured` are locked to staff, so nothing reaches the website
until someone approves it in the dashboard.

## Pages

The navbar links five separate pages, in this order: `/`, `/services`, `/our-work`, `/contact`, and `/about`. `/our-work` gathers the areas that are not in the menu themselves - `/production`, `/social-media-handling`, `/training`, `/research`, `/it`, `/advertisement` and `/right-sanchar` keep their own pages, stay in the sitemap, and highlight **Our Work** in the header while a visitor is on them (see `navSections` in `lib/site-map.ts`, which `app/(frontend)/_data/site.ts` re-exports). The first six are the disciplines in the homepage wheel, and each petal links straight to its page. Each of the 16 services has a statically generated `/services/[slug]` page with its own scope, preparation guidance, workflow, FAQs, related services, and contact link.

The portfolio covers four production services, five social media services, five training programs, and two research and development services. The source is retained in `docs/Service_Portfolio_Overview.pdf`.

## Quality checks

```bash
npm run lint
npm run check:pages
npm run build
npx playwright install chromium
npm run check:site
```

`check:pages` needs no database, build or browser: it compares the routes on
disk with `lib/site-map.ts` and fails when the two have drifted apart.
`check:site` runs it first.

The browser installation is only needed once per machine. `check:site` starts a production server on port 3100, checks all 28 pages at desktop and mobile widths, checks internal destinations and anchors, renders all social preview images, and exercises navigation history, the mobile menu, FAQs, and inquiry validation. Screenshots go to ignored `tmp/site-check/`. Set `CHECK_BASE_URL` to test an already running preview. No email is sent during checks.

## Owner-managed photos and videos

Media sections start with clearly labeled placeholders. Add approved files to `public/media/` and configure the corresponding page in `app/_data/media.ts`. Follow [the media setup guide](docs/MEDIA-SETUP.md) for photo captions, accessible videos, and publication metadata.

There is no public upload feature. Initial media setup and any future changes require repository write access and a deployment. Videos are not represented as published work or included in video structured data until actual media is configured.

## Contact behaviour

The contact form posts to `/enquiry`, which stores the message in the Enquiries
collection so the team can triage it in the dashboard. A hidden field catches
bots. Nothing is emailed automatically, and nothing is shared with a third
party; the form says so on the page.

## SEO and publication

- Every page has a unique title, description, canonical URL, Open Graph metadata, Twitter card metadata, and generated social preview image.
- Structured data describes the organization, website, breadcrumbs, actual services, and configured videos. No reviews, ratings, clients, or results are invented.
- `/sitemap.xml` lists all 23 pages. `/robots.txt` allows public content to be crawled and identifies the sitemap.
- Main content is rendered in the initial HTML. Unknown service URLs return 404. Images use responsive sizing, and videos load only when needed.
- The canonical origin comes from `business.website` in `app/_data/site.ts`, currently `https://najikkosathi.com`. Update it before deployment if the production domain changes.

After deployment, verify the production domain serves the new pages, submit the sitemap in your own Google Search Console property, and monitor indexing and search performance. A Git push updates the repository; deployment depends on the hosting integration configured for this repository.

SEO improves crawlability and understanding; it does not guarantee indexing or a #1 ranking. Continue publishing useful original material and approved project media. See Google's [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

## Project structure

The public website lives in the `app/(frontend)/` route group; the dashboard and its
API live in `app/(payload)/`.

- `app/(frontend)/_components/` - Shared navigation, footer, page sections, structured data, and inquiry form
- `app/(frontend)/_data/site.ts` - Business identity, contact information, and footer links; the navigation comes from `lib/site-map.ts`
- `app/(frontend)/_data/services.ts` - Fallback copy of the 16 services, used only when the CMS is unreachable
- `app/(frontend)/_data/media.ts` - Fallback media slots, superseded by Content → Page media
- `app/(frontend)/_lib/seo.ts` - Canonical URLs, metadata, and organization data
- `app/(frontend)/pages.css` - Interior page design and responsive styles
- `app/(frontend)/services/[slug]/page.tsx` - Generated service detail pages
- `app/(payload)/` - The admin dashboard and Payload REST/GraphQL routes
- `cms/` - Collections, globals, blocks, and access control
- `lib/site-map.ts` - The one list of the site's pages: menu order, sub-pages, and where each is edited
- `lib/content.ts` - CMS reads, with the static fallback
- `lib/services.ts` - One shape for a service, whether it came from the CMS or the fallback
- `proxy.ts` - Applies the redirects managed in the dashboard
- `migrations/` - Database migrations (commit these)
- `payload.config.ts` - CMS configuration
- `scripts/check-pages.ts` - Fails when the routes and `lib/site-map.ts` disagree
- `scripts/check-site.mjs` - Production route and browser verification
- `Najik.docx` - Original business source document

## Image credit

Hero photograph: [Lipot Repaszky on Pexels](https://www.pexels.com/photo/himalayas-at-dawn-23022578/), used under the [Pexels license](https://www.pexels.com/license/). This landscape is illustrative and is not presented as company project photography.
