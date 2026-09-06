import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ArrowUpRight, Check, Mail, MapPin, Phone, Search as SearchIcon } from "lucide-react";

import type { PageSection } from "@/lib/page-defaults";
import { getBusiness, getCollection, getHomepage, getTeam, liveWhere, type BusinessInfo } from "@/lib/content";
import { getCategoryViews, getFaqPairs, getServiceViews, type CategoryView, type ServiceView } from "@/lib/services";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { ContactForm } from "./contact-form";
import { HomeAbout, HomeHero, Leadership } from "./home-sections";
import {
  ContactCta,
  MediaShowcase,
  PageHero,
  ProcessSteps,
  Questions,
  SectionHeading,
  ServiceCards,
} from "./page-content";
import { RenderBlocks } from "./RenderBlocks";
import { SectionIcon } from "./section-icons";
import { ProductionBand, SancharBand, ServicesGrid } from "./site-sections";
import { SocialResponsibilitySection } from "./social-responsibility";

/**
 * Draws a page from the sections it is made of.
 *
 * Every page on the website - the ones that ship with it and the ones built in
 * the dashboard - is a list of sections (cms/sections.ts). This turns that list
 * into the page a visitor sees, so rewriting a heading in the dashboard, moving
 * a band up the page, or deleting one changes the website and nothing else.
 *
 * The sections come either from the page's document in Content → Website
 * pages or, when that document has been deleted, from lib/page-defaults.ts.
 * Both take the same shape, so a page renders identically either way.
 */

/** What the sections need to know about the page they are being drawn on. */
export type SectionContext = {
  /** The public address, for breadcrumbs. */
  path: string;
  /** The page's name, for breadcrumbs. */
  label: string;
  /** The menu item this page sits under, shown before it in the breadcrumb. */
  parent?: { label: string; href: string } | null;
  /** What a visitor typed into the search box, on the search page. */
  query?: string;
};

type Block<T extends PageSection["blockType"]> = Extract<PageSection, { blockType: T }>;

/** A tinted section sits on the site's soft background rather than on white. */
const band = (tone?: string | null, extra = ""): string =>
  ["content-section", tone === "tinted" ? "related-section" : "", extra].filter(Boolean).join(" ");

/** A heading band, drawn only when something has been written in it. */
function Heading({
  kicker,
  heading,
  description,
}: {
  kicker?: string | null;
  heading?: string | null;
  description?: string | null;
}) {
  if (!kicker && !heading) return null;
  return (
    <SectionHeading kicker={kicker ?? ""} title={heading ?? ""} description={description ?? undefined} />
  );
}

/** The one action a hero can carry. External links open the news portal. */
function HeroAction({ block, business }: { block: Block<"pageHero">; business: BusinessInfo }) {
  if (!block.ctaLabel) return null;
  const href = block.ctaHref || (block.ctaExternal ? business.rightSanchar : "");
  if (!href) return null;

  return block.ctaExternal ? (
    <a className="hero-cta" href={href} target="_blank" rel="noopener noreferrer">
      {block.ctaLabel} <ArrowUpRight aria-hidden="true" />
    </a>
  ) : (
    <Link className="hero-cta" prefetch={false} href={href}>
      {block.ctaLabel} <ArrowRight aria-hidden="true" />
    </Link>
  );
}

async function Hero({ block, page }: { block: Block<"pageHero">; page: SectionContext }) {
  const [business, categories] = await Promise.all([getBusiness(), getCategoryViews()]);
  const category = block.category
    ? categories.find((item) => item.id === block.category)
    : undefined;

  return (
    <PageHero
      eyebrow={block.eyebrow}
      title={block.heading}
      description={block.description ?? ""}
      path={page.path}
      label={page.label}
      parent={page.parent ?? undefined}
      category={category}
    >
      <HeroAction block={block} business={business} />
    </PageHero>
  );
}

