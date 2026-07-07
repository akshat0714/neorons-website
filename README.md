# Neorons Website

Static website for Neorons, a social-impact organisation advancing STEM education,
mental-health awareness, and inclusion for young people across India.

## File structure

```
/
├── index.html              main page (hero, about, events, stats, contact)
├── 404.html                custom not-found page
├── safeguarding.html       safeguarding policy
├── privacy.html            privacy policy
├── accessibility.html      accessibility statement
├── media.html              media kit / press
├── profile.html            team & organisation profile
│
├── css/
│   └── styles.css          full design system (colours, type, layout, modal, responsive)
│
├── js/
│   ├── events.js           all event data; edit here to add/update/remove events
│   └── main.js             rendering, filters, event modal, mobile nav, animations
│
├── fonts/                  self-hosted Archivo + Source Sans 3 (woff2, preloaded)
│   ├── archivo-v25-latin-500.woff2
│   ├── archivo-v25-latin-600.woff2
│   ├── archivo-v25-latin-700.woff2
│   ├── archivo-v25-latin-800.woff2
│   ├── source-sans-3-v19-latin-600.woff2
│   ├── source-sans-3-v19-latin-700.woff2
│   ├── source-sans-3-v19-latin-italic.woff2
│   └── source-sans-3-v19-latin-regular.woff2
│
├── images/
│   ├── hero.jpg            hero banner (>= 1200 px wide, 3:2 preferred)
│   ├── *.jpg               one image per event (filename matches events.js)
│   └── og-template.html    screenshot this in Chrome DevTools to produce og-image.png
│
├── scripts/
│   ├── prepare.sh          creates webp variants, strips EXIF, compresses fonts
│   └── strip-exif.sh       standalone EXIF removal helper
│
├── _headers                Netlify / Cloudflare Pages security + cache headers
├── _redirects              Netlify 404 fallback rule
├── vercel.json             Vercel security headers + 404 rewrite
├── sitemap.xml             URL list for the live site
├── robots.txt              crawl rules and sitemap pointer
└── site.webmanifest        PWA manifest (name, theme colour)
```

## Running locally

No build step. Open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Interactive map

The "Where we work" section renders an interactive map of India (zoom, pan,
fly-to-marker, and a docked popover per event). Event positions come from the
`coords: { lat, lon }` field in `js/events.js`; the outline and calibration
live in `js/india-map.js`.

The outline derives from Wikimedia Commons "India location map3.svg"
(Uwe Dedering and contributors, CC BY-SA 3.0). Attribution renders in the
footer automatically and must be kept while this outline is used; the
share-alike terms apply to the map artwork itself.

## Editing events

All event data lives in `js/events.js`. Each event object has:

| Field | Notes |
|---|---|
| `id` | URL-safe slug used for deep links (`index.html#event-<id>`) |
| `title`, `district`, `state`, `date` | Card header fields |
| `blurb` | Short card description |
| `description` | Array of paragraph strings for the modal body |
| `highlights` | Bullet-point list in the modal |
| `stats` | Chip array (e.g. `["120 students", "2 days"]`) |
| `image` | Filename inside `images/` |
| `credit` | Photo attribution string; set `null` when using your own photos |
| `featured` | `true` on at most one event to render a full-width spotlight card |
| `partners` | Array of partner names |
| `outcomes` | Array of outcome strings |
| `reflections` | Array of reflection strings |

The event grid, district filter, "Where We Work" section, and deep-link modal all
render automatically from this data, so no HTML edits are needed.

## Team members and testimonials

Team members are declared in the `TEAM` array in `js/main.js`.
Each entry has `name`, `role`, `bio`, and `photo` (filename in `images/`).

Testimonials are in the `TESTIMONIALS` array in `js/main.js`.
Each entry has `quote`, `name`, `role`, and optionally `event` (event id for linking).

## Running the preparation script

The `scripts/prepare.sh` script converts images to WebP, strips EXIF data, and
subsets fonts. Requires `cwebp`, `exiftool`, and `pyftsubset` (from fonttools):

```sh
cd scripts
bash prepare.sh
```

## Motion design

Hero entrance, staggered scroll reveals, stat count-ups, filter transitions,
and modal enter/exit animations are driven by `js/main.js` plus the reveal
system in `css/styles.css`. Two guarantees:

- **`prefers-reduced-motion` disables everything** (checked live, not cached).
- **No JavaScript, no hiding**: reveal styles apply only under `html.js`, a
  class added by `js/main.js`. If scripts fail or are disabled, the full page
  renders statically.

## Photos

The current photos are **freely-licensed placeholders** (Wikimedia Commons /
Flickr, CC BY / CC0). Replace them with real event photography by overwriting
the files in `images/` (keep the filenames, or update the `image` field per
event in `js/events.js`).

Each event's `credit` field renders an attribution caption in the modal and
footer. CC BY images **require** attribution, so keep the credits until you
replace those photos. When you use your own photos, set `credit: null`.

## Deployment

The site is live at <https://akshat0714.github.io/neorons-website/>, hosted on
GitHub Pages. It auto-deploys from the `main` branch: push to `main` and GitHub
Pages republishes the repository root. There is no build command and no output
directory.

The repository also carries ready-made config for other static hosts:

| Host | Config file |
|---|---|
| Netlify / Cloudflare Pages | `_headers`, `_redirects` |
| Vercel | `vercel.json` |

Note that GitHub Pages does not apply the custom security and cache headers
defined in `_headers` or `vercel.json`; those take effect only on hosts that
read them.

## OG image

`images/og-template.html` is a 1200 x 630 HTML template for the Open Graph image.
To generate `og-image.png`:

1. Open `images/og-template.html` in Chrome.
2. Open DevTools > Device toolbar > set dimensions to 1200 x 630.
3. Run: `screenshot --fullpage` or use DevTools > More tools > Rendering > Capture screenshot.
4. Save as `images/og-image.png`.

## TODOs before launch

- [ ] **OG image**: screenshot `images/og-template.html` at 1200 x 630, save as `images/og-image.png`
- [ ] **Apple touch icon**: generate `images/apple-touch-icon.png` (180 x 180 px) from the brand SVG, then re-add the icon entry to `site.webmanifest`
- [ ] **og:url + canonical**: add `<meta property="og:url">` and `<link rel="canonical">` pointing at `https://akshat0714.github.io/neorons-website/` in all HTML files
- [ ] **Contact form**: add Formspree (or equivalent) endpoint to the contact `<form>` in `index.html`
- [ ] **Real photos**: replace placeholder images in `images/` with actual event photography; set `credit: null` in `js/events.js`
- [ ] **Real testimonials**: replace placeholder quotes in `js/main.js` with real participant quotes (obtain permission)
- [ ] **Team photos**: add real headshots to `images/` and update the `TEAM` array in `js/main.js`
- [ ] **Analytics**: add privacy-respecting analytics (e.g. Plausible) if desired; update CSP in `_headers` and `vercel.json` accordingly
