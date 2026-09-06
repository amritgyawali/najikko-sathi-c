/**
 * Short interface fragments, form placeholders, and the pieces of copy that
 * sit between two interpolated values in the markup.
 */
export const misc: Record<string, string> = {
  // Search
  Open: "खोल्नुहोस्",
  Service: "सेवा",
  Page: "पृष्ठ",
  Offer: "अफर",
  'Try "documentary" or "training"': "जस्तै “वृत्तचित्र” वा “तालिम”",
  "Try a different word.": "अर्को शब्द प्रयास गर्नुहोस्।",
  result: "नतिजा",
  results: "नतिजा",

  // 404
  "This address does not match a page on our website. Explore our service portfolio or return home.":
    "यो ठेगाना हाम्रो वेबसाइटको कुनै पृष्ठसँग मिल्दैन। हाम्रो सेवा पोर्टफोलियो हेर्नुहोस् वा गृहपृष्ठमा फर्कनुहोस्।",

  // Fragments that sit between interpolated values
  "· VAT": "· मु.अ.कर",
  "/": "/",

  // Announcement tones and small badges
  Announcement: "सूचना",
  New: "नयाँ",
  Featured: "विशेष",

  // Dates and numbers
  January: "जनवरी",
  February: "फेब्रुअरी",
  March: "मार्च",
  April: "अप्रिल",
  May: "मे",
  June: "जुन",
  July: "जुलाई",
  August: "अगस्ट",
  September: "सेप्टेम्बर",
  October: "अक्टोबर",
  November: "नोभेम्बर",
  December: "डिसेम्बर",
};

const MONTHS: Record<string, string> = {
  January: "जनवरी",
  February: "फेब्रुअरी",
  March: "मार्च",
  April: "अप्रिल",
  May: "मे",
  June: "जुन",
  July: "जुलाई",
  August: "अगस्ट",
  September: "सेप्टेम्बर",
  October: "अक्टोबर",
  November: "नोभेम्बर",
  December: "डिसेम्बर",
};

/** Swaps the month inside a formatted date, leaving the day and year alone. */
function translateMonths(value: string): string {
  return value.replace(/[A-Za-z]+/g, (word) => MONTHS[word] ?? word);
}

/**
 * Copy that is assembled from a template at render time. Each pattern captures
 * the interpolated part, translates it on its own, and rebuilds the sentence in
 * Nepali word order.
 */
export const patterns: [RegExp, (...parts: string[]) => string][] = [
  // A page title carries the site name after a pipe on every page but the
  // homepage. Split it first, and lazily, so each half is translated on its own
  // rather than being swallowed by one of the sentence templates below.
  [/^(.+?) \| (.+)$/, (left, right) => `${left} | ${right}`],

  // The address line in the footer runs the address, the label, and the number
  // together in one element.
  [/^(.+) · VAT (.+)$/, (address, number) => `${address} · मु.अ.कर ${number}`],

  // Page and section headings
  [/^A closer look at (.+)$/, (value) => `${value}: नजिकबाट`],
  [/^Let’s talk about (.+)\.$/, (value) => `${value}बारे कुरा गरौं।`],
  [/^Let's talk about (.+)\.$/, (value) => `${value}बारे कुरा गरौं।`],
  [/^(.+) in pictures & film$/, (value) => `तस्बिर र फिल्ममा ${value}`],
  [
    /^Photographs and films from (.+) projects we have delivered\.$/,
    (value) => `हामीले सम्पन्न गरेका ${value} परियोजनाका तस्बिर र फिल्म।`,
  ],
  [/^(.+) in Nepal$/, (value) => `नेपालमा ${value}`],
  [/^(.+) · Kathmandu, Nepal$/, (value) => `${value} · काठमाडौं, नेपाल`],
  [/^Explore (.+)$/, (value) => `${value} हेर्नुहोस्`],
  [/^Visit (.+)$/, (value) => `${value} हेर्नुहोस्`],
  [/^Read (.+)$/, (value) => `${value} पढ्नुहोस्`],
  [/^Discuss (.+)$/, (value) => `${value}बारे छलफल गरौं`],

  // Accessible names built from the business name
  [/^(.+) home$/, (value) => `${value} गृहपृष्ठ`],
  [/^Contact (.+)$/, (value) => `${value}लाई सम्पर्क गर्नुहोस्`],
  [/^(.+) media commitments$/, (value) => `${value}का मिडिया प्रतिबद्धता`],
  [/^(.+) contact links$/, (value) => `${value}का सम्पर्क विवरण`],

  // Search results
  [/^Nothing matched "(.+)"\. Try a different word\.$/, (value) => `“${value}” सँग केही मिलेन। अर्को शब्द प्रयास गर्नुहोस्।`],
  [/^(\d+) results? for "(.+)"$/, (count, value) => `“${value}” का लागि ${count} नतिजा`],

  // Offers and footer
  [/^Available until (.+)$/, (value) => `${translateMonths(value)} सम्म उपलब्ध`],
  [/^© (\d{4}) (.+) All Rights Reserved\.$/, (year, name) => `© ${year} ${name} सर्वाधिकार सुरक्षित।`],
  [
    /^(.+) is a media house focused on truthful information, meaningful storytelling, production, advertising, training, and social responsibility\.$/,
    (name) =>
      `${name} सत्य सूचना, अर्थपूर्ण कथावाचन, प्रोडक्सन, विज्ञापन, तालिम र सामाजिक उत्तरदायित्वमा केन्द्रित मिडिया हाउस हो।`,
  ],
];