function Prose({ block }: { block: Block<"prose"> }) {
  return (
    <section className={band(block.tone)}>
      <div className="site-container prose">
        <Heading kicker={block.kicker} heading={block.heading} description={block.description} />
        {block.lead ? <p className="lead-copy">{block.lead}</p> : null}
        {(block.paragraphs ?? []).map((row, index) => (
          <p key={row.id ?? index}>{row.text}</p>
        ))}
        {block.linkLabel && block.linkHref ? (
          <Link className="text-link" href={block.linkHref}>
            {block.linkLabel} <ArrowRight aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

/** The about page's opening: who the company is, beside the story. */
async function IdentityStory({ block }: { block: Block<"identityStory"> }) {
  const business = await getBusiness();
  const quote = (block.panelQuote ?? "").split("\n").filter(Boolean);

  return (
    <section className="content-section">
      <div className="site-container about-story-grid">
        <div className="identity-panel">
          <span className="brand-mark">{business.initials}</span>
          <h2>{business.legalName}</h2>
          <p>{business.address}, Nepal</p>
          <span className="identity-rule" />
          {quote.length > 0 ? (
            <blockquote>
              {quote.map((line, index) => (
                <span key={line}>
                  {index > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </blockquote>
          ) : null}
        </div>
        <div className="prose">
          <Heading kicker={block.kicker} heading={block.heading} description={block.description} />
          {block.lead ? <p className="lead-copy">{block.lead}</p> : null}
          {(block.paragraphs ?? []).map((row, index) => (
            <p key={row.id ?? index}>{row.text}</p>
          ))}
          {block.linkLabel && block.linkHref ? (
            <Link className="text-link" href={block.linkHref}>
              {block.linkLabel} <ArrowRight aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FeatureCards({ block }: { block: Block<"featureCards"> }) {
  const cards = block.cards ?? [];

  const grid =
    block.style === "disciplines" ? (
      <div className="discipline-grid">
        {cards.map((card) => (
          <article className="discipline-card" key={card.id ?? card.title}>
            <span className="service-card-icon">
              <SectionIcon name={card.icon} />
            </span>
            <h3>{card.title}</h3>
            {card.text ? <p>{card.text}</p> : null}
            {card.points?.length ? (
              <ul>
                {card.points.map((point, index) => (
                  <li key={point.id ?? index}>
                    <Check aria-hidden="true" />
                    {point.text}
                  </li>
                ))}
              </ul>
            ) : null}
            {card.linkLabel && card.linkHref ? (
              <Link className="text-link" href={card.linkHref}>
                {card.linkLabel} <ArrowRight aria-hidden="true" />
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    ) : block.style === "topics" ? (
      <div className="topic-grid">
        {cards.map((card) => (
          <article key={card.id ?? card.title}>
            <h3>{card.title}</h3>
            {card.text ? <p>{card.text}</p> : null}
          </article>
        ))}
      </div>
    ) : block.style === "links" ? (
      <div className="service-detail-grid">
        {cards.map((card) => (
          <Link className="service-detail-card" href={card.linkHref || "#"} key={card.id ?? card.title}>
            <span className="service-card-icon">
              <SectionIcon name={card.icon} />
            </span>
            <h3>{card.title}</h3>
            {card.text ? <p>{card.text}</p> : null}
            {card.linkLabel ? (
              <span className="service-card-action">
                {card.linkLabel} <ArrowRight aria-hidden="true" />
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    ) : (
      <div className="values-grid">
        {cards.map((card) => (
          <article key={card.id ?? card.title}>
            <SectionIcon name={card.icon} />
            <h3>{card.title}</h3>
            {card.text ? <p>{card.text}</p> : null}
          </article>
        ))}
      </div>
    );

  return (
    <section className={band(block.tone)}>
      <div className="site-container">
        <Heading kicker={block.kicker} heading={block.heading} description={block.description} />
        {grid}
        {block.chips?.length ? (
          <div className="about-capabilities">
            {block.chips.map((chip, index) => (
              <span key={chip.id ?? index}>{chip.text}</span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Steps({ block }: { block: Block<"processSteps"> }) {
  return (
    <section className={band(block.tone)}>
      <div className="site-container">
        <Heading kicker={block.kicker} heading={block.heading} description={block.description} />
        <ProcessSteps steps={(block.steps ?? []).map((step) => [step.title, step.text])} />
      </div>
    </section>
  );
}

/**
 * Questions. Anything entered in Content → FAQs under the chosen placement
 * replaces the list written into the section, so an editor can reword them in
 * either place.
 */
async function Faq({ block }: { block: Block<"faqSection"> }) {
  const written = (block.items ?? []).map((item) => [item.question, item.answer] as [string, string]);
  const items = block.placement ? await getFaqPairs(block.placement, written) : written;
  if (items.length === 0) return null;

  return (
    <section className={band(block.tone)}>
      <div className="site-container faq-grid">
        <Heading kicker={block.kicker} heading={block.heading} description={block.description} />
        <Questions items={items} />
      </div>
    </section>
  );
}

/** The services chosen for this section, from Content → Services. */
const pickServices = (block: Block<"serviceCards">, services: ServiceView[]): ServiceView[] => {
  if (block.source === "all") return services;
  if (block.source === "slugs") {
    const wanted = (block.slugs ?? []).map((row) => row.slug);
    return services.filter((service) => wanted.includes(service.slug));
  }
  return services.filter((service) => service.category.id === block.category);
};

async function Services({ block }: { block: Block<"serviceCards"> }) {
  const services = await getServiceViews();
  const chosen = pickServices(block, services);
  if (chosen.length === 0) return null;

  return (
    <section className={band(block.tone)}>
      <div className="site-container">
        <Heading kicker={block.kicker} heading={block.heading} description={block.description} />
        <ServiceCards services={chosen} />
      </div>
    </section>
  );
}

/** Categories that actually contain a service; the others would be empty. */
async function populatedCategories(): Promise<{ categories: CategoryView[]; services: ServiceView[] }> {
  const [services, categories] = await Promise.all([getServiceViews(), getCategoryViews()]);
  return {
    services,
    categories: categories.filter((category) =>
      services.some((service) => service.category.id === category.id),
    ),
  };
}

async function CategoryBar({ block }: { block: Block<"categoryBar"> }) {
  const { categories, services } = await populatedCategories();
  if (categories.length === 0) return null;

  return (
    <nav className="category-bar" aria-label={block.ariaLabel || "Service categories"}>
      <div className="site-container">
        {categories.map((category) => (
          <a key={category.id} href={`#${category.id}`}>
            {category.label}
            <span>{services.filter((service) => service.category.id === category.id).length} services</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

async function CategoryGroups() {
  const { categories, services } = await populatedCategories();

  return (
    <>
      {categories.map((category) => (
        <section
          className={`content-section category-section category-${category.id}`}
          id={category.id}
          key={category.id}
        >
          <div className="site-container">
            <SectionHeading kicker={category.label} title={category.title} description={category.description} />
            <ServiceCards services={services.filter((service) => service.category.id === category.id)} />
          </div>
        </section>
      ))}
    </>
  );
}

async function Showcase({ block }: { block: Block<"mediaShowcase"> }) {
  const business = await getBusiness();
  return <MediaShowcase mediaKey={block.mediaKey} title={block.heading || business.shortName} />;
}

/** The people added in Content → Team. Hidden while nobody has been added. */
async function TeamGrid({ block }: { block: Block<"teamSection"> }) {
  const team = await getTeam();
  if (team.length === 0) return null;

  return (
    <section className="content-section">
      <div className="site-container">
        <Heading kicker={block.kicker} heading={block.heading} description={block.description} />
        <div className="team-grid">
          {team.map((member) => {
            const photo = mediaUrl(member.photo);
            return (
              <article className="team-card" key={member.id}>
                {photo ? (
                  <Image src={photo} alt={mediaAlt(member.photo, member.name)} width={320} height={320} />
                ) : (
                  <div className="team-initials" aria-hidden="true">
                    {member.name.slice(0, 1)}
                  </div>
                )}
                <strong>{member.name}</strong>
                <span className="team-role">{member.role}</span>
                {member.bio ? <p>{member.bio}</p> : null}
                {member.email ? (
                  <a className="text-link" href={`mailto:${member.email}`}>
                    {member.email}
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Address, phones and email, with the enquiry form beside them. */
async function ContactDetails({ block }: { block: Block<"contactDetails"> }) {
  const [business, services] = await Promise.all([getBusiness(), getServiceViews()]);

  return (
    <section className="content-section">
      <div className="site-container contact-grid">
        <div>
          <Heading kicker={block.kicker} heading={block.heading} description={block.description} />
          <address className="contact-methods">
            <div>
              <Mail aria-hidden="true" />
              <span>
                <strong>Email</strong>
                <a href={`mailto:${business.email}`}>{business.email}</a>
              </span>
            </div>
            <div>
              <Phone aria-hidden="true" />
              <span>
                <strong>Phone</strong>
                {business.phones.map((phone) => (
                  <a key={phone} href={`tel:+977${phone}`}>
                    +977 {phone}
                  </a>
                ))}
              </span>
            </div>
            <div>
              <MapPin aria-hidden="true" />
              <span>
                <strong>Location</strong>
                {business.address}, Nepal
                {block.linkLabel && block.linkHref ? (
                  <a className="text-link" href={block.linkHref} target="_blank" rel="noopener noreferrer">
                    {block.linkLabel} <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : null}
              </span>
            </div>
          </address>
          <div className="contact-legal">
            <strong>{business.legalName}</strong>
            <span>VAT {business.vat}</span>
            {block.note ? <p>{block.note}</p> : null}
          </div>
        </div>
        {block.showForm === false ? null : (
          <Suspense
            fallback={
              <p>
                Prepare an inquiry by emailing <a href={`mailto:${business.email}`}>{business.email}</a>.
              </p>
            }
          >
            <ContactForm services={services.map((service) => service.title)} email={business.email} />
          </Suspense>
        )}
      </div>
    </section>
  );
}

/** The two closing links on the news portal page. */
async function PortalLinks({ block }: { block: Block<"portalLinks"> }) {
  const business = await getBusiness();
  const primaryHref = block.primaryHref || business.rightSanchar;

  return (
    <section className="content-section">
      <div className="site-container portal-next">
        <div>
          <Heading kicker={block.kicker} heading={block.heading} description={block.description} />
          {block.body ? <p>{block.body}</p> : null}
        </div>
        <div className="stacked-actions">
          {block.primaryLabel ? (
            <a className="primary-button" href={primaryHref} target="_blank" rel="noopener noreferrer">
              {block.primaryLabel} <ArrowUpRight aria-hidden="true" />
            </a>
          ) : null}
          {block.secondaryLabel && block.secondaryHref ? (
            <Link className="text-link" prefetch={false} href={block.secondaryHref}>
              {block.secondaryLabel} <ArrowRight aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const typeLabels: Record<string, string> = {
  news: "News",
  blog: "Blog",
  commentary: "Commentary",
  investigation: "Investigation",
};

async function PostList({ block }: { block: Block<"postList"> }) {
  const posts = await getCollection("posts", {
    where: liveWhere(),
    limit: block.limit ?? 60,
    sort: "-publishedAt",
  });

  return (
    <section className="content-section">
      <div className="site-container">
        <Heading kicker={block.kicker} heading={block.heading} description={block.description} />
        {posts.length === 0 ? (
          <p className="page-lead">{block.emptyText || "Nothing has been published yet."}</p>
        ) : (
          <div className="cms-card-grid">
            {posts.map((post) => {
              const cover = mediaUrl(post.coverImage);
              return (
                <Link className="cms-card" href={`/posts/${post.slug}`} key={post.id}>
                  {cover ? (
                    <Image src={cover} alt={mediaAlt(post.coverImage, post.title)} width={640} height={400} />
                  ) : null}
                  <span className="cms-badge">{typeLabels[post.type] ?? post.type}</span>
                  <strong>{post.title}</strong>
                  {post.excerpt ? <p>{post.excerpt}</p> : null}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;

async function OfferList({ block }: { block: Block<"offerList"> }) {
  const offers = await getCollection("offers", {
    where: liveWhere(),
    limit: block.limit ?? 40,
    sort: "-createdAt",
  });

  return (
    <section className="content-section">
      <div className="site-container">
        <Heading kicker={block.kicker} heading={block.heading} description={block.description} />
        {offers.length === 0 ? (
          <p className="page-lead">{block.emptyText || "There are no offers running at the moment."}</p>
        ) : (
          <div className="cms-card-grid">
            {offers.map((offer) => {
              const image = mediaUrl(offer.image);
              const ends = formatDate(offer.endsAt);
              return (
                <div className="cms-card" key={offer.id}>
                  {image ? (
                    <Image src={image} alt={mediaAlt(offer.image, offer.title)} width={640} height={400} />
                  ) : null}
                  {offer.badge ? <span className="cms-badge">{offer.badge}</span> : null}
                  <strong>{offer.title}</strong>
                  <p>{offer.summary}</p>
                  {ends ? <p className="cms-meta">Available until {ends}</p> : null}
                  {offer.ctaHref ? (
                    <Link className="text-link" href={offer.ctaHref}>
                      {offer.ctaLabel || "Enquire now"} <ArrowRight aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

type Hit = { title: string; description: string; href: string; kind: string };

const matches = (query: string, ...fields: (string | null | undefined)[]) =>
  fields.some((field) => (field ?? "").toLowerCase().includes(query));

/**
 * Site-wide search across services, writing, offers and any page built in the
 * dashboard. It filters in the server rather than calling a search service, so
 * new content is searchable the moment it is published.
 */
async function SearchResults({ block, page }: { block: Block<"searchSection">; page: SectionContext }) {
  const query = (page.query ?? "").trim();
  const needle = query.toLowerCase();
  let hits: Hit[] = [];

  if (needle.length >= 2) {
    const [services, posts, pages, offers] = await Promise.all([
      getServiceViews(),
      getCollection("posts", { where: liveWhere(), limit: 200, depth: 0 }),
      getCollection("pages", { where: { status: { equals: "published" } }, limit: 200, depth: 0 }),
      getCollection("offers", { where: liveWhere(), limit: 200, depth: 0 }),
    ]);

    hits = [
      ...services
        .filter((service) =>
          matches(needle, service.title, service.shortTitle, service.description, service.intro),
        )
        .map((service) => ({
          title: service.title,
          description: service.description,
          href: `/services/${service.slug}`,
          kind: "Service",
        })),
      ...posts
        .filter((post) => matches(needle, post.title, post.excerpt))
        .map((post) => ({
          title: post.title,
          description: post.excerpt ?? "",
          href: `/posts/${post.slug}`,
          kind: "Writing",
        })),
      ...pages
        .filter((doc) => matches(needle, doc.title, doc.summary))
        .map((doc) => ({
          title: doc.title,
          description: doc.summary ?? "",
          href: doc.path || `/${doc.slug}`,
          kind: "Page",
        })),
      ...offers
        .filter((offer) => matches(needle, offer.title, offer.summary))
        .map((offer) => ({ title: offer.title, description: offer.summary, href: "/offers", kind: "Offer" })),
    ];
  }

  return (
    <section className="content-section">
      <div className="site-container">
        <form className="search-form" action="/search" role="search">
          <label htmlFor="q">{block.heading || "Search this website"}</label>
          <div className="search-field">
            <SearchIcon aria-hidden="true" />
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Try “documentary” or “training”"
              autoComplete="off"
            />
            <button className="primary-button" type="submit">
              Search
            </button>
          </div>
        </form>

        {query.length === 0 ? null : needle.length < 2 ? (
          <p className="page-lead">Please enter at least two characters.</p>
        ) : hits.length === 0 ? (
          <p className="page-lead">Nothing matched “{query}”. Try a different word.</p>
        ) : (
          <>
            <SectionHeading
              kicker={block.kicker || "Results"}
              title={`${hits.length} ${hits.length === 1 ? "result" : "results"} for “${query}”`}
            />
            <div className="search-results">
              {hits.map((hit) => (
                <Link className="search-result" href={hit.href} key={`${hit.kind}-${hit.href}-${hit.title}`}>
                  <span className="cms-badge">{hit.kind}</span>
                  <strong>{hit.title}</strong>
                  {hit.description ? <p>{hit.description}</p> : null}
                  <span className="search-result-go">
                    Open <ArrowRight aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/** One section. Anything this does not know is left to the page builder. */
async function Section({ block, page }: { block: PageSection; page: SectionContext }) {
  switch (block.blockType) {
    case "pageHero":
      return <Hero block={block} page={page} />;
    case "prose":
      return <Prose block={block} />;
    case "identityStory":
      return <IdentityStory block={block} />;
    case "featureCards":
      return <FeatureCards block={block} />;
    case "processSteps":
      return <Steps block={block} />;
    case "faqSection":
      return <Faq block={block} />;
    case "serviceCards":
      return <Services block={block} />;
    case "categoryBar":
      return <CategoryBar block={block} />;
    case "categoryGroups":
      return <CategoryGroups />;
    case "mediaShowcase":
      return <Showcase block={block} />;
    case "teamSection":
      return <TeamGrid block={block} />;
    case "socialResponsibilitySection":
      return (
        <SocialResponsibilitySection
          kicker={block.kicker}
          heading={block.heading}
          description={block.description}
        />
      );
    case "contactDetails":
      return <ContactDetails block={block} />;
    case "contactCta":
      return (
        <ContactCta
          title={block.heading}
          description={block.description ?? undefined}
          service={block.service ?? undefined}
        />
      );
    case "portalLinks":
      return <PortalLinks block={block} />;
    case "postList":
      return <PostList block={block} />;
    case "offerList":
      return <OfferList block={block} />;
    case "homeHero": {
      const [business, home] = await Promise.all([getBusiness(), getHomepage()]);
      return <HomeHero block={block} business={business} home={home} />;
    }
    case "homeAbout": {
      const [business, home] = await Promise.all([getBusiness(), getHomepage()]);
      return <HomeAbout block={block} business={business} home={home} />;
    }
    case "leadershipSection":
      return <Leadership home={await getHomepage()} />;
    case "productionBand": {
      const [business, home] = await Promise.all([getBusiness(), getHomepage()]);
      return <ProductionBand business={business} home={home} />;
    }
    case "sancharBand": {
      const [business, home] = await Promise.all([getBusiness(), getHomepage()]);
      return <SancharBand business={business} home={home} />;
    }
    case "servicesBand": {
      const [home, services] = await Promise.all([getHomepage(), getServiceViews()]);
      return <ServicesGrid home={home} services={services} />;
    }
    case "searchSection":
      return <SearchResults block={block} page={page} />;
    case "signupSection": {
      // Loaded here so the sign-up form's JavaScript only reaches the one page
      // that carries it.
      const { SignupForm } = await import("../signup/SignupForm");
      return (
        <section className="content-section">
          <div className="site-container signup-grid">
            {block.note ? <p className="page-lead">{block.note}</p> : null}
            <SignupForm />
          </div>
        </section>
      );
    }
    default:
      // The free-form page-builder blocks (cms/blocks.ts) draw themselves.
      return <RenderBlocks layout={[block]} />;
  }
}

export function PageSections({
  sections,
  page,
}: {
  sections: PageSection[] | null | undefined;
  page: SectionContext;
}) {
  if (!sections?.length) return null;

  return (
    <>
      {sections.map((block, index) => (
        <Section block={block} key={block.id ?? `${block.blockType}-${index}`} page={page} />
      ))}
    </>
  );
}
