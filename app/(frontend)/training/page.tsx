import Link from "next/link";
import { ArrowRight, BookOpen, Camera, Users } from "lucide-react";
import { getCategoryViews, getFaqPairs, getServiceViews } from "@/lib/services";
import { ContactCta, MediaShowcase, PageHero, ProcessSteps, Questions, SectionHeading, ServiceCards, TopicGrid } from "../_components/page-content";
import { pageMetadata } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




/**
 * Every subject the training programs cover. Each one can be taken on its own
 * or combined with the others into a longer program.
 */
const trainingSubjects = [
  { title: "Social Media Handling", text: "Running pages and profiles day to day: what to post, when to post it, how to reply, and how to read what the numbers are telling you." },
  { title: "Content Creation", text: "Turning an idea into something worth publishing - planning, writing, shooting, and packaging content for the channel it is made for." },
  { title: "Journalism Basics", text: "Reporting fundamentals: finding a story, checking a fact, interviewing a source, and writing it up fairly and clearly." },
  { title: "Creativity", text: "Practical ways to get past a blank page: observation exercises, references, and building a habit of producing work rather than waiting for inspiration." },
  { title: "Idea", text: "Shaping a rough thought into a proposal - the audience it is for, the form it should take, and what it needs to become real." },
  { title: "Monetization", text: "Turning creative work into income: platform programs, sponsorship, client work, pricing, and the record-keeping each of them needs." },
  { title: "Photography", text: "Camera handling, light, framing, and shooting in the field - stills that carry information as well as mood." },
  { title: "Videography", text: "Planning a shoot, recording clean audio, moving the camera with purpose, and coming back with footage that can actually be cut together." },
  { title: "Editing", text: "Assembling a story from rushes: pacing, sound, colour, and delivering the versions each channel needs." },
  { title: "Graphic Design", text: "Layout, type, and colour for the posters, thumbnails, and templates a page or a campaign runs on." },
  { title: "Motion Graphics", text: "Titles, lower thirds, and animated explainers that make a film easier to follow." },
];

export const metadata = pageMetadata("Media & Content Creation Training in Nepal", "Explore social media, content creation, journalism, photography, video editing, and creative business training with Najikko Sathi Media in Kathmandu, Nepal.", "/training");

export default async function TrainingPage() {
  const [services, categories, questions] = await Promise.all([
    getServiceViews(),
    getCategoryViews(),
    getFaqPairs("training", [
      ["Can an organization request team training?", "Yes. Capacity building for corporate teams, journalists, and creative professionals is part of the portfolio. Share the team's responsibilities and learning needs."],
      ["Are there scheduled batches or certificates?", "A fixed calendar, accreditation, and certification terms are not published here. Contact the team to confirm the current program details before enrolling."],
      ["How do I choose a program?", "Start with the task you want to perform: managing social pages, creating content, reporting, producing visual work, or developing a creative business idea. The individual program pages explain each scope."],
    ]),
  ]);
  const category = categories.find((item) => item.id === "training");
  return <>
    <PageHero eyebrow="Training & capacity building" title="Learn the skills behind meaningful media." description="Practical programs for people who write, report, film, design, and manage digital communication. Start with the skill you want to build." path="/training" label="Training" category={category}><Link className="hero-cta" prefetch={false} href="/contact?service=Training">Ask about a program <ArrowRight aria-hidden="true" /></Link></PageHero>
    <section className="content-section"><div className="site-container"><SectionHeading kicker="Learning with purpose" title="Build confidence through practice." description="Training is scoped around the learners, their starting point, and the work they need to do. Individuals, corporate teams, journalists, and creative professionals can discuss a program that fits their goals." /><div className="values-grid">{[{ icon: BookOpen, title: "Understand the fundamentals", text: "Connect the tools with the principles behind clear communication, ethical reporting, and purposeful creative work." }, { icon: Camera, title: "Put ideas into practice", text: "Work through practical exercises in the chosen discipline, using an agreed set of tools and learning objectives." }, { icon: Users, title: "Learn around your needs", text: "Discuss group experience, preferred language, devices, and relevant examples when planning the sessions." }].map(({ icon: Icon, title, text }) => <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
    <section className="content-section related-section"><div className="site-container"><SectionHeading kicker="What we teach" title="Eleven subjects. One practical foundation." description="Take a single subject or combine several into a longer program. Every subject is taught around exercises you complete and keep." /><TopicGrid items={trainingSubjects} /></div></section>
    <section className="content-section"><div className="site-container"><SectionHeading kicker="Choose your direction" title="Five programs. Practical possibilities." /><ServiceCards services={services.filter((service) => service.category.id === "training")} /></div></section>
    <section className="content-section process-section"><div className="site-container"><SectionHeading kicker="Plan a program" title="Start with what you want to be able to do." /><ProcessSteps steps={[["Share your goal", "Tell us the topic, current experience, group size, and preferred learning format."], ["Agree on the program", "Discuss modules, practical requirements, session duration, availability, and fees."], ["Learn and apply", "Use guided exercises to connect the learning with the work you want to create."]]} /></div></section>
    <MediaShowcase mediaKey="training" title="Learning & practice" />
    <section className="content-section"><div className="site-container faq-grid"><SectionHeading kicker="Training questions" title="Make room for learning." /><Questions items={questions} /></div></section>
    <ContactCta title="Tell us what you want to learn." service="Training" />
  </>;
}
