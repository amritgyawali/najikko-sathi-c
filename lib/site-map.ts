/**
 * The website's page structure, in one place.
 *
 * Every route under app/(frontend) is listed here once, with its name, the menu
 * it belongs to and the dashboard areas that write into it. Four things read
 * this list, so they can never drift apart:
 *
 * 1. The navbar's built-in fallback and the "pages underneath a menu item"
 *    grouping - app/(frontend)/_data/site.ts.
 * 2. The "Website pages" panel on the dashboard home, which lists every page
 *    with what can be done to it - cms/components/SitePages.tsx.
 * 3. cms/site-pages.ts, which turns each of these into a document an editor can
 *    change, holding the copy in lib/page-defaults.ts.
 * 4. `npm run check:pages`, which fails when a route exists with no entry here,
 *    an entry points at a route that no longer exists, or a page has no copy to
 *    ship with.
 *
 * Adding a page to the site therefore means adding it here and writing its
 * sections in lib/page-defaults.ts; the dashboard offers it on the next load
 * with nothing else to update.
 */

/** A link into the dashboard, and what it controls on the page. */
export type AdminLink = { label: string; href: string; note?: string };

export type SitePage = {
  /** The public path, e.g. "/our-work". */
  path: string;
  /** How the page is named in the menu and in the dashboard. */
  label: string;
  /** One line on what the page is for. */
  summary: string;
  /** Position in the navbar, left to right. Absent means "not in the menu". */
  navOrder?: number;
  /**
   * The menu item this page sits under without having a link of its own. The
   * header highlights that item while a visitor is here, and the sitemap still
   * lists the page.
   */
  parent?: string;
  /**
   * The Page media entry that holds this page's photo or film, when it has
   * one. cms/live-urls.ts resolves the same key back to this path, and
   * check:pages fails if the two ever disagree.
   */
  mediaKey?: string;
  /** Where in the dashboard this page's content is written. */
  edit: AdminLink[];
  /**
   * A route generated from CMS content rather than a fixed page, such as
   * /services/[slug]. Excluded from the menu and from the drift check's
   * one-directory-one-entry rule.
   */
  dynamic?: boolean;
};

const globalLink = (slug: string, label: string, note?: string): AdminLink => ({
  label,
  href: `/admin/globals/${slug}`,
  note,
});

const collectionLink = (slug: string, label: string, note?: string): AdminLink => ({
  label,
  href: `/admin/collections/${slug}`,
  note,
});

/** The photo or film in the showcase band, keyed by the page it belongs to. */
const pageMedia = (key: string): AdminLink =>
  collectionLink("media-slots", "Page media", `the "${key}" entry`);



/**
 * Every page on the website. Menu order is `navOrder`; everything else either
 * sits under a menu item (`parent`) or is reached from a link on the site.
 */
