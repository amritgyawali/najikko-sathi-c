# Owner media setup

The website has labeled photo and video placeholders on all seven main pages and all 16 service detail pages. No visitor can upload files. There is no upload form, API, public setup screen, or first-visitor claim mechanism.

Only someone with write access to the GitHub repository can replace these placeholders. Adding media is a repository edit followed by a deployment. You can complete this setup once and leave the site as a static media presentation afterward.

## Add photos

1. Add the approved photo to `public/media/` using GitHub's **Add file → Upload files** or your local checkout. Use a descriptive filename, such as `documentary-interview.webp`.
2. Find the corresponding key in `app/_data/media.ts`.
3. Add the image configuration. Write accurate alt text and a caption describing the actual photo:

```ts
"documentary-film-production": {
  image: {
    src: "/media/documentary-interview.webp",
    alt: "Describe the people, setting, and activity visible in your photo",
    caption: "An accurate caption for this approved photograph.",
  },
},
```

Use a landscape image around 1600 pixels wide where possible. WebP or JPEG works well. Remove private metadata and use only photos you have permission to publish. Next.js serves responsive optimized image sizes.

## Add videos

Upload an MP4, a landscape poster image, and a WebVTT English captions file to `public/media/`, then add:

```ts
"documentary-film-production": {
  video: {
    src: "/media/documentary-introduction.mp4",
    poster: "/media/documentary-poster.jpg",
    title: "The actual title of your film",
    description: "An accurate description of the published film.",
    captions: "/media/documentary-introduction.en.vtt",
    transcript: "The complete spoken content of the film, written as readable text.",
    uploadDate: "2026-09-05T00:00:00+05:45",
    duration: "PT1M30S",
  },
},
```

Replace the example date and duration with the video's real publication date and duration. An image and a video can be configured under the same key. Add accurate English captions/transcripts or adapt the track language in the component when publishing another language. Use H.264 video and AAC audio in the MP4 for broad playback support. Keep repository videos small; large films should use your own trusted media hosting, with absolute HTTPS URLs in the configuration. Remote photographs need their exact host added to `images.remotePatterns` in `next.config.ts`; local `/media/` images need no configuration.

Until a video is configured, the page has no player, broken media URL, or VideoObject schema. Once configured, the player includes controls, a poster, captions, a readable transcript, and metadata describing that real film. Video loading uses `preload="none"`.

## Page keys

The main keys are `home`, `about`, `services`, `production`, `training`, `right-sanchar`, and `contact`. Service keys match the URL after `/services/`, such as `biography-videos` or `source-research`. All available keys already exist in the configuration.

## Publish and finish

Run `npm run lint`, `npm run build`, and `npm run check:site`, then commit and push the media and configuration together. Deploy the resulting commit through your hosting provider. After this initial setup, no ongoing upload service is needed. Repository administrators retain their normal ability to make future code changes.
