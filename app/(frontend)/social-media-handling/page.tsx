import Link from "next/link";
import { ArrowRight, CalendarCheck, Check, Compass, UserRoundPen } from "lucide-react";
import { getCategoryViews, getServiceViews } from "@/lib/services";
import { ContactCta, MediaShowcase, PageHero, ProcessSteps, SectionHeading, ServiceCards } from "../_components/page-content";
import { pageMetadata } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

/**
 * The three strands of social media work: building the profile, advising on
 * what it should say, and covering the events that give it something to say.
 */
const strands = [
  {
    icon: UserRoundPen,
    title: "Profile Making",
    body:
      "Setting up a page or profile so it says who you are before anyone reads a word of it. We write the biography, prepare the profile and cover imagery, organize the highlights and pinned posts, and put the contact details, links, and verification in place across the platforms you actually use.",
    points: [
      "Page and profile setup on Facebook, Instagram, YouTube, TikTok, and LinkedIn",
      "Biography, tagline, and about section written for search as well as for readers",
      "Profile photography, cover art, highlight covers, and post templates",
      "A tidy link structure so every profile leads back to your website",
    ],
  },
  {
    icon: Compass,
    title: "Media Consulting",
    body:
      "Advice on what to publish and why. We look at where your audience already is, what your pages are currently saying, and what the organization needs from them, then agree a content plan, a posting rhythm, and a way of measuring whether it is working.",
    points: [
      "A review of your existing pages, audience, and reach",
      "A content plan with themes, formats, and a posting calendar",
      "Tone-of-voice and response guidance for comments and messages",
      "Monthly reporting on what the numbers mean and what to change",
    ],
  },
  {
    icon: CalendarCheck,
    title: "Event Coverage and Management",
    body:
      "Covering an event as it happens and managing how it reaches people afterwards. Our team photographs and films on the day, publishes live updates from your pages, and delivers the edited highlights, stills, and clips your channels need once it is over.",
    points: [
      "Photography and video coverage for conferences, launches, and ceremonies",
      "Live posting, stories, and updates from your own pages during the event",
      "Highlight films, cut-downs, and a delivered photo album afterwards",
      "Coordination with the organizers, speakers, and press attending",
    ],
  },
];

export const metadata = pageMetadata(
  "Social Media Handling & Event Coverage in Nepal",
  "Profile making, media consulting, and event coverage and management from Najikko Sathi Media in Kathmandu: pages built, content planned, and events covered from start to finish.",
  "/social-media-handling",
);

export default async function SocialMediaHandlingPage() {
  const [services, categories] = await Promise.all([getServiceViews(), getCategoryViews()]);
  const category = categories.find((item) => item.id === "social-media");

  return <>
    <PageHero eyebrow="Social media handling" title="Pages that sound like you, run by people who watch them." description="From building a profile to planning what it publishes and covering the events behind it, we handle the parts of digital presence that need doing every week." path="/social-media-handling" label="Social Media Handling" category={category}><Link className="hero-cta" prefetch={false} href="/contact?service=Social%20Media%20Handling">Discuss your pages <ArrowRight aria-hidden="true" /></Link></PageHero>
    <section className="content-section"><div className="site-container prose"><SectionHeading kicker="What handling means" title="Someone has to answer the messages." /><p className="lead-copy">Social media handling is the ordinary, continuous work of keeping a page useful: publishing on a schedule, replying to the people who write in, and noticing when something is or is not landing.</p><p>We take on as much of that as an organization needs. Some clients want only the setup and a plan they can run themselves; others hand over the calendar, the publishing, and the reporting entirely. Either way the work starts with your audience and the message you are accountable for, not with a platform trend.</p></div></section>
    <section className="content-section related-section"><div className="site-container">
      <SectionHeading kicker="Our scope" title="Profile making. Media consulting. Event coverage." description="Three strands that can be taken together as an ongoing arrangement, or separately as one-off work." />
      <div className="discipline-grid">{strands.map(({ icon: Icon, title, body, points }) => <article className="discipline-card" key={title}>
        <span className="service-card-icon"><Icon aria-hidden="true" /></span>
        <h3>{title}</h3>
        <p>{body}</p>
        <ul>{points.map((point) => <li key={point}><Check aria-hidden="true" />{point}</li>)}</ul>
      </article>)}</div>
    </div></section>
    <section className="content-section"><div className="site-container"><SectionHeading kicker="Related services" title="The individual scopes in detail." /><ServiceCards services={services.filter((service) => service.category.id === "social-media")} /></div></section>
    <section className="content-section process-section"><div className="site-container"><SectionHeading kicker="How we work together" title="Set it up, agree the plan, keep it running." /><ProcessSteps steps={[["Review", "Look at the pages you have, the audience they reach, and what the organization needs them to do."], ["Build", "Set up or rebuild the profiles, prepare the templates, and agree the tone and the calendar."], ["Publish", "Produce and post the content, cover the events, and reply to what comes back."], ["Report", "Share what the numbers show each month and adjust the plan around it."]]} /></div></section>
    <MediaShowcase mediaKey="social-media-handling" title="Social media work" />
    <ContactCta title="Tell us what your pages need to do." description="Share the platforms you use, who you are trying to reach, and how much of the work you want to keep in-house." service="Social Media Handling" />
  </>;
}