export const sitePages: SitePage[] = [
  {
    path: "/",
    label: "Home",
    summary: "The hero, the media system wheel, the introduction and the leadership messages.",
    navOrder: 1,
    mediaKey: "home",
    edit: [
      globalLink("homepage", "Homepage", "the Home tab"),
      globalLink("site-settings", "Site settings", "logo and company details"),
      collectionLink("reviews", "Reviews", "the testimonials band"),
      collectionLink("well-wishers", "Well-wishers", "the well-wishers band"),
      pageMedia("home"),
      pageMedia("home-about"),
    ],
  },
  {
    path: "/services",
    label: "Services",
    summary: "The full service portfolio, grouped by category.",
    navOrder: 2,
    edit: [
      collectionLink("services", "Services"),
      collectionLink("service-categories", "Service categories"),
      globalLink("homepage", "Homepage", "the Services page tab"),
    ],
  },
  {
    path: "/our-work",
    label: "Our Work",
    summary: "What the company does, discipline by discipline, and its social responsibility work.",
    navOrder: 3,
    mediaKey: "our-work",
    edit: [
      collectionLink("services", "Services"),
      collectionLink("social-responsibility", "Social responsibility"),
      collectionLink("faqs", "FAQs", "questions published to this page"),
      pageMedia("our-work"),
    ],
  },
  {
    path: "/contact",
    label: "Contact",
    summary: "Contact details, the enquiry form, and the questions people ask before writing in.",
    navOrder: 4,
    edit: [
      globalLink("site-settings", "Site settings", "address, phones, email"),
      collectionLink("faqs", "FAQs", "questions published to this page"),
      collectionLink("enquiries", "Enquiries", "messages sent from this form"),
    ],
  },
  {
    path: "/about",
    label: "About Us",
    summary: "Who the company is, what it stands for, and the people behind it.",
    navOrder: 5,
    mediaKey: "about",
    edit: [
      collectionLink("team", "Team"),
      globalLink("site-settings", "Site settings", "company name and address"),
      pageMedia("about"),
    ],
  },

  // The disciplines. Each has its own page and its own place in the sitemap,
  // but is reached through Our Work rather than through a menu link.
  {
    path: "/production",
    label: "Production",
    summary: "Biography videos, documentaries, advertisements and corporate films.",
    parent: "/our-work",
    mediaKey: "production",
    edit: [
      globalLink("homepage", "Homepage", "the Production page tab"),
      collectionLink("services", "Services", "the production category"),
      collectionLink("faqs", "FAQs", "questions published to this page"),
      pageMedia("production"),
      pageMedia("production-band"),
    ],
  },
  {
    path: "/social-media-handling",
    label: "Social Media Handling",
    summary: "Running and growing social channels for clients.",
    parent: "/our-work",
    mediaKey: "social-media-handling",
    edit: [
      collectionLink("services", "Services", "the social media category"),
      pageMedia("social-media-handling"),
    ],
  },
  {
    path: "/training",
    label: "Training",
    summary: "Media and skill development courses.",
    parent: "/our-work",
    mediaKey: "training",
    edit: [
      collectionLink("services", "Services", "the training category"),
      collectionLink("faqs", "FAQs", "questions published to this page"),
      pageMedia("training"),
    ],
  },
  {
    path: "/research",
    label: "Research & Development",
    summary: "Research, surveys and content development work.",
    parent: "/our-work",
    mediaKey: "research",
    edit: [collectionLink("services", "Services"), pageMedia("research")],
  },
  {
    path: "/it",
    label: "IT",
    summary: "Websites, systems and technical support.",
    parent: "/our-work",
    mediaKey: "it",
    edit: [collectionLink("services", "Services"), pageMedia("it")],
  },
  {
    path: "/advertisement",
    label: "Advertisement",
    summary: "Campaign planning, commercials and placement.",
    parent: "/our-work",
    mediaKey: "advertisement",
    edit: [collectionLink("services", "Services"), pageMedia("advertisement")],
  },
  {
    path: "/right-sanchar",
    label: "Right Sanchar",
    summary: "The news arm: accurate, truthful and unbiased reporting.",
    parent: "/our-work",
    mediaKey: "right-sanchar",
    edit: [
      globalLink("homepage", "Homepage", "the Right Sanchar page tab"),
      globalLink("site-settings", "Site settings", "the Right Sanchar address"),
      pageMedia("right-sanchar"),
    ],
  },

  // The two indexes that appear once there is something to list. They have no
  // menu link of their own, so the header highlights the item they sit under
  // rather than leaving nothing marked while a visitor reads a post.
  {
    path: "/posts",
    label: "Writing",
    summary: "News, blogs, commentary and investigations. Listed once something is published.",
    parent: "/our-work",
    edit: [collectionLink("posts", "Posts")],
  },
  {
    path: "/offers",
    label: "Offers",
    summary: "Promotions and packages. Listed once something is published and in date.",
    parent: "/services",
    edit: [collectionLink("offers", "Offers")],
  },

  // Reached from links on the site rather than from the menu.
  {
    path: "/search",
    label: "Search",
    summary: "Searches services, writing, offers and pages. Deliberately not indexed.",
    edit: [],
  },
  {
    path: "/signup",
    label: "Dashboard sign-up",
    summary: "Requests an account. An administrator approves it before it can sign in.",
    edit: [collectionLink("users", "Users", "approve new accounts here")],
  },

  // Generated from CMS content.
  {
    path: "/services/[slug]",
    label: "Service detail",
    summary: "One page per service, generated from the service itself.",
    dynamic: true,
    edit: [collectionLink("services", "Services")],
  },
  {
    path: "/posts/[slug]",
    label: "Post detail",
    summary: "One page per post.",
    dynamic: true,
    edit: [collectionLink("posts", "Posts")],
  },
  {
    path: "/[slug]",
    label: "Pages built in the dashboard",
    summary: "Anything created in Content → Website pages goes live at its own address.",
    dynamic: true,
    edit: [collectionLink("pages", "Pages")],
  },
];

/**
 * The picture and film placeholders on the website, in page order.
 *
 * Every blue placeholder a visitor can see has an entry here, and every entry
 * is one row in Content → Page media. Uploading a photograph or a film into
 * that row replaces the placeholder on the page named below.
 *
 * Two shapes of placeholder exist:
 *
 * - `showcase` - the "in pictures & film" band near the foot of a page, which
 *   holds one photograph and one film side by side.
 * - `panel` - a single decorative blue panel drawn from icons, which a
 *   photograph replaces outright.
 *
 * Service detail pages carry a showcase band too. Those are not listed here
 * because services are written in the dashboard: their placeholder key is the
 * service's own slug, and a row is created with the service.
 */
export type MediaPlaceholderKind = "showcase" | "panel";

export type MediaPlaceholder = {
  /** The Page media key that fills it. */
  key: string;
  /** How the placeholder is named in the dashboard. */
  label: string;
  /** The page it appears on. */
  path: string;
  kind: MediaPlaceholderKind;
  /** Where on the page it is, in one line. */
  note: string;
};

