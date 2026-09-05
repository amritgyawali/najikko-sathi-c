export type ServiceCategory = "production" | "social-media" | "training" | "research";

export const categories = [
  { id: "production", title: "Production work", label: "Production", description: "Full-service photography and videography for visual storytelling, corporate branding, and public messaging.", href: "/production" },
  { id: "social-media", title: "Social media handling", label: "Social media", description: "Digital presence management, branding, audience engagement, and performance marketing across major digital platforms.", href: "/services#social-media" },
  { id: "training", title: "Training programs", label: "Training", description: "Practical capacity building for individuals, corporate teams, journalists, and creative professionals.", href: "/training" },
  { id: "research", title: "Research & development", label: "Research", description: "Field research, media monitoring, data collection, and development initiatives with public and civil society stakeholders.", href: "/services#research" },
] as const;

export type Service = {
  slug: string;
  category: ServiceCategory;
  title: string;
  shortTitle: string;
  description: string;
  metaDescription: string;
  intro: string;
  audience: string;
  deliverables: string[];
  preparation: string;
  steps: [string, string][];
  faq: [string, string][];
};

// Service scope follows the user-provided Service Portfolio & Scope of Work PDF.
// Planning guidance expands that scope without inventing clients, results, or credentials.
export const servicePortfolio: Service[] = [
  {
    slug: "biography-videos", category: "production", title: "Biography video production", shortTitle: "Biography Videos",
    description: "In-depth video and photo biographies that capture lifetime achievements, personal narratives, and the legacy of leaders, key figures, and families.",
    metaDescription: "Preserve a life story with biography videos and photography by Najikko Sathi in Kathmandu. Explore interviews, archival storytelling, and production planning.",
    intro: "A biography starts with a person, not a camera. We bring interviews, personal photographs, documents, and present-day footage together to help tell a life story with context. The format can serve a personal archive, a public profile, or a milestone presentation.",
    audience: "Individuals, families, community leaders, and organizations documenting the people behind their work.",
    deliverables: ["Biographical research and interview outline", "Filmed interviews and supporting photography", "An edited life story using agreed archival material", "Screening or digital delivery formats agreed in the brief"],
    preparation: "Share a short life timeline, the intended audience, available photographs, and the people who can contribute. Confirm permission to use archival material and agree on sensitive topics before filming.",
    steps: [["Listen", "Identify the milestones, voices, and memories that give the story its shape."], ["Document", "Plan interviews and record the people, places, and objects connected to the story."], ["Bring together", "Build the narrative, review factual details, and prepare the agreed final film."]],
    faq: [["Can existing family photos be included?", "Yes. Photographs and archival records can support the narrative when you have permission to use them. Their condition and resolution affect how they can appear in the final film."], ["How long should a biography film be?", "Length depends on the depth of the story and where it will be shown. Share the intended screening or platform so we can discuss a suitable scope."]],
  },
  {
    slug: "documentary-film-production", category: "production", title: "Documentary film production", shortTitle: "Documentary Films",
    description: "End-to-end documentary storytelling about social issues, cultural heritage, institutional milestones, and development projects.",
    metaDescription: "Plan a documentary in Nepal with Najikko Sathi, Kathmandu. Discover research, interviews, filming, and editing for cultural, social, and development stories.",
    intro: "A documentary gives audiences time to understand a subject through real experiences. We shape thematic films around research, interviews, and location footage, connecting individual voices with the wider issue. The story and its evidence guide the production.",
    audience: "Cultural organizations, development teams, institutions, and individuals with a real story to document.",
    deliverables: ["Research direction and documentary treatment", "Interview and location filming plan", "Documentary editing and narrative development", "Agreed versions for screenings and digital publication"],
    preparation: "Bring the central question, intended audience, locations, access requirements, and any existing reports. Identify contributors and discuss consent, translation, and review requirements early.",
    steps: [["Research", "Define the question and identify credible sources and contributors."], ["Film", "Gather interviews, observed moments, and contextual footage."], ["Shape", "Edit the material into an evidence-led story and review it for clarity."]],
    faq: [["Can a documentary cover a development project?", "Yes. The portfolio includes development projects and institutional milestones. The brief should distinguish the project's objectives, activities, and evidence of outcomes."], ["Are subtitles part of every project?", "Language versions and subtitles are agreed during scoping. Tell us the audience's languages and accessibility needs so they can be included in the proposal."]],
  },
  {
    slug: "advertisements-commercials", category: "production", title: "Advertisements & commercials", shortTitle: "Advertisements",
    description: "Promotional videos, television commercials, digital ad campaigns, and commercial photography tailored to brand awareness and market reach.",
    metaDescription: "Explore commercial video and advertising production in Kathmandu: TV commercials, promotional films, digital campaign creative, and brand photography.",
    intro: "A clear commercial connects a recognizable need with a useful message. We develop visual advertising around the product, audience, and placement, from a television concept to a short digital promotion. Production decisions follow the campaign's purpose and format.",
    audience: "Brands, businesses, and organizations preparing product launches, awareness campaigns, or promotional content.",
    deliverables: ["Campaign concept and script direction", "Commercial filming and product photography", "Edited advertising creative", "Placement-specific formats agreed before production"],
    preparation: "Share brand guidelines, product details, substantiation for claims, audience, placements, and the campaign window. Separate the creative production budget from paid distribution costs when planning.",
    steps: [["Define the message", "Agree on the audience, offer, and action the campaign should communicate."], ["Produce", "Translate the approved concept into photography and filmed material."], ["Prepare for release", "Edit and adapt the creative to the agreed advertising placements."]],
    faq: [["Do you create both TV and digital ads?", "The service portfolio covers TV commercials and digital advertising creative. Tell us the intended placements so duration, framing, and delivery specifications can be planned."], ["Does production include advertising spend?", "Media placement and advertising spend need to be agreed separately in the proposal. The production brief defines the content to be created."]],
  },
  {
    slug: "corporate-profile-making", category: "production", title: "Corporate & organizational profiles", shortTitle: "Profile Making",
    description: "Structured video summaries, photographic showcases, and audiovisual presentations that communicate an organization's identity and capacity.",
    metaDescription: "Present your organization with corporate profile videos, photography, and audiovisual presentations from Najikko Sathi Media in Kathmandu, Nepal.",
    intro: "An organizational profile should help someone understand who you are, what you do, and how your work is carried out. We structure those essentials into visual material that can support meetings, presentations, websites, and public introductions.",
    audience: "Companies, institutions, NGOs, and teams that need a clear visual introduction to their work.",
    deliverables: ["A structured organizational story and script", "Workplace, team, or project photography", "A corporate profile film or audiovisual presentation", "An agreed set of presentation and publication assets"],
    preparation: "Provide your organization overview, approved facts, brand assets, work locations, and intended uses. Select the people and activities that best demonstrate your capacity without relying on unsupported claims.",
    steps: [["Understand", "Identify the organization's purpose, activities, and audience."], ["Show", "Capture people, work, and facilities that support the profile."], ["Present", "Edit a coherent introduction and review names, figures, and claims."]],
    faq: [["How is a profile different from an advertisement?", "A profile explains the organization and its capabilities. An advertisement usually centers on a specific product, offer, or campaign action."], ["Can an existing profile be updated?", "Share the existing material and the changes needed. Usable assets, permissions, and the new scope determine what can be retained."]],
  },
  {
    slug: "digital-profile-creation", category: "social-media", title: "Digital biography & profile creation", shortTitle: "Digital Profiles",
    description: "Personal and organizational profiles for Facebook, YouTube, Instagram, and LinkedIn, with consistent biographies, brand identity, and positioning.",
    metaDescription: "Build consistent personal and business profiles across Facebook, YouTube, Instagram, and LinkedIn with Najikko Sathi's digital profile service in Nepal.",
    intro: "Your profile is often a person's first introduction to your work. We help organize the biography, visual identity, contact information, and channel descriptions so audiences can understand the same story wherever they find you.",
    audience: "Professionals, creators, businesses, and organizations establishing or refreshing their digital presence.",
    deliverables: ["Personal or organizational biography copy", "Channel-specific profile descriptions", "Brand and contact consistency review", "Recommendations for profile imagery and positioning"],
    preparation: "Bring existing profile links, approved brand material, a concise description of your work, and the audience you want to serve. Use platform role-based access when support requires account access.",
    steps: [["Review", "Check the existing identity and the purpose of each channel."], ["Write", "Develop biographies and descriptions that fit each platform."], ["Align", "Review profile visuals, contact details, and links for consistency."]],
    faq: [["Which platforms are included?", "The portfolio covers Facebook, YouTube, Instagram, and LinkedIn. The specific channels and number of profiles are agreed in the brief."], ["Is a digital profile the same as a corporate profile video?", "No. This service focuses on social account identity and descriptions. Corporate profile making is a separate production service for filmed and photographic presentations."]],
  },
  {
    slug: "media-consulting", category: "social-media", title: "Media & communication consulting", shortTitle: "Media Consulting",
    description: "Strategic guidance on communication channels, public relations, crisis communication, digital positioning, and targeted public outreach.",
    metaDescription: "Discuss media strategy, public relations, digital positioning, and public outreach with Najikko Sathi Media's communication consulting team in Kathmandu.",
    intro: "Communication works better when the audience, message, and channel have a clear relationship. Consulting creates space to examine that relationship before committing to a campaign. It can support an upcoming announcement, a digital presence review, or an ongoing communication challenge.",
    audience: "Organizations, leaders, and communication teams seeking a clearer public communication approach.",
    deliverables: ["Communication needs and channel review", "Audience and message recommendations", "Public relations and outreach direction", "A prioritized set of practical next steps"],
    preparation: "Describe the decision you need to make, the audiences involved, previous communication, and any time constraints. For sensitive situations, agree what information can be shared and who approves public statements.",
    steps: [["Listen", "Understand the organization, context, and communication challenge."], ["Assess", "Review channels, audience needs, and current messaging."], ["Recommend", "Set out options and a practical communication direction."]],
    faq: [["Can consulting happen before production?", "Yes. Consulting can help define the audience, message, and formats before a production or social campaign begins."], ["Does consulting include campaign execution?", "Consulting and execution are scoped separately. The proposal should identify whether it includes advice only or also content creation and ongoing management."]],
  },
  {
    slug: "facebook-boosting-digital-campaigns", category: "social-media", title: "Facebook boosting & digital campaigns", shortTitle: "Digital Campaigns",
    description: "Targeted ad placement, audience segmentation, post boosting, and performance analysis for digital reach and conversion campaigns.",
    metaDescription: "Plan Facebook boosting and paid digital campaigns with Najikko Sathi in Kathmandu. Explore audience selection, creative coordination, and performance reporting.",
    intro: "Paid reach needs a defined purpose. We connect the campaign objective with an audience, suitable creative, and a way to evaluate results. Planning includes what happens after someone clicks, so the advertisement and its destination work together.",
    audience: "Businesses and organizations planning paid awareness, engagement, or inquiry campaigns.",
    deliverables: ["Campaign objective and audience segmentation", "Post boosting or advertising setup within agreed access", "Creative and landing destination coordination", "Performance and return-on-investment analysis where measurable"],
    preparation: "Share the campaign objective, target locations, proposed budget, creative assets, and destination link. Advertising spend, management fees, measurement access, and reporting intervals should be agreed separately.",
    steps: [["Plan", "Define the objective, audience, budget, and meaningful measurements."], ["Launch", "Prepare approved creative, placements, and the campaign destination."], ["Review", "Interpret results and identify changes for the next campaign cycle."]],
    faq: [["Can you guarantee a number of sales or leads?", "No. Results depend on the offer, audience, creative, budget, and platform conditions. The proposal should define the objective and reporting approach without promising a fixed outcome."], ["Is the ad budget included in the service fee?", "The advertising budget and service fee must be identified in the proposal. Confirm both before any paid campaign is launched."]],
  },
  {
    slug: "social-media-advertisements", category: "social-media", title: "Social media advertisement creative", shortTitle: "Social Media Ads",
    description: "Visual ads, banner graphics, short promotional reels, and copywriting designed for digital feeds and social publishing.",
    metaDescription: "Create social media banners, promotional reels, visual ads, and campaign copy with Najikko Sathi Media in Kathmandu. Plan creative for your audience and channels.",
    intro: "A social advertisement has limited space to make its message clear. We develop visual and written creative around one understandable idea, adapting the presentation to the feed, story, or short video format where the audience will encounter it.",
    audience: "Brands, creators, and communication teams needing campaign-ready digital creative.",
    deliverables: ["Campaign visual direction and copywriting", "Social advertising graphics and banners", "Short promotional reels within the agreed scope", "Creative adaptations for selected channels"],
    preparation: "Provide the offer, approved claims, brand guidelines, channel list, and destination link. Identify which formats, languages, quantities, and review rounds are needed before production begins.",
    steps: [["Clarify", "Choose the audience, message, and call to action."], ["Create", "Develop visual concepts, copy, and short-form material."], ["Adapt", "Prepare the agreed sizes and versions for publishing."]],
    faq: [["Can you make reels and static banners together?", "Yes. Both appear in the service portfolio. The brief should list the number and type of assets needed for each platform."], ["Is paid distribution included?", "Creative production and paid campaign management are separate scopes. The digital campaigns service can be discussed if distribution support is also needed."]],
  },
  {
    slug: "event-coverage-management", category: "social-media", title: "Event coverage & media management", shortTitle: "Event Coverage",
    description: "Live digital streaming, real-time social updates, multimedia publishing, and media coordination for events, conferences, and celebrations.",
    metaDescription: "Plan event photography, video, live streaming, social updates, and media coordination with Najikko Sathi Media in Kathmandu, Nepal.",
    intro: "An event has moments that cannot be repeated. Coverage planning connects the running order, the people involved, and the channels where audiences will follow along. We help organize media coverage before, during, and after the event.",
    audience: "Event organizers, institutions, conference teams, and organizations hosting public gatherings.",
    deliverables: ["Event coverage and media coordination plan", "Photography and video coverage within the brief", "Live streaming and real-time updates when commissioned", "Multimedia publishing and event highlights"],
    preparation: "Share the date, venue, agenda, expected coverage hours, platform access, and key moments. For live streaming, venue internet, power, sound access, and permissions need to be checked in advance.",
    steps: [["Coordinate", "Map the running order, responsibilities, and coverage priorities."], ["Cover", "Capture and publish agreed moments during the event."], ["Compile", "Prepare the selected media and post-event highlights."]],
    faq: [["Can you support live streaming?", "Live digital streaming is included in the portfolio. Feasibility depends on the venue, internet connection, equipment plan, and platform requirements."], ["Does this include all event logistics?", "This service focuses on media coordination and coverage. Venue booking, catering, and other event logistics are not implied and would need a separate agreement."]],
  },
  {
    slug: "social-media-strategy-training", category: "training", title: "Social media handling & strategy training", shortTitle: "Social Media Training",
    description: "Practical training in page administration, platform-aware content planning, analytics, scheduling, and community engagement.",
    metaDescription: "Explore practical social media training in Kathmandu: page administration, content scheduling, audience engagement, and analytics with Najikko Sathi.",
    intro: "Managing a page means more than posting regularly. This program connects the purpose of a channel with content planning, administration, and interpretation of audience response. Exercises can be shaped around the accounts and responsibilities learners already have.",
    audience: "Page administrators, small business teams, communication staff, and people beginning social media work.",
    deliverables: ["Page administration and channel planning exercises", "Content scheduling and engagement practice", "Analytics interpretation and reporting fundamentals", "Discussion of platform discovery and content optimization"],
    preparation: "Tell us the platforms you use, the group's experience, and the work learners need to perform. Discuss device access, practice accounts, preferred language, and session format when requesting a program.",
    steps: [["Set goals", "Identify the team's channel responsibilities and current skill gaps."], ["Practice", "Work through planning, publishing, and engagement tasks."], ["Interpret", "Use example analytics to connect audience response with the next content decision."]],
    faq: [["Is this suitable for beginners?", "The training can be scoped around the group's starting point. Share prior experience so the content and practical exercises can be discussed."], ["Are dates and fees published?", "Dates, duration, group size, and fees are confirmed through an inquiry. The website does not list a fixed training calendar."]],
  },
  {
    slug: "content-creation-training", category: "training", title: "Content creation training", shortTitle: "Content Creation Training",
    description: "Hands-on learning for visual, written, and video content that communicates clearly with digital audiences.",
    metaDescription: "Develop writing, visual storytelling, and video content skills through Najikko Sathi's practical content creation training in Kathmandu, Nepal.",
    intro: "Useful content begins with an idea the audience can recognize. This program develops that idea through writing, visual choices, and video structure. Learners can explore how the same message changes when it becomes a post, a graphic, or a short video.",
    audience: "Aspiring creators, communication teams, entrepreneurs, and professionals producing digital content.",
    deliverables: ["Audience and idea development exercises", "Writing and visual storytelling practice", "Short video content planning", "Review and refinement of practice content"],
    preparation: "Share examples of the content you want to produce, current experience, available devices, and preferred platforms. A clear learning objective helps define the balance between writing, visuals, and video.",
    steps: [["Find the idea", "Start with an audience need and a clear message."], ["Make", "Develop practice content in the selected formats."], ["Refine", "Review clarity, structure, and suitability for the intended channel."]],
    faq: [["Is content creation only about video?", "No. The program covers written, visual, and video content. The balance between those formats is agreed around the learners' goals."], ["Do learners need professional equipment?", "Device requirements depend on the selected exercises. Explain what equipment is available when discussing the program so the practical scope can be matched to it."]],
  },
  {
    slug: "journalism-basics-training", category: "training", title: "Journalism basics training", shortTitle: "Journalism Basics",
    description: "Foundations of news gathering, interviewing, ethical reporting, press release writing, and investigative storytelling.",
    metaDescription: "Learn news gathering, interviewing, ethical reporting, press release writing, and investigative storytelling through journalism training with Najikko Sathi.",
    intro: "Reporting begins with questions and the responsibility to check the answers. This program introduces how to find information, interview with purpose, distinguish evidence from opinion, and organize a clear story. Ethical choices are part of the reporting process throughout.",
    audience: "Aspiring journalists, students, community reporters, and staff who prepare public information.",
    deliverables: ["News gathering and source assessment fundamentals", "Interview preparation and practice", "Ethical reporting and story structure exercises", "Press release writing and investigative storytelling basics"],
    preparation: "Describe the group's background and the kind of reporting or writing they intend to do. Bring sample stories or a topic of interest to help frame practical exercises.",
    steps: [["Question", "Identify what makes a topic relevant and which facts need checking."], ["Report", "Practice gathering information and preparing purposeful interviews."], ["Write", "Organize the material with attention to accuracy, attribution, and fairness."]],
    faq: [["Does the program cover reporting ethics?", "Yes. Ethical reporting is part of the published scope, alongside interviewing, news gathering, and writing."], ["Is investigative reporting included?", "The program introduces investigative storytelling fundamentals. An advanced or specialized investigation module would need its own agreed scope."]],
  },
  {
    slug: "creative-technical-production-training", category: "training", title: "Creativity & technical production training", shortTitle: "Technical Production Training",
    description: "Practical modules in videography, photography, video editing, graphic design, and motion graphics.",
    metaDescription: "Explore videography, photography, video editing, graphic design, and motion graphics training with Najikko Sathi Media in Kathmandu, Nepal.",
    intro: "Creative intention and technical skill work together. These modules focus on the tools and decisions behind an image, an edit, or a moving graphic. The selected discipline and learners' experience determine the practical work, equipment, and pace.",
    audience: "Creative professionals, aspiring camera operators, editors, designers, and teams building in-house production skills.",
    deliverables: ["Videography and photography practice", "Video editing workflow exercises", "Graphic design fundamentals or focused modules", "Motion graphics practice matched to learner experience"],
    preparation: "Choose the disciplines you want to cover and describe current experience. Confirm software, licensing, computers, camera access, and the level of practical work before the training plan is finalized.",
    steps: [["Choose a focus", "Identify the discipline and practical outcome for the module."], ["Build skills", "Work through tool use and creative decisions with guided exercises."], ["Apply", "Develop and review a small production task in the chosen discipline."]],
    faq: [["Do I need to take all five disciplines?", "The portfolio lists videography, photography, video editing, graphic design, and motion graphics as modules. Discuss a focused module or a combined program based on your goals."], ["Which editing or design software is used?", "Software is confirmed when the program is scoped. Share the tools you already use and any device or licensing constraints."]],
  },
  {
    slug: "idea-monetization-training", category: "training", title: "Idea monetization training", shortTitle: "Idea Monetization",
    description: "Explore ways to develop creative projects, YouTube channels, digital content, and media skills through advertising, sponsorship, and affiliate models.",
    metaDescription: "Explore creative business models for content and media skills through Najikko Sathi's idea monetization training, including sponsorship and digital channels.",
    intro: "A creative idea needs both an audience and a workable way to sustain the effort. This program examines how content, skills, and distribution connect with potential revenue models. It focuses on evaluating options and planning a next step, without promising earnings.",
    audience: "Creators, freelancers, media learners, and people exploring how to develop a creative project into ongoing work.",
    deliverables: ["Creative idea and audience mapping", "Overview of advertising revenue models", "Sponsorship and affiliate channel discussion", "A practical outline for testing a media business idea"],
    preparation: "Bring your idea, current content or channel, target audience, and available time. Platform eligibility and commercial terms change, so relevant requirements should be checked during the program.",
    steps: [["Define value", "Identify what the idea offers and who would use or support it."], ["Explore models", "Compare suitable revenue approaches and their requirements."], ["Plan a test", "Choose an achievable next step and a way to learn from the response."]],
    faq: [["Does the training guarantee income?", "No. Income depends on audience demand, execution, eligibility, and many other factors. The program explores models and planning rather than guaranteed financial outcomes."], ["Is the program only for YouTube creators?", "No. The scope includes creative projects, digital content, and media skills as well as YouTube channels."]],
  },
  {
    slug: "source-research", category: "research", title: "Source research & field studies", shortTitle: "Source Research",
    description: "Background investigation, primary and secondary data gathering, field studies, stakeholder mapping, and policy review for media and development projects.",
    metaDescription: "Explore source research, field studies, stakeholder mapping, data gathering, and policy review with Najikko Sathi for media and development projects in Nepal.",
    intro: "A strong story or project starts with knowing what is established and what still needs to be investigated. Source research brings background material, relevant voices, and field information into an organized foundation for the next decision.",
    audience: "Media producers, development teams, institutions, and organizations preparing evidence-informed communication or projects.",
    deliverables: ["Background and secondary source review", "Primary data gathering and field study planning", "Stakeholder mapping", "Policy review and organized research findings"],
    preparation: "Define the research question, geographic scope, available reports, and how findings will be used. Discuss access, participant consent, data handling, methods, and reporting expectations before fieldwork.",
    steps: [["Frame", "Agree on the question, scope, and suitable information sources."], ["Gather", "Review documents and collect agreed field or stakeholder information."], ["Organize", "Distinguish findings, source limitations, and questions that remain open."]],
    faq: [["Can research support a documentary?", "Yes. Background research and source gathering can inform documentary development. The research and production scopes should specify how material will be shared and used."], ["Do you use both primary and secondary sources?", "Both are included in the portfolio. The method depends on the question, available evidence, access, and agreed project scope."]],
  },
  {
    slug: "government-ngo-collaboration", category: "research", title: "Government & NGO collaboration", shortTitle: "Development Collaboration",
    description: "Research and communication support for government bodies, NGOs, INGOs, and civil society: baseline studies, impact assessments, awareness campaigns, and community initiatives.",
    metaDescription: "Discuss baseline studies, impact assessment reports, awareness campaigns, and community research with Najikko Sathi for government and NGO projects in Nepal.",
    intro: "Development communication needs to connect project goals with the experiences of the people involved. This service supports scoped research and communication work with public institutions and civil society. Methods, responsibilities, and the use of findings are agreed for each project.",
    audience: "Federal and local government teams, NGOs, INGOs, and civil society organizations planning research or public communication.",
    deliverables: ["Baseline study and research support", "Impact assessment reporting within an agreed methodology", "Awareness campaign development", "Communication support for community development initiatives"],
    preparation: "Share the terms of reference, target communities, project geography, reporting requirements, and procurement process. Identify approvals, local coordination, accessibility needs, and safeguarding requirements relevant to the assignment.",
    steps: [["Align", "Understand the terms of reference, stakeholders, and project purpose."], ["Collaborate", "Coordinate agreed research or communication activities with the project team."], ["Report", "Present findings or campaign material with transparent sources and limitations."]],
    faq: [["Does this page list existing institutional partners?", "No. It describes the types of collaboration available. Specific clients or partnerships are not claimed on this page."], ["Can you respond to a defined scope of work?", "Send the terms of reference and relevant requirements to discuss fit, deliverables, and a project proposal."]],
  },
];

export function getService(slug: string) {
  return servicePortfolio.find((service) => service.slug === slug);
}
