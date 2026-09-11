# Najikko Sathi Media Pvt. Ltd.

A responsive Next.js 16, React 19, and TypeScript website for Najikko Sathi Media in
Anamnagar, Kathmandu. The original homepage palette, typography, and visual language are
shared across all pages.

Content is managed through a full admin dashboard powered by
[Payload CMS 3](https://payloadcms.com), which runs inside this same app.

- Public site: `/`
- Admin dashboard: `/admin`

## What the dashboard controls

| Area | Where in the dashboard | Appears on |
| --- | --- | --- |
| Traffic, top pages, referrers, devices, enquiry queue | Dashboard home | - |
| Every page of the website: open it, edit it, add it to the dashboard, or build a new one | Dashboard home → Website pages | - |
| Every place a photo or film can go, filled or not | Dashboard home → Photos & films | - |
| The 16 services and their detail pages | Services → Services | `/services`, `/services/<slug>`, `/our-work`, and every discipline page |
| Service groupings | Services → Service categories | `/services` sections |
| News, blogs, commentary, investigations | Content → Posts | `/posts/<slug>`, and the pages chosen in **Where this appears** |
| Promotions and packages | Content → Offers | The pages chosen in **Where this appears** |
| Client testimonials, with an approval queue | Content → Reviews | Review bands on the pages chosen in **Where this appears** |
| Social responsibility films and photo albums | Content → Social responsibility | The pages chosen in **Where this appears** |
| Social work: photo albums and YouTube films, project by project | Content → Social Work | `/social-work`, and the pages chosen in **Where this appears** |
| Every page: its hero, its sections, their order and wording, its address, and whether it is on the website at all | Content → Website pages | Every page, and `/<slug>` for new ones |
| Questions and answers | Content → FAQs | The pages chosen in **Where this appears** |
| The people on the about page | Content → Team | The pages chosen in **Where this appears** |
| Advisers, patrons and friends of the house | Content → Well-wishers | The pages chosen in **Where this appears**, the front page to begin with |
| Photos, films and files | Content → Media | Wherever they are used, plus the pages chosen in **Where this appears** |
| The photo or film shown in each of those places | Content → Page media | Every hero photograph, showcase band and panel |
| Contact form messages, with triage and notes | Enquiries | Sent from `/contact` |
| Front page copy and imagery | Site → Homepage & page copy → Home | `/` |
| Chairman and director messages | Site → Homepage & page copy → Home - leadership | `/` |
| Headings above the service grid, the production band, the Right Sanchar band | Site → Homepage & page copy | `/services`, `/production`, `/right-sanchar` |
| Company logo, shown in the header and the media system wheel | Site → Site Settings | Every page |
| Navbar links, order and header button | Site → Navigation | Every page |
| Site-wide notice, with a schedule | Site → Announcement bar | Every page |
| Website colours, corner radius, heading font | Site → Appearance | Every page |
| The Nepali face, and where it is fetched from | Site → Appearance → Nepali type | Every page, while the site is read in Nepali |
| "We worked with": the client logos that slide across the front page | Content → Website pages → Home → Partner logos | `/` |
| Footer columns and links | Site → Footer | Every page |
| Company name, address, phones, VAT, SEO | Site → Site Settings | Every page |
| Old URLs redirected to new ones | Administration → Redirects | Applied by `proxy.ts` |
| Dashboard accounts, roles and approving sign-ups | Administration → Users | - |
| Daily copies of everything, and putting the site back to one | Administration → Backups | - |

### The homepage

The front page is the media system wheel, the introduction, the leadership
messages, the reviews and well-wishers bands, the "We worked with" logo band,
and the page's own photo and film. The wheel's six petals -
production, social media handling, training, research and development, IT, and
advertisement - each link to that discipline's page, and the company logo
uploaded in **Site → Site Settings** sits at its centre. Until a logo is
uploaded the centre falls back to the initials mark.

Each petal is a solid slab rather than a flat shape: a darkened copy of the
wedge sits behind the face, offset outwards, and the sliver showing between the
two is its side wall. A sheen runs down the face, and the whole ring stands on a
perspective stage.

The petals bloom out of the middle one after another when the page opens.
Pointing at one sets it off: the slab swings up out of the ring towards you,
tipping about its own edge, deepening as it comes and picking up a white rim,
while the wedge blows apart — a blast front in the petal's own outline running
outwards, and darts, splinters and chips thrown off its outer edge in the
petal's colour, tumbling as they go. Every piece is a shard; nothing round is
ever thrown. The other five give way, dim and tip back into the page, and the
logo in the middle picks up the colour of whichever petal is being read. A
burst is played once and taken off the wheel, so leaving mid-flight lets it
finish, and pointing at the same petal twice plays it twice. Someone who has
asked their browser for less motion gets the wheel with none of it — the petals
answer the pointer, and nothing is thrown.

In **Site → Homepage & page copy**, the kicker above the hero heading has no
wording of its own: it shows only while something is written in it. The hero
body, the hero button, and the introduction's eyebrow, heading and quotation
fall back to the site's own wording until they are first saved, but clearing
any of them and saving takes that line off the homepage rather than bringing
the old wording back.

The service grid, the production band, and the Right Sanchar band used to sit
on the homepage as well. They now open `/services`, `/production`, and
`/right-sanchar` respectively, and still read their copy from
**Site → Homepage & page copy**, so nothing an editor had written was lost when
they moved. Every tab there is named after the page it appears on — *Home -
hero*, *Home - about*, *Home - leadership*, *Services page*, *Production page*,
*Right Sanchar page* — so the dashboard never claims to be editing the front
page when the words come out somewhere else.

The **Home - leadership** tab holds the messages the carousel shows. The heading
is not fixed above it: it travels with the message, because each message carries
its own **Heading shown with this message**. A message left without one falls
back to the **Leadership heading** field. The messages ship signed with the
company rather than a person - put the chairman's and the director's own names
in the **Name** field.

**When it moves.** A message stays for five seconds, and then the carousel moves
on. It stops the moment a visitor points at it or tabs into it, and stays
stopped for as long as they are there. Stepping through with the arrows stops it
too. It only starts again after **ten seconds in which nobody has hovered over
it or touched it** — long enough to finish a paragraph without the page moving
under you.

**Nepali.** The rest of the website is written in English and turned into Nepali
against a phrase book, but a message in someone's own words is not something to
guess at, so this band is exempt: it is marked "do not translate" and shows only
what is written for it here. Role, name, heading and body each have a Nepali box
beside them, and so do the kicker and the fallback heading above them. Anything
left empty falls back to the English rather than to a machine translation, so a
blank field is a visible "not written yet", never a wrong sentence.

**Every section on every page works this way.** Wherever you can type a line of
copy in the dashboard, the Nepali for it is the box immediately to its right:
English on the left, Nepali on the right, in the same row of the form. That
covers every tab of **Site → Homepage & page copy** and every one of the
sections a page is built from in **Content → Website pages** — headings,
kickers, the line under a heading, lead paragraphs, body paragraphs, card
titles and text, tick lists, keyword chips, numbered steps, questions and
answers, button text, captions, the line shown when a list is empty — plus the
reusable questions in **Content → FAQs**. The Nepali box is tinted and set in
Devanagari, so the two columns are told apart at a glance.

None of it is required. A field you fill in is shown exactly as you typed it and
never machine-translated; a field you leave empty behaves precisely as it did
before — the English is shown, translated against the phrase book — so you can
hand-write as much or as little Nepali as you have time for, one line at a time,
and the page reads correctly at every point in between.

The one place the phrase book still helps is the photo band, whose heading is a
sentence built around what you wrote ("<name> in pictures & film"). There your
Nepali is one part of a sentence the phrase book already knows how to turn
round, so it is left to do that rather than printed as-is.

The English and the Nepali are two halves of one message, not two messages.
Pressing ने changes the language of what a visitor is reading; it does not move
them to a different slide.

Under the leadership messages sit two bands that fill themselves from the
dashboard, and both stay invisible until they have something to show:

- **Reviews**, from Content → Reviews. Only reviews you have ticked as
  **Approved** appear, so the band can be on the page while the moderation
  queue is still being worked through.
- **Well-wishers**, from Content → Well-wishers. Advisers, patrons and friends
  of the house: a portrait and a name are enough, and a line of goodwill is
  shown under them when one is written. Someone with no photograph is drawn as
  their initial, so the row stays even.

Under those sits **We worked with**, the band of client logos that slides across
the page. It is a section like any other, so Content → Website pages → Home →
**Partner logos** is where the names are typed, reordered, or removed. Each one
takes an optional logo and an optional website; a partner with no logo uploaded
yet is drawn as its own name, so the band reads correctly before the artwork
arrives. The row pauses while a visitor points at it, and stops moving
altogether for anyone whose system asks for reduced motion.

All of these are ordinary sections, so Content → Website pages → Home is where
you reorder them, reword their headings, or take one off the page - and any of
them can be added to another page from the same place.

The hero carries one button. Writing a label into **Second button** on the
front page hero adds a second one beside it, pointing at the Right Sanchar
address in Site settings; leaving it empty is what keeps it off.

### Every page is editable

Every page on this website is a document in **Content → Website pages**, and
everything on it - the hero at the top, the written sections, the card grids,
the numbered process, the questions, the photo and film band, the closing call
to action - is a *section* in a list you can rewrite, reorder, add to, or delete.

All of them are already there: Home, Services, Our Work, Social Work, Contact,
About Us, Production, Social Media Handling, Training, Research & Development,
IT, Advertisement, Right Sanchar, Writing, Offers, Search and the sign-up page. Each
one arrived holding exactly the copy it already shows, put there by a migration
(`migrations/20260906_110000_import_website_pages.ts`) so nobody has to find a
button before they can change a page. The copy each one ships with still lives
in `lib/page-defaults.ts`, which is what the page falls back to if its document
is deleted.

A page added to the site in code later needs importing once, which is what
**Add them to the dashboard** on the dashboard home does; `npm run sync:pages`
does the same from a terminal, and `npm run seed` does it for a fresh install.

From then on:

- **Edit** - open the page and change any section. Saving reaches the website on
  the next request.
- **Create** - **Build a new page** makes a page from the same sections. Give it
  a slug and publish it, and it is live at `/<slug>` with no deploy. Tick *show
  in navigation* to put it in the menu, and use the position number to say where.
- **Delete** - deleting a page you built removes it. Deleting one of the pages
  the site ships with puts that page back to the copy it shipped with, so the
  action is never destructive.
- **Take a page off the website** - set it back to **Draft**. The address stops
  answering, and the page leaves the menu and the sitemap. Publishing it puts it
  back.
- **Keep a page out of search results** - tick *keep out of search engines* under
  SEO. The page keeps working; it just stops being advertised.

A few sections read their content from where it is already written rather than
repeating it: the front page's hero, introduction and leadership messages, and
the production, services and Right Sanchar bands, all take their words from
**Site → Homepage & page copy**; the questions can take theirs from
**Content → FAQs**; the service grids list what is in **Content → Services**;
and the photo and film band shows the entry named in **Content → Page media**.
Each of those sections says so in the dashboard. The page still decides whether
the band appears at all and where.

### The dashboard home

Signing in lands on one screen that answers everything an owner opens this
dashboard for. A header greets whoever is signed in and says what is waiting;
under it, six figures - visits today, this week and this month, each against the
period before it, then new enquiries, reviews to approve and how ready the site
is to be found. Below that the screen is in tabs, and the tab you were last on is
the one you come back to.

**Overview** carries the traffic chart - seven, fourteen, thirty or ninety days,
with the period before it drawn behind so a rise or fall is visible rather than
guessed - beside everything waiting on you, then what changed lately across the
whole site and what is on the website by the number.

**Pages** is every page the website has, and every change that can be made to
one. Each page shows whether it is live, how many people read it last month, how
many sections it is built from, whether it has a picture, whether search engines
have anything to show for it, and when it last changed. Beside that: edit it,
open it, publish or take it off the website without leaving the list, and one
link per part of it that can be changed - its sections, its search listing, its
photograph, where it sits in the menu, and whichever other dashboard areas write
into it.

Nothing there is a copy that someone has to keep up to date. The list resolves
the menu on every load from the same two sources as the public header (the links
in **Site → Navigation** and pages published with *show in navigation* ticked),
through the same function, so reordering the menu, renaming a page or publishing
one shows up on the next load. A menu link with no page behind it is called out
in red, which is how a typo in a link gets noticed before a visitor finds it.

**Photos & films** lists every place a picture can go on the website - the
photograph beside each page's title, each page's photo and film band, the panels
beside the words on the home and production pages, and both of those for every
service page - split into the ones still empty and the ones already filled, with
a link straight to the entry that fills each. Putting a picture on a page never
means working out which key names it. Beside the list sits the file library
itself: how much has been uploaded, how much of it nobody has described, and
which files are heavy enough to be slowing a page down.

**Traffic** breaks the same thirty days down by page, by where the visitor came
from, by device, and by hour of the day.

**Being found** checks every page, post and service for the things that decide
what a search engine shows - a missing description, one too short or too long to
be shown whole, a title that will be cut off, a page quietly asked to be ignored,
a post with no cover photograph, two pages sharing an address - scores what it
found, and links each one to where it is fixed. Under it, the schedule: what the
website will publish or take down on its own, and when.

**Health** reads six things that are true or not on the server itself: when the
last backup was taken, whether uploads are going somewhere a deploy will not
wipe, whether the nightly copy is signed, whether visits are being recorded,
whether more than one person can administer the site, and how many old addresses
are being forwarded.

**Tools** holds the jobs that are not editing anything: rebuild the website,
take a copy of it, download one, put one back, and export any collection as a
spreadsheet.

The figures come from `cms/dashboard/insights.ts`, which reads them all in one
pass and returns nothing on failure rather than breaking the screen; the panels
that draw them are in `cms/components/dashboard/`.

### Search, from anywhere

**⌘K** - Ctrl+K on Windows - opens a box on every screen of the dashboard, not
only the home one. Type part of a title and it searches sixteen collections at
once, returning only what the person typing is allowed to open. Type what you
want to do instead and the same box offers it: build a page, upload a file,
rebuild the website, back it up, export the enquiries. Arrow keys move, Enter
opens, Escape closes.

Destinations and jobs match in the browser, so the list answers every keystroke
with no request at all; content is searched through `/api/site-tools/search`,
which is one call rather than sixteen.

### Finding the words on a page

The palette above finds a document by its **name**. The bar across the top of
every dashboard screen finds a **sentence inside** one. Press `/`, or click it,
and type any word: it matches anywhere in the site's content, the way
`LIKE '%word%'` would, so `direct` finds every page, block, question, menu label
and rich-text paragraph that says "Director".

Each result names the collection, the document and the page it appears on, shows
the sentence with the keyword in full colour and the rest of it faded, and names
the field it is written in - "Photo & film band > Heading". Opening one goes
straight to that field, scrolls to it, flashes it and puts the cursor in it. `↑`
and `↓` move, `↵` opens, `esc` closes, and the `↗` beside a result opens that
page on the website instead.

Two words narrow the search rather than widening it: both have to appear in the
same document. Accents are ignored, and when nothing matches outright a second
pass forgives a typo, so `diretor` still finds the director.

The mechanics are in `cms/search/`. `extract.ts` walks a document alongside its
field configuration rather than walking the raw data, which is how a match
inside a block or an array row can name itself and how the result knows the
field's own id to link to. `match.ts` does the matching, ranking and snippets.
`engine.ts` keeps a short-lived snapshot of the site per signed-in user, built
with that user's own access rules, and asks `cms/live-urls.ts` where each
document appears so search and the "On the website" link always agree. Saving
anything drops the snapshot, so a word just changed is searchable immediately.

### How the dashboard itself is put together

Three conventions run through every section, so a screen an editor has not seen
before still reads the way the last one did.

**Lists show state, not words.** A publishing status, an enquiry's progress, a
review's approval and a page's kind are drawn as coloured pills
(`cms/components/cells/StateCell.tsx`), which decides the colour from the value:
the same word is always the same colour. A picture column shows the picture
(`ThumbCell`), a rating shows stars (`RatingCell`), and a collection whose
documents have no public address - enquiries, users, reviews, page views - is
spared the "Link" column rather than being given a row of dashes.

**Every row carries its own controls.** Beside the tick box, on every row of
every list, sit four small buttons: edit, publish, unpublish and delete
(`cms/components/RowActionsCell.tsx`). Taking a post off the website is one
click from the list rather than four screens. They are drawn in the same order
everywhere, and the two that change publication are dimmed - not removed - on a
collection that has no published state, so a row never changes shape from one
screen to the next. A review's **Approved** tick is what makes it public, so
those same two buttons drive it. Delete asks first.

**A document is a sheet.** The fields sit on a bounded white surface with one
rhythm of spacing, the save bar follows the page down so Save is always
reachable, and a form long enough to need sections gets tabs drawn as a
segmented control with a line of explanation under them. The styling is in
`app/(payload)/custom.css`, layered on Payload's own variables rather than
fighting its components.

**Colour means something.** Two palettes are kept apart. The six discipline
hues from the website's own media wheel identify things - which panel this is,
which figure that is, which group of the menu you are in - and carry no verdict.
Green, amber and red only ever say good, worth a look, and wrong, so a red edge
is always something to deal with and never decoration. Both are defined once as
tokens at the top of `custom.css`, and dark mode redefines the tokens rather than
the rules, which is why light and dark are one design and not two. The dashboard
home's own styling lives beside it in `app/(payload)/dashboard.css`.

### Social responsibility

**Content → Social responsibility** drives the section of the same name on
`/our-work`. Each entry has a title, an optional summary, an optional YouTube
link, and an optional photo album. Paste an ordinary YouTube watch URL and the
film is embedded; upload photographs with captions and they become an album.
An entry can be both, or either one on its own. Entries are ordered by the
**Order** field and only appear once **Published**.

### Social work

**Content → Social Work** drives the `/social-work` page, which is in the menu
between Our Work and Contact. One entry is one project, and everything about it
is uploaded here:

- a **title**, a **short description** for its card, and the full description of
  the work,
- an optional **cover photograph**,
- **photographs** - as many as you like, each with its own caption, dragged into
  the order they should read in,
- **videos** - as many YouTube links as you like, each with its own title and
  description, embedded as players on the page.

`/social-work` shows one **card** per entry — the cover photograph, the title,
the short description, and how much there is inside it ("18 photographs", "2
films") — laid out in a grid that goes from three across on a desktop to one on
a phone. Opening a card goes to that entry's own page at
`/social-work/<address>`, and that is where the full description, every
photograph and every film are. Before this the page printed every entry in full,
one under another, so reaching the fourth album meant scrolling past three
complete ones; now the whole of the work is visible at once and a visitor
chooses what to go into.

The address is generated from the title when you save, and can be overridden in
the sidebar. Entries that existed before addresses did were given one from their
title automatically. On an entry's page, clicking any photograph opens it full
size, with the arrows and the ← → keys stepping through the album and Escape
closing it.

Paste an ordinary watch or share link and the film is embedded; anything that is
not a YouTube link is refused when you save, rather than leaving an empty player
on the page. Entries are ordered by the **Order** field and appear only once
**Published**, and the band on the page hides itself entirely while nothing has
been published to it.

Because the site renders per request, a photograph added, replaced, or removed
in the dashboard is on the public page on the next load - there is nothing to
rebuild and no cache to clear.

Two more tools sit on the dashboard home: **Download backup**, which exports every
collection and global as one JSON file (administrators only), and the **search page**
at `/search`, which searches services, writing, offers, and pages.

### The Nepali face

The site is written in English and translated in the browser against the phrase
book in `lib/i18n/dictionary`. The one exception is the leadership band, whose
Nepali is written by hand in the dashboard rather than looked up — see above.
Anything else can be exempted the same way, by marking it `data-no-translate`.

While the site is being read in Nepali every face on the page swaps to a
Devanagari one, and that face is **Akriti**, fetched from the internet rather
than shipped with the site.

**Site → Appearance → Nepali type** holds both halves of that: the family name
and the stylesheet address it is fetched from. `lib/fonts.ts` holds the same two
values as the defaults, so clearing the fields in the dashboard falls back to
Noto Sans Devanagari, which is bundled.

One thing to know before changing them. The cuts of Akriti in general
circulation are *legacy* fonts: they draw Devanagari on to Latin code points
rather than on to the Devanagari block, so they carry no glyph for the Unicode
Nepali this site is written in. That is why Noto Sans Devanagari stays behind
Akriti in the stack rather than being dropped - Akriti is used for every
character it actually has, and anything it does not have is drawn by Noto
instead of coming out as empty boxes. Point the **Stylesheet address** at a
Unicode cut of Akriti and it will be used for everything, with no code change.

### Choosing where content is published

Every kind of content carries a **Where this appears** list in the sidebar of
its edit screen: posts, offers, reviews, questions, social responsibility
entries, team members, well-wishers, and the files in Content → Media. Tick the
pages the document belongs on and it is published there and nowhere else.

The list offers every page of the website, and it comes from `lib/site-map.ts`,
so a page added to the site is offered here on the next load with nothing to
update. `lib/placements.ts` holds the keys and the two rules that decide what a
page shows:

- **Leave the list empty and nothing changes.** The document appears wherever a
  band of its kind has been placed, which is how the site behaved before this
  existed.
- **A page nobody could have ticked shows everything.** A post's own page, a
  service page, or a page invented in Content → Website pages is not in the
  list, so bands there are not filtered.

A page shows a kind of content only if it carries the band that draws it - a
writing list, an offer list, a reviews band, a questions band, the team, the
well-wishers, or the social responsibility band. Ticking **About Us** on a post
publishes it to the about page; adding a **Writing list** section to that page
in Content → Website pages is what puts it on the screen. Photographs and films are the exception:
a file in Content → Media joins the "in pictures & film" band of every page it
is published to, which every built-in page already has.

Questions work the way they always did as well. A questions band takes the
questions published to the page it is on, plus the questions published to
whichever page the band names, so the four placements that existed before -
contact, services, training and production - keep feeding the bands that ask
for them.

Saving a document purges the pages it names as well as its own, so a tick shows
up on the live site straight away.

### Finding a page on the live website

Every document and every global carries an **On the website** link at the top
of the edit screen, next to Save. It shows the address the content will have -
`/posts/my-story`, `/services/documentary-film-production`, `/our-work` - opens
it in a new tab, and copies it to the clipboard. Where the content has no page
of its own, such as an enquiry or a review, it says where the content does
appear instead. A draft is flagged as one, so it is clear why the page is not
public yet. The mapping lives in `cms/live-urls.ts`; add a case there when a
new collection gets a public page.

Every list table has a matching **Link** column, so a page of posts or services
shows where each row went without opening any of them. A draft's address is
shown in amber, and content with no page of its own shows a dash.

The sidebar has **Dashboard** and **View website** above the menu, so the
overview and the public site are one click away from anywhere in the admin.

### How changes reach the website

Public pages are rendered per request (`export const dynamic = "force-dynamic"`),
so anything saved in the dashboard is live on the next page load - no deploy, no
cache to clear. Payload hooks in `cms/hooks/revalidate.ts` additionally purge
Next's router cache on every save.

This trades a prerendered response for content that is never stale, which is the
right way round for a site whose whole point is being editable. If the site ever
outgrows it, the fix is to cache the CMS reads and revalidate them by tag rather
than to prerender the pages again.

### Scheduling

Posts and offers have **Publish at** and **Unpublish at**. Content outside its
window is hidden from the website and from the sitemap, without anyone having to
remember to unpublish it. The announcement bar has the same start and end dates.

### Signing up and signing in

The dashboard login is at `/admin`. Under the login form there is a **Create one**
link to `/signup`.

- The **first** account created on a fresh database becomes an approved
  administrator and can sign in straight away.
- Every account after that is created as an **unapproved author** and cannot sign
  in until an administrator ticks **Approved** on it in Administration → Users.

Role and approval are locked to administrators at the field level, so a sign-up
cannot make itself an admin - not through the sign-up form and not by posting
directly to the REST API.

If you would rather nobody could register at all, set `create` back to `isAdmin`
in `cms/collections/Users.ts` and remove the `afterLogin` component from
`payload.config.ts`.

### Roles

| Role | Can do |
| --- | --- |
| **Administrator** | Everything, including branding and user management |
| **Editor** | All content, plus navigation, footer, homepage and site settings |
| **Author** | Create posts, and edit only their own |

Access rules live in `cms/access.ts` and are enforced by Payload on every entry
point (admin panel, REST and GraphQL alike).

## Local setup

You need a Postgres database. [Neon](https://neon.tech), [Supabase](https://supabase.com)
and Vercel Postgres all have a free tier that comfortably fits this site.

```bash
npm ci
cp .env.example .env      # then fill in PAYLOAD_SECRET and DATABASE_URI
npm run migrate           # create the database schema
SEED_ADMIN_PASSWORD='choose-a-strong-password' npm run seed
npm run dev
```

`npm run seed` loads the site's existing copy into the CMS, adds every page of
the website to **Content → Website pages**, and creates the first administrator, so the
dashboard opens pre-filled rather than blank. Re-running it overwrites seeded
globals, services, categories, and FAQs with repository content; existing users
and existing pages are preserved. Run it once during initial setup; avoid
running it after editors have customized that content.

`npm run sync:pages` adds the website's pages on their own, without touching
anything else - useful on a database that was seeded before pages were editable.
Add addresses to import only some of them (`npm run sync:pages -- /about`), or
`--restore` to put a page back to the copy it ships with.

Automatic development schema changes are disabled. Run `npm run migrate` before
starting development against a newly created database.

Open <http://localhost:3000/admin> and sign in with the seeded account.

## Deploying to Vercel

Set these environment variables in the Vercel project:

| Variable | Notes |
| --- | --- |
| `PAYLOAD_SECRET` | Any long random string (`openssl rand -base64 32`) |
| `DATABASE_URI` | Supabase transaction pooler (port 6543), with the database password percent-encoded. Session pooling can exhaust connections on Vercel |
| `DATABASE_SSL_CA` | Supabase root certificate from Database Settings → SSL Configuration. PEM text or escaped `\n` newlines; verifies the server certificate |
| `DATABASE_MIGRATION_URI` | Optional direct/session connection when `DATABASE_URI` uses the transaction pooler |
| `CLOUDINARY_URL` | `cloudinary://<api_key>:<api_secret>@<cloud_name>`, used for dashboard uploads |
| `BLOB_READ_WRITE_TOKEN` | Optional alternative when `CLOUDINARY_URL` is empty |
| `NEXT_PUBLIC_SERVER_URL` | The production URL |

Supabase API keys are not database passwords and are not needed by this CMS.
Payload handles dashboard authentication and accesses Postgres on the server.
The security migration enables row level security and removes Supabase browser
API permissions on the 70 CMS tables, including users, sessions, and enquiries.
Future migrations that add tables must apply the same restrictions.

Cloudinary stores originals and the thumbnail, card, and hero versions generated
by Payload. PDFs use raw storage. The Cloudinary cloud allowed by Next Image is
configured in `next.config.ts`. Cloudinary may require enabling PDF delivery in
the account's security settings. Server uploads on Vercel must fit within its
4.5 MB request limit, including multipart form overhead.

Keep credentials in an ignored `.env` locally and encrypted production variables
on Vercel. Do not share the production database with untrusted preview builds.
Create the first administrator with the seed before making the connected admin
dashboard public.

Vercel Functions run in Sydney (`syd1`) beside this Supabase project's database
(`ap-southeast-2`). Each function uses at most five pooled client connections,
leaving room for Payload's reserved connection, transactions, and lock checks.

`npm run build` runs pending migrations first, so a deploy applies schema
changes automatically. After changing anything in `cms/`, generate a migration
and commit it:

```bash
npm run migrate:create my_change
npm run generate:types
```

### Running a schema change by hand

`database/` holds the same changes as plain SQL, one file per change, for
pasting into the Supabase SQL editor when you would rather apply a change
yourself and see it land before anything ships. Each file is wrapped in a
transaction, is safe to run twice, and records itself in `payload_migrations`
so the next deploy does not repeat it. `database/README.md` explains the
convention; run the files in filename order.

## Troubleshooting

**`npm run migrate` (or `npm run build`) appears to hang.**
Running `npm run dev` pushes the schema directly and records a marker row named
`dev` in the `payload_migrations` table. `payload migrate` does not terminate
while that row is present. Production databases never have it, since `next dev`
is not run against them. If you share one database between `npm run dev` and
`npm run build` locally, clear the marker first:

```sql
DELETE FROM payload_migrations WHERE name = 'dev';
```

**`npm run check:pages` fails.**
The site and `lib/site-map.ts` disagree: a page was added or removed without
updating that list. The message names the paths. Fixing it is what keeps the
dashboard's **Website pages** panel describing the real website. The same check
compares the site map with `cms/live-urls.ts` — the two describe the website
from opposite ends, so a Page media entry has to lead back to the page whose
showcase band uses it.

**`npm run check:site` fails on navigation assertions.**
It verifies the site against the default navigation, so run it with the CMS at its
seeded state. Editing Navigation in the dashboard, or publishing a page with
"show in navigation" enabled, changes the menu the script asserts against.

**A page takes several seconds and shows the old, built-in content.**
The CMS is unreachable, so the site fell back to `app/(frontend)/_data/site.ts`
(see below). Check `DATABASE_URI` and that the database is reachable; the server
log will contain `[cms] could not connect, serving fallback content`.

## Content safety net

The site reads its content from Payload but falls back to the copy checked into
`app/(frontend)/_data/site.ts` whenever the CMS is unreachable or not yet
configured — see `lib/content.ts`. This means the website keeps rendering
exactly as it does today if the database is down or before it has been set up,
rather than showing an error page.

## Backups

A copy of everything in the dashboard is taken **once a day, automatically**,
and kept as a row in the same database. If something goes wrong, an
administrator opens yesterday's copy and puts the site back to it.

They live in **Administration → Backups**. Each row says when it was taken, why,
and what it holds; **Take a copy now** at the top of that list takes one on the
spot, which is worth doing before making a large change on purpose.

### Putting the site back

Open a backup and press **Put the site back to this**. It asks first, and then:

- every page, post, service, question and setting returns to how it was;
- anything deleted since comes back;
- anything added since is removed;
- **a copy of the site as it is right now is taken first**, so a restore made by
  mistake is undone by restoring that one. The panel links straight to it.

Three things are treated differently on purpose:

- **Enquiries are only ever added to.** A message that arrived after the copy
  was taken is real correspondence from a real person, and no restore deletes it.
- **Dashboard accounts are never written back.** Restoring them could resurrect
  a removed account, or lock out the person doing the restore. They are captured
  so the copy is complete, and skipped when it is put back.
- **Photographs and films are updated, never recreated.** The file itself lives
  at Cloudinary or Vercel Blob, not in this database, so a row recreated here
  would point at nothing. A backup protects the *record* of a photograph — its
  alt text, its captions, where it is used — not the image file. Deleting a file
  from Cloudinary is not something a restore can undo.

One limit worth knowing. A document that was deleted and is brought back by a
restore comes back with a **new reference number**, because Payload issues its
own. Nothing points at a post or a question by reference, so those are clean;
but if something did — a chosen photograph, say — it needs picking again. The
panel lists by name anything this applies to, so it is never a surprise.

Page views are deliberately not copied: they are append-only analytics that grow
without bound, there is no sense in which they can be wrong yesterday, and
copying them daily would bloat every backup.

### The schedule

`vercel.json` calls `/api/site-backup/run` at 20:15 UTC, which is 02:00 in
Kathmandu - the small hours, when nobody is editing and a copy is of a settled
site rather than a half-finished edit.

The schedule lives in `vercel.json` and nowhere else. Vercel checks that file
against its own schema and refuses to build if it carries a key the schema does
not know, so it cannot be annotated: anything worth saying about the schedule
belongs here instead.

Two environment variables govern it:

| Variable | What it does |
| --- | --- |
| `CRON_SECRET` | Vercel sends this as a bearer token. **Without it the daily copy is never taken** — the endpoint refuses every caller that is not a signed-in administrator, which is what stops anyone on the internet filling the table. Set it in the Vercel project. |
| `BACKUP_RETENTION_DAYS` | How many days to keep. Defaults to 30. The newest seven are always kept whatever their age. |

The scheduler can take a copy and nothing else. Restoring is an administrator
signed in to the dashboard, never a timer.

**Downloading one.** `/backup` hands an administrator a fresh copy of everything
as a JSON file, and **Download this copy** on a backup does the same for a stored
one. That is the way out to a file on your own machine — worth doing
occasionally, since a backup that lives only in the database it protects will not
help if the database itself is lost.

## Analytics

Page views are recorded by `app/(frontend)/track/route.ts` into the `pageviews`
collection: path, referring host and a coarse device class only. No cookies and
nothing that identifies a visitor, so no consent banner is required. The
dashboard reads them in `cms/dashboard/insights.ts`: ninety days in one query,
with every figure - today against yesterday, this week against last, the busiest
hour, the most-read pages, who is on the site this half hour - counted from it.

## Reviews from visitors

The `reviews` collection accepts public submissions (`POST /api/reviews`), but
`approved` and `featured` are locked to staff, so nothing reaches the website
until someone approves it in the dashboard.

## Pages

The navbar links six separate pages, in this order: `/`, `/services`, `/our-work`, `/social-work`, `/contact`, and `/about`. `/our-work` gathers the areas that are not in the menu themselves - `/production`, `/social-media-handling`, `/training`, `/research`, `/it`, `/advertisement`, `/right-sanchar` and the writing index at `/posts` keep their own pages, stay in the sitemap, and highlight **Our Work** in the header while a visitor is on them; `/offers` sits under **Services** the same way (see `navSections` in `lib/site-map.ts`, which `app/(frontend)/_data/site.ts` re-exports). The first six are the disciplines in the homepage wheel, and each petal links straight to its page. Each of the 16 services has a statically generated `/services/[slug]` page with its own scope, preparation guidance, workflow, FAQs, related services, and contact link.

The portfolio covers four production services, five social media services, five training programs, and two research and development services. The source is retained in `docs/Service_Portfolio_Overview.pdf`.

Each of those pages is a list of sections rather than a hand-written file. The
route (`app/(frontend)/about/page.tsx` and its siblings) names its address; the
sections come from the page's document in **Content → Website pages**, or, if
that document has been deleted, from `lib/page-defaults.ts`. `cms/sections.ts` defines what a
section can be and `app/(frontend)/_components/PageSections.tsx` draws it, so a
page reads the same whether its words come from the dashboard or from the code.

## Quality checks

```bash
npm run lint
npm run check:pages
npm run build
npx playwright install chromium
npm run check:site
```

`check:pages` needs no database, build or browser: it compares the routes on
disk with `lib/site-map.ts` and with the copy each page ships with in
`lib/page-defaults.ts`, and fails when they have drifted apart.
`check:site` runs it first.

The browser installation is only needed once per machine. `check:site` starts a production server on port 3100, checks all 30 pages at desktop and mobile widths, checks internal destinations and anchors, renders all social preview images, and exercises navigation history, the mobile menu, FAQs, and inquiry validation. Screenshots go to ignored `tmp/site-check/`. Set `CHECK_BASE_URL` to test an already running preview. No email is sent during checks.

## Photos and films

Every page a visitor reads can carry a photograph beside its title and a
photograph and a film lower down, and all of them are uploaded from the
dashboard. The **Photos & films** panel on the dashboard home lists every one of
them - each page's hero photograph and its "in pictures & film" band, the panels
beside the words on the home and production pages, and both of those for every
service page - says whether each has anything in it yet, and links straight to
the entry behind it. Open one, upload a photograph or a film, save, and the page
shows it on the next load. Nothing is copied into the repository and nothing is
redeployed.

**The website never shows an empty picture.** Every one of these places is drawn
only once something has been uploaded into it. Until then there is no panel, no
heading and no gap - the page is simply the page without it, and the heading
beside a missing hero photograph spans the full width. A band with one of its
two frames shows the one it has, on its own, rather than beside a rectangle
apologising for the other. (This used not to be true: pages carried blue
rectangles promising photographs "coming soon", and a blue emblem stood in for
the photograph beside every page title - which is an odd thing to show a visitor
on nine pages at once.)

Search and the sign-up form are the two pages with nowhere to put a picture.
They are working pages rather than pages anyone reads, and neither is in the
sitemap.

A film can be uploaded as a file, given as a YouTube link, or given as the
address of a film hosted elsewhere; the first of those that is filled in is what
the page plays. Use the YouTube link for anything longer than a short clip,
since the host caps how large a single upload can be - on Vercel a request
cannot carry more than 4.5 MB. [The media setup guide](docs/MEDIA-SETUP.md)
covers captions, transcripts, stills, and publication metadata.

There is no public upload feature: no form, no API, and no first-visitor setup
screen. Only a signed-in editor or administrator can add a file. A page is not
given a player or video structured data until a real film has been added to it.

Files in **Content → Media** published to a page through **Where this appears**
join that page's band underneath the two frames, and count towards whether the
band is drawn at all - so a photograph reaches a page without an editor having
to find something to attach it to.

## Contact behaviour

The contact form posts to `/enquiry`, which stores the message in the Enquiries
collection so the team can triage it in the dashboard. A hidden field catches
bots. Nothing is emailed automatically, and nothing is shared with a third
party; the form says so on the page.

## SEO and publication

- Every page has a unique title, description, canonical URL, Open Graph metadata, Twitter card metadata, and generated social preview image.
- Structured data describes the organization, website, breadcrumbs, actual services, and configured videos. No reviews, ratings, clients, or results are invented.
- `/sitemap.xml` lists all 23 pages. `/robots.txt` allows public content to be crawled and identifies the sitemap.
- Main content is rendered in the initial HTML. Unknown service URLs return 404. Images use responsive sizing, and videos load only when needed.
- The canonical origin comes from `business.website` in `app/_data/site.ts`, currently `https://najikkosathi.com`. Update it before deployment if the production domain changes.

After deployment, verify the production domain serves the new pages, submit the sitemap in your own Google Search Console property, and monitor indexing and search performance. A Git push updates the repository; deployment depends on the hosting integration configured for this repository.

SEO improves crawlability and understanding; it does not guarantee indexing or a #1 ranking. Continue publishing useful original material and approved project media. See Google's [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

## Project structure

The public website lives in the `app/(frontend)/` route group; the dashboard and its
API live in `app/(payload)/`.

- `app/(frontend)/_components/` - Shared navigation, footer, page sections, structured data, and inquiry form
- `app/(frontend)/_data/site.ts` - Business identity, contact information, and footer links; the navigation comes from `lib/site-map.ts`
- `app/(frontend)/_data/services.ts` - Fallback copy of the 16 services, used only when the CMS is unreachable
- `app/(frontend)/_lib/seo.ts` - Canonical URLs, metadata, and organization data
- `app/(frontend)/pages.css` - Interior page design and responsive styles
- `app/(frontend)/services/[slug]/page.tsx` - Generated service detail pages
- `app/(payload)/` - The admin dashboard and Payload REST/GraphQL routes
- `cms/` - Collections, globals, blocks, and access control
- `cms/dashboard/insights.ts` - Everything the dashboard home knows: traffic, what is waiting, the audits, the health checks
- `cms/components/dashboard/` - The dashboard home: its panels, the page studio, the command palette and the tabs
- `cms/endpoints/site-tools.ts` - One search across every collection, "rebuild the website", and the spreadsheet exports
- `cms/search/` - The keyword search behind the bar at the top of the dashboard: flattening documents, matching, and the snapshot it searches
- `app/(payload)/dashboard.css` - The dashboard home's own styling; `custom.css` retunes Payload itself
- `lib/site-map.ts` - The one list of the site's pages: menu order, sub-pages, and where each is edited
- `lib/page-defaults.ts` - The sections and copy each built-in page ships with, and what the dashboard imports
- `lib/page-content.ts` - Resolves an address to a page: the dashboard's version if there is one, the shipped copy otherwise
- `cms/sections.ts` - What a page section can be; `app/(frontend)/_components/PageSections.tsx` draws them
- `cms/site-pages.ts` - Importing the website's own pages into the dashboard, and restoring them
- `lib/content.ts` - CMS reads, with the static fallback
- `lib/backup.ts` - Taking a copy of everything and putting it back, and what "putting it back" means per collection
- `lib/fonts.ts` - The Nepali face: its family, where it is fetched from, and why Noto sits behind it
- `lib/leadership.ts` - The leadership message the carousel ships with, in English and in Nepali
- `lib/mission.ts` - The mission statement the front page ships with
- `lib/partners.ts` - The organizations named in the "We worked with" band
- `lib/page-media.ts` - How a Page media entry becomes the photograph or film a page renders
- `lib/placements.ts` - The pages content can be published to, and the rules deciding what a page shows
- `lib/services.ts` - One shape for a service, whether it came from the CMS or the fallback
- `proxy.ts` - Applies the redirects managed in the dashboard
- `migrations/` - Database migrations (commit these)
- `database/` - The same changes as plain SQL, one file per change, for running by hand in Supabase
- `payload.config.ts` - CMS configuration
- `scripts/check-pages.ts` - Fails when the routes and `lib/site-map.ts` disagree
- `scripts/check-site.mjs` - Production route and browser verification
- `Najik.docx` - Original business source document

## Image credit

Hero photograph: [Lipot Repaszky on Pexels](https://www.pexels.com/photo/himalayas-at-dawn-23022578/), used under the [Pexels license](https://www.pexels.com/license/). This landscape is illustrative and is not presented as company project photography.
