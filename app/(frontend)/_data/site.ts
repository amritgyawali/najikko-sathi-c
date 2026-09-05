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

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Our Work", href: "/our-work" },
  { label: "Contact", href: "/contact" },
  { label: "About Us", href: "/about" },
] as const;

/**
 * Pages that sit underneath a menu item without having their own link in the
 * navbar. The header highlights the parent while a visitor is on one of them,
 * and the sitemap still lists them, so shortening the menu never hides a page.
 */
export const navSections: Record<string, string[]> = {
  "/our-work": ["/production", "/training", "/right-sanchar"],
};

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
      { label: "Social Media", href: "/services#social-media" },
      { label: "Media Training", href: "/training" },
      { label: "Research & Development", href: "/services#research" },
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
