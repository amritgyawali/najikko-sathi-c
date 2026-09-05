import Link from "next/link";
import { ArrowRight, Check, Clapperboard, Film, Megaphone } from "lucide-react";
import { getCategoryViews, getFaqPairs, getServiceViews } from "@/lib/services";
import { getBusiness, getHomepage } from "@/lib/content";
import { ContactCta, MediaShowcase, PageHero, ProcessSteps, Questions, SectionHeading, ServiceCards } from "../_components/page-content";
import { ProductionBand } from "../_components/site-sections";
import { pageMetadata } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




/**
 * The three kinds of film the production team makes. Each one already has a
 * service page, so these panels explain the work and lead into it rather than
 * repeating the scope.
 */
const productionWork = [
  {
    icon: Clapperboard,
    title: "Biography",
    href: "/services/biography-videos",
    body:
      "A person's life told as a film. We sit with the subject and the people around them, gather the photographs, letters, and places that carry the story, and shape it into a portrait that a family, an institution, or a public audience can keep.",
    points: ["Interviews with the subject and their circle", "Archive photographs and documents filmed and restored on screen", "A narrated edit in Nepali, English, or both"],
  },
  {
    icon: Film,
    title: "Documentary",
    href: "/services/documentary-film-production",
    body:
      "Longer-form films about an issue, a place, or a piece of work. Research comes first: the question the film asks, the voices that can answer it, and the evidence behind them. Filming and editing then follow that structure rather than a script written in advance.",
    points: ["Field research, sources, and a written treatment", "Location filming with contributors and observational footage", "Versions cut for screenings, broadcast, and online release"],
  },
  {
    icon: Megaphone,
    title: "Advertisement",
    href: "/services/advertisements-commercials",
    body:
      "Commercials and promotional films built around one clear message. We work from what the product or service actually offers, agree on the single idea the audience should take away, and produce it in the durations each channel needs.",
    points: ["Concept, script, and storyboard agreed before filming", "Studio or location production with the required cast and crew", "Cut-downs for television, digital campaigns, and social feeds"],
  },
];

export const metadata = pageMetadata("Video & Documentary Production in Nepal", "Explore biography films, documentaries, commercials, and corporate profiles with Najikko Sathi's photography and video production team in Kathmandu, Nepal.", "/production");

export default async function ProductionPage() {
  const [services, categories, business, home, questions] = await Promise.all([
    getServiceViews(),
    getCategoryViews(),
    getBusiness(),
    getHomepage(),
    getFaqPairs("production", [
      ["What should a production brief include?", "Share the subject, intended audience, desired format, locations, deadline, and available budget range. Existing photographs, reports, brand guidelines, and references can help define the scope."],
      ["Can photography and video be combined?", "Yes. The portfolio covers both photography and videography. The brief should list the photographs and films needed so the coverage and delivery can be coordinated."],
      ["Are prices and timelines fixed?", "No fixed packages are published here. Research, filming locations, contributors, duration, editing, and language versions affect the proposal."],
    ]),
  ]);
  const category = categories.find((item) => item.id === "production");
  return <>
    <PageHero eyebrow="Photography & video production" title="Real stories. Thoughtfully brought to life." description="From a personal biography to an institutional documentary, we connect research and cinematic craft with the purpose of your story." path="/production" label="Production" category={category}><Link className="hero-cta" prefetch={false} href="/contact?service=Production">Start a production <ArrowRight aria-hidden="true" /></Link></PageHero>
    <ProductionBand business={business} home={home} />
    <section className="content-section"><div className="site-container prose"><SectionHeading kicker="The whole story" title="From the first question to the final edit." /><p>Our production portfolio covers biographies, documentary films, advertisements, and organizational profiles. Photography and videography help give each subject a clear, memorable visual form.</p><p>The starting point is your audience and intended use. A screening, a website introduction, a television placement, and a social campaign each need a different approach to duration, framing, and delivery.</p></div></section>
    <section className="content-section related-section"><div className="site-container"><SectionHeading kicker="What we produce" title="Biography. Documentary. Advertisement." description="Three ways of turning a subject into something an audience will watch, each with its own research, writing, and filming approach." /><div className="discipline-grid">{productionWork.map(({ icon: Icon, title, href, body, points }) => <article className="discipline-card" key={title}>
      <span className="service-card-icon"><Icon aria-hidden="true" /></span>
      <h3>{title}</h3>
      <p>{body}</p>
      <ul>{points.map((point) => <li key={point}><Check aria-hidden="true" />{point}</li>)}</ul>
      <Link className="text-link" href={href}>Explore this service <ArrowRight aria-hidden="true" /></Link>
    </article>)}</div></div></section>
    <section className="content-section"><div className="site-container"><SectionHeading kicker="Find your format" title="Four ways to tell your story." /><ServiceCards services={services.filter((service) => service.category.id === "production")} /></div></section>
    <section className="content-section process-section"><div className="site-container"><SectionHeading kicker="Our production process" title="Research. Script. Shoot. Edit." /><ProcessSteps steps={[["Research", "Understand the subject, gather background information, and identify the voices and locations that matter."], ["Script", "Shape the narrative, agree on the message, and plan what needs to be captured."], ["Shoot", "Record interviews, visual details, and supporting material within the agreed production plan."], ["Edit", "Bring the story together and prepare the formats agreed for your audience and channels."]]} /></div></section>
    <MediaShowcase mediaKey="production" title="Our production work" />
    <section className="content-section"><div className="site-container faq-grid"><SectionHeading kicker="Plan your production" title="Before the camera rolls." /><Questions items={questions} /></div></section>
    <ContactCta title="What story do you want to tell?" service="Production" />
  </>;
}