/** The decorative panels, each of which sits on a page listed above. */
const panelPlaceholders: MediaPlaceholder[] = [
  {
    key: "home-about",
    label: "Who we are panel",
    path: "/",
    kind: "panel",
    note: "The blue camera panel beside the introduction. A photograph replaces the artwork.",
  },
  {
    key: "production-band",
    label: "Production craft panel",
    path: "/production",
    kind: "panel",
    note: "The blue panel beside “Stories brought to life”. A photograph replaces the artwork.",
  },
];

/**
 * Every placeholder, with each page's showcase band followed by any panels on
 * that page. A panel whose page is not in `sitePages` is dropped, and
 * `check:pages` fails so it cannot go unnoticed.
 */
export const mediaPlaceholders: MediaPlaceholder[] = sitePages.flatMap((page) => [
  ...(page.mediaKey
    ? [
        {
          key: page.mediaKey,
          label: `${page.label} photo & film`,
          path: page.path,
          kind: "showcase" as const,
          note: "The photograph and film in the “in pictures & film” band.",
        },
      ]
    : []),
  ...panelPlaceholders.filter((panel) => panel.path === page.path),
]);

/** Every page that has a Page media entry, as its key → the page's path. */
export const mediaKeyToPath: Record<string, string> = Object.fromEntries(
  mediaPlaceholders.map((placeholder) => [placeholder.key, placeholder.path]),
);

/** The pages holding a placeholder, for purging their cached render on save. */
export const mediaPlaceholderPaths: string[] = [
  ...new Set(mediaPlaceholders.map((placeholder) => placeholder.path)),
];

/** Indexed by path, for looking up the entry behind a menu link. */
export const sitePageByPath: Record<string, SitePage> = Object.fromEntries(
  sitePages.map((page) => [page.path, page]),
);

/** The menu, in order, as the site ships it before anything is edited. */
export const defaultNavigation: { label: string; href: string }[] = sitePages
  .filter((page) => typeof page.navOrder === "number")
  .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0))
  .map((page) => ({ label: page.label, href: page.path }));

/**
 * Pages that sit underneath a menu item without a link of their own, keyed by
 * that item's path. The header highlights the parent while a visitor is on one
 * of them, and the sitemap lists them, so shortening the menu never hides a page.
 */
export const navSections: Record<string, string[]> = sitePages.reduce<Record<string, string[]>>(
  (sections, page) => {
    if (!page.parent) return sections;
    (sections[page.parent] ??= []).push(page.path);
    return sections;
  },
  {},
);

export type NavItem = { label: string; href: string; newTab?: boolean; covers?: string[] };

/** Attach the pages a menu item stands for, so the header can highlight it. */
export const withSection = (item: NavItem): NavItem =>
  navSections[item.href] ? { ...item, covers: navSections[item.href] } : item;

/** A page in Content → Website pages, as far as the menu is concerned. */
export type PageDoc = {
  title: string;
  slug?: string | null;
  path?: string | null;
  navOrder?: number | null;
  showInNav?: boolean | null;
};

/**
 * The menu links a set of published pages contributes.
 *
 * Ticking "show in navigation" on a page adds it to the menu without anyone
 * editing Site → Navigation, and the position number beside it orders those
 * links. Both the header and the dashboard panel apply this rule through here,
 * so neither can decide differently about a page.
 */
export const navItemsFromPages = (pages: PageDoc[]): NavItem[] =>
  pages
    .filter((page) => (page.path || page.slug) && page.showInNav)
    .sort(
      (a, b) =>
        (a.navOrder ?? Number.MAX_SAFE_INTEGER) - (b.navOrder ?? Number.MAX_SAFE_INTEGER) ||
        a.title.localeCompare(b.title),
    )
    .map((page) => ({ label: page.title, href: page.path || `/${page.slug}` }));

/**
 * The menu the website actually renders.
 *
 * `items` are the links saved in Site → Navigation, `pageItems` what
 * `navItemsFromPages` returned, and `hidden` the addresses of pages an editor
 * has taken off the website. Both the header and the dashboard's page panel
 * call this, so what an editor sees in the dashboard is what a visitor sees in
 * the navbar.
 *
 * A page that is both in the saved menu and published with "show in navigation"
 * appears once, in the menu's position but under the page's own name - so
 * renaming a page in the dashboard renames its link.
 */
export function resolveNavItems(
  items: NavItem[] | null | undefined,
  pageItems: NavItem[] = [],
  hidden: string[] = [],
): NavItem[] {
  const saved = (items ?? []).filter((item) => item.label && item.href);
  const base = saved.length > 0 ? saved : defaultNavigation;
  const namedByPage = new Map(pageItems.map((item) => [item.href, item.label]));

  return [...base, ...pageItems]
    .map((item) => withSection({ ...item, label: namedByPage.get(item.href) ?? item.label }))
    // A page already linked by hand should not appear twice.
    .filter((item, index, all) => all.findIndex((other) => other.href === item.href) === index)
    // A page taken off the website leaves the menu with it.
    .filter((item) => !hidden.includes(item.href));
}
