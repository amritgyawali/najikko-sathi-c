/**
 * Canonical website content.
 *
 * Source priority:
 * 1. User-provided legal and contact details.
 * 2. Najik.docx for services, mission, and product descriptions.
 *    Service_Portfolio_Overview.pdf expands the scope in services.ts.
 * 3. No unverified statistics, partners, people, or social links.
 */
export const business = {
  legalName: "Najikko Sathi Media Pvt. Ltd.",
  shortName: "Najikko Sathi",
  initials: "NS",
  address: "Anamnagar, Kathmandu",
  email: "najikkosathi@gmail.com",
  phones: ["9851336187", "9867117411"],
  vat: "609765694",
  website: "https://najikkosathi.com",
  websiteLabel: "najikkosathi.com",
  rightSanchar: "https://www.rightsanchar.com",
  rightSancharLabel: "rightsanchar.com",
} as const;

/**
 * The navbar, and the pages that sit underneath a menu item without a link of
 * their own. Both are derived from lib/site-map.ts, the one list of the site's
 * pages, so the menu, the sitemap and the dashboard cannot drift apart.
 */
export { defaultNavigation as navigation, navSections } from "@/lib/site-map";

/**
 * The six disciplines in the media system wheel on the homepage. Each petal
 * links to the page for that discipline, and this order is the order round the
 * circle, clockwise from the top.
 */
export const mediaSystem = [
  { label: "Production", href: "/production", from: "#f5333f", to: "#d81e2a" },
  { label: "Social Media Handling", href: "/social-media-handling", from: "#f2960f", to: "#e07708" },
  { label: "Training", href: "/training", from: "#a51fa0", to: "#87157f" },
  { label: "Research & Development", href: "/research", from: "#9b7420", to: "#7d5b12" },
  { label: "IT", href: "/it", from: "#1f6fd0", to: "#12539f" },
  { label: "Advertisement", href: "/advertisement", from: "#16a244", to: "#0c8134" },
] as const;

export const brandPillars = [
  "Honest news",
  "Fact-based reporting",
  "Unbiased perspective",
  "Media production",
  "Skill development",
  "Social responsibility",
] as const;

export const rightSancharTopics = [
  "Accurate News",
  "Truthful Reporting",
  "Unbiased Information",
  "Politics",
  "Society",
  "Economy",
  "Culture",
  "Public Interest",
  "Insightful Commentary",
  "Investigative Content",
] as const;

export const footerGroups = [
  {
    title: "Media",
    links: [
      { label: "Right Sanchar", href: "/right-sanchar" },
      { label: "Social Media", href: "/social-media-handling" },
      { label: "Media Training", href: "/training" },
      { label: "Advertisement", href: "/advertisement" },
      { label: "IT", href: "/it" },
      { label: "Research & Development", href: "/research" },
    ],
  },
  {
    title: "Production",
    links: [
      { label: "Biography Videos", href: "/services/biography-videos" },
      { label: "Documentaries", href: "/services/documentary-film-production" },
      { label: "Advertising", href: "/services/advertisements-commercials" },
      { label: "Company Profiles", href: "/services/corporate-profile-making" },
    ],
  },
] as const;
