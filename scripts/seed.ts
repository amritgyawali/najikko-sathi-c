import { existsSync } from "fs";

import { getPayload } from "payload";

import {
  brandPillars,
  business,
  footerGroups,
  navigation,
  rightSancharTopics,
  services,
} from "../app/(frontend)/_data/site";

/**
 * Fills the CMS with the site's existing content so the dashboard opens
 * pre-populated rather than blank, and creates the first administrator.
 *
 * Safe to re-run: globals are overwritten with these values, and the admin
 * user is only created when no user exists yet.
 */

// The environment must be loaded before payload.config.ts is evaluated, since
// the config reads PAYLOAD_SECRET and DATABASE_URI at module scope. That is why
// the config below is imported dynamically rather than at the top of the file.
if (existsSync(".env")) process.loadEnvFile(".env");

for (const key of ["PAYLOAD_SECRET", "DATABASE_URI"]) {
  if (!process.env[key]) {
    console.error(`Missing ${key}. Copy .env.example to .env and fill it in first.`);
    process.exit(1);
  }
}

const serviceIcons = [
  "newspaper", "fileText", "messageSquare", "search", "camera", "film",
  "megaphone", "video", "aperture", "clapperboard", "scissors", "graduationCap",
] as const;

async function seed() {
  const { default: config } = await import("@payload-config");
  const payload = await getPayload({ config });

  const existing = await payload.count({ collection: "users", overrideAccess: true });
  if (existing.totalDocs === 0) {
    const email = process.env.SEED_ADMIN_EMAIL || business.email;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!password) {
      throw new Error(
        "Set SEED_ADMIN_PASSWORD (and optionally SEED_ADMIN_EMAIL) before seeding, " +
          "so the first administrator does not get a guessable password.",
      );
    }
    await payload.create({
      collection: "users",
      data: { name: "Administrator", email, password, role: "admin" },
      overrideAccess: true,
    });
    payload.logger.info(`Created administrator: ${email}`);
  } else {
    payload.logger.info("Users already exist; skipping administrator creation.");
  }

  await payload.updateGlobal({
    slug: "site-settings",
    overrideAccess: true,
    data: {
      legalName: business.legalName,
      shortName: business.shortName,
      initials: business.initials,
      address: business.address,
      email: business.email,
      vat: business.vat,
      website: business.website,
      websiteLabel: business.websiteLabel,
      rightSanchar: business.rightSanchar,
      rightSancharLabel: business.rightSancharLabel,
      phones: business.phones.map((number) => ({ number })),
    },
  });

  await payload.updateGlobal({
    slug: "navigation",
    overrideAccess: true,
    data: {
      items: navigation.map((item) => ({ label: item.label, href: item.href })),
      cta: { label: "Start a conversation", href: "#contact", enabled: true },
      showUtilityBar: true,
    },
  });

  await payload.updateGlobal({
    slug: "footer",
    overrideAccess: true,
    data: {
      about:
        `${business.legalName} is a media house focused on truthful information, meaningful ` +
        "storytelling, production, advertising, training, and social responsibility.",
      groups: footerGroups.map((group) => ({
        title: group.title,
        links: group.links.map((link) => ({ label: link.label, href: link.href })),
      })),
    },
  });

  await payload.updateGlobal({
    slug: "homepage",
    overrideAccess: true,
    data: {
      heroKicker: "Kathmandu-based media house",
      heroHeading: "Media that stays close to what matters.",
      heroBody:
        "Honest information, meaningful entertainment, and socially responsible media - " +
        "created in Nepal for people, organizations, and communities.",
      heroCtaLabel: "Explore our services",
      heroCtaHref: "#services",
      brandPillars: brandPillars.map((label) => ({ label })),
      aboutEyebrow: "Who We Are",
      aboutHeading: business.legalName,
      aboutQuote:
        "Information, entertainment, and social responsibility - advanced together through " +
        "honest communication and purposeful media.",
      aboutBody:
        "We are a dynamic, multi-dimensional media house delivering truthful news through " +
        "Right Sanchar, high-quality documentary and video production, impactful advertising, " +
        "and training focused on media and skill development.",
      aboutBodySecondary:
        "Beyond our core media services, we support social initiatives that help transform " +
        "communities. True to our name, we aim to walk beside people and organizations as a " +
        "trusted, close companion in communication.",
      aboutCapabilities: [
        { label: "Truthful news" },
        { label: "Visual production" },
        { label: "Skill development" },
      ],
      servicesKicker: "Our Services",
      servicesIntro:
        "From verified information to cinematic storytelling, every service is built around " +
        "clarity, truth, and impact.",
      services: services.map((name, index) => ({
        name,
        icon: serviceIcons[index] ?? "newspaper",
        href: index < 4 ? "#right-sanchar" : "#production",
      })),
      productionChip: "Production",
      productionBody:
        "We turn ideas, lives, and real events into compelling visual experiences. Our team " +
        "produces biography videos, documentaries, advertisements, and social or corporate " +
        "films through research, scriptwriting, cinematography, and cinematic editing.",
      productionCtaLabel: "Start a Production",
      sancharHeading: "Right Information. Right Time. Right Perspective.",
      sancharIntro:
        "Right Sanchar delivers accurate, truthful, and unbiased information on issues that " +
        "matter to the public.",
      sancharTopics: rightSancharTopics.map((label) => ({ label })),
    },
  });

  // Writing Appearance persists the colour defaults so the fields are
  // populated the first time an admin opens the page.
  await payload.updateGlobal({ slug: "appearance", overrideAccess: true, data: {} });

  payload.logger.info("Seed complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
