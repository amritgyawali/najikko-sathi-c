/**
 * The messages the leadership carousel ships with.
 *
 * These are the words supplied for the front page. They live here rather than
 * inside the carousel so three things can read the same copy: the website
 * (until the messages are written in the dashboard), the seed, and the
 * migration that puts them into Site → Homepage & page copy on a database that
 * already exists.
 *
 * Editing them in the dashboard replaces what is written here; emptying the
 * list there brings this back.
 *
 * Each message carries its own heading, which is what the carousel shows in
 * place of the section heading - so the heading moves on with the message
 * rather than standing still above it.
 *
 * Each also carries its own Nepali. The rest of the website is written in
 * English and turned into Nepali against a phrase book, but that is no way to
 * handle a message in someone's own words, so the band is exempt: what is
 * written in the Nepali fields is exactly what a Nepali reader sees, and
 * anything left empty stays in English rather than being guessed at.
 *
 * The English and the Nepali below are one message, not two. It was supplied as
 * a pair, and it is stored as a pair, so pressing ने changes the language of the
 * message a visitor is reading rather than moving them to a different slide.
 *
 * `name` is the company rather than a person: the message was supplied without
 * a signature. Putting the chairman's and the director's own names into
 * Site → Homepage & page copy replaces it.
 */

export type LeadershipMessageContent = {
  role: string;
  name: string;
  heading: string;
  message: string;
  roleNe: string;
  nameNe: string;
  headingNe: string;
  messageNe: string;
  photoUrl: string | null;
  photoAlt: string;
};

const COMPANY = "Najikko Sathi Media Pvt. Ltd.";
const COMPANY_NE = "नजिकको साथी मिडिया प्रा.लि.";

/** The message, in English. */
const messageEn = [
  "At Najiko Sathi Media Pvt. Ltd. Najiko Sathi Media always believes that media is more than information. Media is a tool that can inspire people teach people and bring people together. Najiko Sathi Media makes biography videos and documentaries that keep stories alive. Najiko Sathi Media also creates advertisements and digital campaigns that help brands reach their audiences. This work shows a commitment to creativity and responsibility.",
  "Najiko Sathi Media is just as committed to training and empowering the generation of communicators. Through programs in journalism, content creation, social media and technical production Najiko Sathi Media ensures that knowledge and skills are shared widely. This builds a foundation for the future of media in Nepal.",
  "Najiko Sathi Media journey also goes into consulting, research and collaboration. Najiko Sathi Media partners with individuals and organizations to turn ideas into ventures. Whether Najiko Sathi Media covers events, shapes profiles or guides campaigns Najiko Sathi Media is a trusted companion, in every step of communication.",
  "As Chairman I am proud of the work Najiko Sathi Media does and the values Najiko Sathi Media upholds. With your continued trust and support Najiko Sathi Media will keep striving to be a platform where truth, creativity and progress come together.",
].join("\n\n");

/** The same message, as written in Nepali rather than translated into it. */
const messageNe = [
  "नजिकको साथी मिडिया प्रा.लि. मा, हामी सञ्चार भनेको केवल सूचनाको प्रवाह मात्र होइन भन्नेमा विश्वास गर्छौं, यो मानिसहरूलाई जोड्ने, सिकाइको माध्यम बन्ने र प्रेरणा जगाउने शक्तिशाली साधन हो । हामी जीवनगाथा भिडियो र वृत्तचित्रमार्फत कथाहरूलाई जीवन्त राख्छौं भने, प्रभावकारी विज्ञापन र डिजिटल अभियानहरूद्वारा ब्रान्डहरूलाई सही दर्शकमाझ पुर्‍याउँछौं ।",
  "हामी उत्कृष्ट सिर्जना र उत्तरदायित्वमा मात्र सीमित छैनौं, नेपालको सञ्चार क्षेत्रको भविष्य सुदृढ पार्न पत्रकारिता, कन्टेन्ट सिर्जना, सोशल मिडिया र प्राविधिक उत्पादनका क्षेत्रमा नयाँ पुस्तालाई प्रशिक्षित र सशक्त बनाउन पनि उत्तिकै सक्रिय छौं ।",
  "हाम्रो यात्रा परामर्श, अनुसन्धान र सहकार्यसम्म फैलिएको छ । हामी व्यक्ति तथा संस्थाहरूसँग हातेमालो गर्दै विचारलाई मूर्त रूप दिन्छौं । घटनाको कभरेज होस्, प्रोफाइल निर्माण होस्, वा अभियानको मार्गदर्शन सञ्चारको हरेक पाइलामा हामी तपाईंको विश्वासयोग्य साथी हौं ।",
  "अध्यक्षको नाताले, म नजिकको साथी मिडियाले गरेका काम र अंगीकार गरेका मूल्यहरूप्रति गर्व महसुस गर्छु । तपाईंहरूको अटुट विश्वास र साथले हामीलाई सत्य, सिर्जना र प्रगतिको संगम स्थल बन्न सधैं प्रेरित गरिरहनेछ ।",
].join("\n\n");

export const leadershipMessages: LeadershipMessageContent[] = [
  {
    role: "Director's message",
    name: COMPANY,
    heading: "Media is more than information.",
    message: messageEn,
    roleNe: "अध्यक्षको सन्देश",
    nameNe: COMPANY_NE,
    headingNe: "सत्य, सिर्जना र प्रगतिको संगम।",
    messageNe,
    photoUrl: null,
    photoAlt: `Director, ${COMPANY}`,
  },
];

/** The words above the carousel, in both languages. */
export const LEADERSHIP_KICKER = "From our leadership";
export const LEADERSHIP_KICKER_NE = "हाम्रो नेतृत्वबाट";
export const LEADERSHIP_HEADING = "Messages from the people who guide our work.";
export const LEADERSHIP_HEADING_NE = "हाम्रो कामलाई मार्गदर्शन गर्नेहरूका सन्देश।";

/** The same messages, shaped for the `leadershipMessages` field in the CMS. */
export const leadershipMessageRows = leadershipMessages.map(
  ({ role, name, heading, message, roleNe, nameNe, headingNe, messageNe: ne }) => ({
    role,
    name,
    heading,
    message,
    roleNe,
    nameNe,
    headingNe,
    messageNe: ne,
  }),
);
