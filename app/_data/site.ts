/**
 * Canonical website content.
 *
 * Source priority:
 * 1. User-provided legal and contact details.
 * 2. Najik.docx for services, mission, and product descriptions.
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
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Production", href: "#production" },
  { label: "Training", href: "#services" },
  { label: "Right Sanchar", href: "#right-sanchar" },
  { label: "Contact", href: "#contact" },
] as const;

export const brandPillars = [
  "Honest news",
  "Fact-based reporting",
  "Unbiased perspective",
  "Media production",
  "Skill development",
  "Social responsibility",
] as const;

export const services = [
  "Right Sanchar",
  "News Reporting",
  "Commentary",
  "Investigations",
  "Biography Videos",
  "Documentaries",
  "Advertising",
  "Video Production",
  "Research",
  "Scriptwriting",
  "Cinematic Editing",
  "Media Training",
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
      { label: "Right Sanchar", href: "#right-sanchar" },
      { label: "Fact-based News", href: "#right-sanchar" },
      { label: "Investigative Content", href: "#right-sanchar" },
    ],
  },
  {
    title: "Production",
    links: [
      { label: "Biography Videos", href: "#production" },
      { label: "Documentaries", href: "#production" },
      { label: "Advertising", href: "#production" },
    ],
  },
] as const;
