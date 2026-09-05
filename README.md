# Najikko Sathi Media Pvt. Ltd.

A responsive Next.js 16, React 19, and TypeScript website for Najikko Sathi Media in Anamnagar, Kathmandu. The original homepage palette, typography, and visual language are shared across all pages.

## Development

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

All navbar items navigate to separate pages: `/`, `/about`, `/services`, `/production`, `/training`, `/right-sanchar`, and `/contact`. Each of the 16 services has a statically generated `/services/[slug]` page with its own scope, preparation guidance, workflow, FAQs, related services, and contact link.

The portfolio covers four production services, five social media services, five training programs, and two research and development services. The source is retained in `docs/Service_Portfolio_Overview.pdf`.

## Quality checks

```bash
npm run lint
npm run build
npx playwright install chromium
npm run check:site
```

The browser installation is only needed once per machine. `check:site` starts a production server on port 3100, checks all 23 pages at desktop and mobile widths, checks internal destinations and anchors, renders all social preview images, and exercises navigation history, the mobile menu, FAQs, and inquiry validation. Screenshots go to ignored `tmp/site-check/`. Set `CHECK_BASE_URL` to test an already running preview. No email is sent during checks.

## Owner-managed photos and videos

Media sections start with clearly labeled placeholders. Add approved files to `public/media/` and configure the corresponding page in `app/_data/media.ts`. Follow [the media setup guide](docs/MEDIA-SETUP.md) for photo captions, accessible videos, and publication metadata.

There is no public upload feature. Initial media setup and any future changes require repository write access and a deployment. Videos are not represented as published work or included in video structured data until actual media is configured.

## Contact behavior

The inquiry form opens an email draft in the visitor's configured email application. It does not send email itself or store submitted data. Service links preselect the relevant topic. Direct phone and email links remain available.

## SEO and publication

- Every page has a unique title, description, canonical URL, Open Graph metadata, Twitter card metadata, and generated social preview image.
- Structured data describes the organization, website, breadcrumbs, actual services, and configured videos. No reviews, ratings, clients, or results are invented.
- `/sitemap.xml` lists all 23 pages. `/robots.txt` allows public content to be crawled and identifies the sitemap.
- Main content is rendered in the initial HTML. Unknown service URLs return 404. Images use responsive sizing, and videos load only when needed.
- The canonical origin comes from `business.website` in `app/_data/site.ts`, currently `https://najikkosathi.com`. Update it before deployment if the production domain changes.

After deployment, verify the production domain serves the new pages, submit the sitemap in your own Google Search Console property, and monitor indexing and search performance. A Git push updates the repository; deployment depends on the hosting integration configured for this repository.

SEO improves crawlability and understanding; it does not guarantee indexing or a #1 ranking. Continue publishing useful original material and approved project media. See Google's [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

## Project structure

- `app/_components/` - Shared navigation, footer, page sections, structured data, and inquiry form
- `app/_data/site.ts` - Business identity, contact information, navigation, and footer links
- `app/_data/services.ts` - The 16 service definitions and detail content
- `app/_data/media.ts` - Owner-managed photo and video slots
- `app/_lib/seo.ts` - Canonical URLs, metadata, and organization data
- `app/pages.css` - Interior page design and responsive styles
- `app/services/[slug]/page.tsx` - Generated service detail pages
- `scripts/check-site.mjs` - Production route and browser verification
- `Najik.docx` - Original business source document

## Image credit

Hero photograph: [Lipot Repaszky on Pexels](https://www.pexels.com/photo/himalayas-at-dawn-23022578/), used under the [Pexels license](https://www.pexels.com/license/). This landscape is illustrative and is not presented as company project photography.
