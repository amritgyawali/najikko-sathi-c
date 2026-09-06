# Adding photos and films

Every blue placeholder on the website - the "in pictures & film" band near the
foot of each page, and the panels on the home and production pages - is filled
from the dashboard. Uploading a photograph is a save, not a deployment: the page
shows it on the next request.

Visitors cannot upload anything. There is no public upload form, no API for it,
and no first-visitor setup screen. Only someone signed in to the dashboard with
an editor or administrator account can add or replace a file.

## Where to start

Open the dashboard at `/admin`. Under the traffic overview and the list of
website pages there is a panel called **Photos & films**. It lists every
placeholder on the site, says whether a photograph or a film has been added to
it yet, and links straight to the entry that fills it. Nothing here has to be
worked out by hand - if you can see a blue placeholder on a page, it has a row
in that panel.

The same entries live under **Content → Page media**, and each one names the
page it belongs to.

## Add a photograph

1. Open the placeholder's entry from the **Photos & films** panel.
2. Under **Photograph**, choose a file from the media library or upload a new
   one. Write alt text describing what is in the picture: screen readers and
   search engines read it.
3. A **caption** is optional. When it is filled in, it is printed under the
   photograph.
4. Save.

A landscape image around 1600 pixels wide works well. JPEG, WebP and PNG are all
fine, and the site serves resized versions automatically. Use only photographs
you have permission to publish.

## Add a film

A film can be given three ways, and the page uses the first one that is filled
in:

1. **Upload a film** - an MP4 or WebM file, played in the visitor's own browser.
2. **YouTube link** - an ordinary watch or share link. The film plays in
   YouTube's privacy-enhanced player, which sets no cookie until playback
   starts.
3. **Film address** - the address of a film hosted somewhere else.

Use the YouTube link for anything longer than a short clip. The hosting the site
runs on caps how large a single upload can be - on Vercel a request cannot carry
more than 4.5 MB - and a full documentary will not fit through it.

The rest of the fields are optional and describe the film for search engines and
for people who cannot watch it:

- **Still image** - shown before playback starts.
- **Title** and **description** - the description is printed under the player.
- **Transcript** - what is said in the film, as readable text. It appears under
  the player behind a "Read video transcript" toggle.
- **Duration** in ISO 8601 form, such as `PT1M30S`, and the **upload date**.

Until a film is added, the page shows the placeholder and no player, no broken
address, and no video metadata. Once one is added, the player carries controls,
the still image, the transcript, and structured data describing that real film.

## Which placeholder is which

Each page's band is keyed by the page: `home`, `about`, `services`, `our-work`,
`production`, `social-media-handling`, `training`, `research`, `it`,
`advertisement`, `right-sanchar` and `contact`. The two decorative panels are
`home-about` (beside the introduction on the front page) and `production-band`
(on the production page). A service page's band is keyed by the service's own
slug, such as `biography-videos`, and its entry is created with the service.

You should never have to type one of these keys. The **Photos & films** panel
links to the right entry for each placeholder, and every entry shows the address
of the page it appears on.

## Where the files are kept

Uploads go to Cloudinary when `CLOUDINARY_URL` is set, and to Vercel Blob when
`BLOB_READ_WRITE_TOKEN` is set instead. With neither, files are written beside
the application, which is fine for local work but not for a deployment that
rebuilds. Photographs are optimized by Next.js, which only accepts the storage
host named in `images.remotePatterns` in `next.config.ts`; that entry follows
`CLOUDINARY_URL`, so moving to another Cloudinary account needs no code change.
