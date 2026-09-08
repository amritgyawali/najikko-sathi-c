/**
 * The mission statement on the front page.
 *
 * Held here so the website, the seed and the migration that writes it into
 * Site → Homepage & page copy all read the same words. The introduction band
 * prints the first two paragraphs in its own fields and the rest from
 * `aboutParagraphs`, which is why this is split rather than one block of text.
 *
 * Editing it in the dashboard replaces what is written here.
 */

export const missionQuote =
  "To give true and responsible news that helps the people of Nepal.";

export const missionParagraphs = [
  "At Najik Ko Sathi Media our mission is simple but very meaningful. To give true and responsible news that helps the people of Nepal. As a media company we believe that information can change things make democracy stronger and bring people together.",
  "We know there are difficulties in being a news platform but we are still focused on keeping good journalism and being open. Our team works hard to make sure that every story we share shows the truth gives both sides and treats our audience with respect.",
  "Najik Ko Sathi Media is more than a news place. It is a voice for the people, a place for conversation and a link, between society and the government. We will keep trying things changing when needed and growing while staying real with our beliefs of being honest and taking responsibility.",
  "Thank you for believing in us as your news and information source. Together let us create an informed and stronger Nepal.",
] as const;

/** The first two paragraphs, which have fields of their own. */
export const [missionBody, missionBodySecondary] = missionParagraphs;

/** Everything after them, shaped for the `aboutParagraphs` array in the CMS. */
export const missionExtraParagraphs = missionParagraphs
  .slice(2)
  .map((text) => ({ text }));
