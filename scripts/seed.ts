import { existsSync } from "fs";

import { getPayload } from "payload";

import { importRoutePages } from "../cms/site-pages";
import { pageMedia } from "../app/(frontend)/_data/media";
import { categories, servicePortfolio } from "../app/(frontend)/_data/services";
import {
  brandPillars,
  business,
  footerGroups,
  navigation,
  rightSancharTopics,
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
      cta: { label: "Start a conversation", href: "/contact", enabled: true },
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
      heroCtaHref: "/services",
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
      leadershipKicker: "From our leadership",
      leadershipHeading: "Messages from the people who guide our work.",
      // Left empty on purpose: the chairman's and director's own words belong
      // to them. Add the messages in Site -> Homepage -> Leadership and the
      // carousel appears on the front page.
      leadershipMessages: [],
      servicesKicker: "Our Services",
      // Cleared on purpose: with no custom list the homepage grid shows the
      // full service portfolio, each card linking to its own service page.
      // Filling this in from the dashboard overrides that grid.
      services: [],
      servicesIntro:
        "From verified information to cinematic storytelling, every service is built around " +
        "clarity, truth, and impact.",
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

  // ---------------------------------------------------------------------
  // Service portfolio. These are the real 18 services and their four
  // groupings, taken from the Service Portfolio & Scope of Work document that
  // already drives the site - not placeholder content.
  // ---------------------------------------------------------------------
  const categoryIds = new Map<string, number>();
  for (const [index, category] of categories.entries()) {
    const existing = await payload.find({
      collection: "service-categories",
      where: { slug: { equals: category.id } },
      limit: 1,
      overrideAccess: true,
    });
    const data = {
      label: category.label,
      slug: category.id,
      title: category.title,
      description: category.description,
      href: category.href,
      icon: ({ production: "clapperboard", "social-media": "megaphone", training: "graduationCap", research: "search" } as const)[category.id],
      order: index,
    };
    const saved = existing.docs[0]
      ? await payload.update({ collection: "service-categories", id: existing.docs[0].id, data, overrideAccess: true })
      : await payload.create({ collection: "service-categories", data, overrideAccess: true });
    categoryIds.set(category.id, saved.id as number);
  }
  payload.logger.info(`Seeded ${categories.length} service categories.`);

  for (const [index, service] of servicePortfolio.entries()) {
    const existing = await payload.find({
      collection: "services",
      where: { slug: { equals: service.slug } },
      limit: 1,
      overrideAccess: true,
    });
    const data = {
      title: service.title,
      shortTitle: service.shortTitle,
      slug: service.slug,
      status: "published" as const,
      category: categoryIds.get(service.category)!,
      order: index,
      description: service.description,
      metaDescription: service.metaDescription,
      intro: service.intro,
      audience: service.audience,
      preparation: service.preparation,
      deliverables: service.deliverables.map((item) => ({ item })),
      steps: service.steps.map(([title, description]) => ({ title, description })),
      faq: service.faq.map(([question, answer]) => ({ question, answer })),
    };
    if (existing.docs[0]) {
      await payload.update({ collection: "services", id: existing.docs[0].id, data, overrideAccess: true });
    } else {
      await payload.create({ collection: "services", data, overrideAccess: true });
    }
  }
  payload.logger.info(`Seeded ${servicePortfolio.length} services.`);

  // A media slot per page and per service, so an editor can drop a photo in
  // without first having to work out the right key.
  for (const key of Object.keys(pageMedia)) {
    const existing = await payload.find({
      collection: "media-slots",
      where: { key: { equals: key } },
      limit: 1,
      overrideAccess: true,
    });
    if (!existing.docs[0]) {
      await payload.create({ collection: "media-slots", data: { key }, overrideAccess: true });
    }
  }
  payload.logger.info(`Prepared ${Object.keys(pageMedia).length} page media slots.`);

  // The questions already published on the contact page.
  const contactFaqs: [string, string][] = [
    ["What information should I share?", "Describe your idea, the intended audience, the service you need, preferred timing, and any relevant budget range. For training, include the topic and group size."],
    ["Can I request several services together?", "Yes. A project may combine research, filming, social content, or training. Describe the overall goal so the individual scopes can be discussed together."],
    ["What happens after I send the form?", "Your message reaches the Najikko Sathi team directly and is tracked until it is answered. You can also use the direct email address or phone numbers on this page."],
  ];
  for (const [index, [question, answer]] of contactFaqs.entries()) {
    const existing = await payload.find({
      collection: "faqs",
      where: { question: { equals: question } },
      limit: 1,
      overrideAccess: true,
    });
    const data = { question, answer, placement: "contact" as const, order: index };
    if (existing.docs[0]) {
      await payload.update({ collection: "faqs", id: existing.docs[0].id, data, overrideAccess: true });
    } else {
      await payload.create({ collection: "faqs", data, overrideAccess: true });
    }
  }
  payload.logger.info(`Seeded ${contactFaqs.length} contact questions.`);

  // The website's own pages, as documents anyone can edit. Nothing on the site
  // changes: each one is created holding exactly the copy that page already
  // shows, and pages that are already there are left alone.
  const pages = await importRoutePages(payload);
  payload.logger.info(
    `Website pages in the dashboard: ${pages.imported.length} added, ${pages.alreadyThere.length} already there.`,
  );
  for (const failure of pages.failed) {
    payload.logger.error(`Could not add ${failure.path}: ${failure.reason}`);
  }

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
