import Link from "next/link";
import { ArrowRight, Check, MonitorPlay, Radio, Sparkles } from "lucide-react";
import { getCategoryViews, getServiceViews } from "@/lib/services";
import { ContactCta, MediaShowcase, PageHero, ProcessSteps, SectionHeading, ServiceCards, TopicGrid } from "../_components/page-content";
import { pageMetadata } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

/** What an advertisement can be, in the formats our clients actually buy. */
const formats = [
  {
    icon: MonitorPlay,
    title: "Television & video commercials",
    body:
      "Scripted commercials produced for broadcast and for online placement, from a single-idea thirty-second spot to a longer brand film. We write it, cast it, shoot it, and deliver it in the durations each channel accepts.",
    points: ["Concept, script, and storyboard signed off before the shoot", "Studio or location production with cast, crew, and equipment", "Delivery at broadcast specification, plus digital cut-downs"],
  },
  {
    icon: Radio,
    title: "Digital & social campaigns",
    body:
      "Advertising made for the feed rather than adapted to it: vertical video, carousels, and static creative that carry one message in the first two seconds, published and boosted from your own pages.",
    points: ["Creative built per platform and per placement", "Boosting, targeting, and budget management on Facebook and Instagram", "Weekly reporting on reach, cost, and what to change"],
  },
  {
    icon: Sparkles,
    title: "Print, outdoor & brand material",
    body:
      "The advertising that is not a film: press announcements, hoardings, banners, brochures, and the design system that keeps them all recognizably yours.",
    points: ["Layout, typography, and artwork prepared for press", "Hoarding, banner, and backdrop design at final size", "A reusable template set your own team can keep using"],
  },
];

/** The parts of the work, in the order they usually happen. */
const craft = [
  { title: "The single idea", text: "Every advertisement we make is built on one thing the audience should remember. Deciding what that is, and being willing to leave out the rest, is most of the work." },
  { title: "The audience", text: "Who is being spoken to, where they will see it, and what they already believe. A commercial written for a national broadcast and one written for a district-level campaign are not the same commercial." },
  { title: "The production", text: "Casting, location, light, sound, and the schedule that keeps a shoot inside its budget. Our production team does this work every week for documentaries, and the same standards apply here." },
  { title: "The placement", text: "An advertisement is only as good as where it runs. We advise on channel, timing, duration, and spend, and we deliver files that meet each channel's technical specification." },
  { title: "The measurement", text: "Reach, frequency, cost per result, and what the enquiries afterwards actually looked like. We report it plainly, including when a campaign underperformed." },
  { title: "The honesty", text: "We do not write claims a client cannot support. Advertising that overstates gets a business one campaign; advertising that is accurate gets it the next one." },
];

export const metadata = pageMetadata(
  "Advertising & Commercial Production in Kathmandu, Nepal",
  "Najikko Sathi Media writes, produces, and places advertising in Nepal: television and video commercials, digital and social campaigns, and print, outdoor, and brand material.",
  "/advertisement",
);

export default async function AdvertisementPage() {
  const [services, categories] = await Promise.all([getServiceViews(), getCategoryViews()]);
  const category = categories.find((item) => item.id === "production");

  return <>
    <PageHero eyebrow="Advertisement" title="One clear message, made well enough to be remembered." description="We write, produce, and place advertising for businesses and organizations in Nepal - commercials, digital campaigns, and the design work that holds a brand together." path="/advertisement" label="Advertisement" category={category}><Link className="hero-cta" prefetch={false} href="/contact?service=Advertisement">Start a campaign <ArrowRight aria-hidden="true" /></Link></PageHero>
    <section className="content-section"><div className="site-container prose"><SectionHeading kicker="Who we are on this" title="A media house that also makes advertisements." /><p className="lead-copy">Advertising sits inside a media house that spends the rest of its time on journalism, documentary, and research. That shapes how we work: we start from what a product or service genuinely does, and we build the campaign on that rather than around it.</p><p>The practical advantage is that the same team writes, films, edits, designs, and publishes. A commercial, the social creative that supports it, and the page it runs from are made by people who are already talking to each other, so the campaign holds together and the schedule survives contact with reality.</p><p>We work with businesses, institutions, and public-interest campaigns, on budgets from a single social film to a full multi-channel launch. The proposal always says plainly what is included, what it costs, and what it cannot promise.</p></div></section>
    <section className="content-section related-section"><div className="site-container">
      <SectionHeading kicker="What we make" title="Commercials, campaigns, and everything printed." description="Most clients take a combination. The message is written once and then produced in the formats each channel needs." />
      <div className="discipline-grid">{formats.map(({ icon: Icon, title, body, points }) => <article className="discipline-card" key={title}>
        <span className="service-card-icon"><Icon aria-hidden="true" /></span>
        <h3>{title}</h3>
        <p>{body}</p>
        <ul>{points.map((point) => <li key={point}><Check aria-hidden="true" />{point}</li>)}</ul>
      </article>)}</div>
    </div></section>
    <section className="content-section"><div className="site-container">
      <SectionHeading kicker="How we think about it" title="What an advertisement has to get right." />
      <TopicGrid items={craft} />
    </div></section>
    <section className="content-section"><div className="site-container"><SectionHeading kicker="Related services" title="The production scopes behind a campaign." /><ServiceCards services={services.filter((service) => ["advertisements-commercials", "social-media-advertisements", "facebook-boosting-digital-campaigns"].includes(service.slug))} /></div></section>
    <section className="content-section process-section"><div className="site-container"><SectionHeading kicker="How a campaign runs" title="Brief, idea, production, placement." /><ProcessSteps steps={[["Brief", "Agree what is being advertised, to whom, on what budget, and by when."], ["Idea", "Write the single message and the treatment, and confirm the claims we can support."], ["Produce", "Shoot, design, and edit the creative in every format the plan calls for."], ["Place & report", "Publish, boost, and monitor the campaign, then report what it returned."]]} /></div></section>
    <MediaShowcase mediaKey="advertisement" title="Advertising work" />
    <ContactCta title="What are you advertising, and to whom?" description="Tell us the product or message, the channels you have in mind, and the budget range you are working with." service="Advertisement" />
  </>;
}
