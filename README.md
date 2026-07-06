# Neorons — Website

Static website for Neorons, a social-impact organization advancing STEM education,
mental-health awareness, and inclusion for young people across India.

## Structure

- `index.html` — page structure and copy for every section except events
- `css/styles.css` — full design system (colors, type, layout, modal, responsive),
  modeled on unesco.org: flat white surfaces, institutional blue, photo-led cards
- `js/events.js` — **all event data lives here.** Edit this file to add, correct,
  or remove events; the event cards, modal details, and "Where We Work" district
  grid all render from it automatically.
- `js/main.js` — rendering, filters, event modal, mobile nav
- `images/` — hero and event card photos (3:2 landscape works best, ≥1200px wide)

## Photos

The current photos are **freely-licensed placeholders** (Wikimedia Commons /
Flickr, CC BY / CC0) sourced to match each event's theme — replace them with your
own event photography by overwriting the files in `images/` (keep the filenames,
or update the `image` field per event in `js/events.js`).

Each event's `credit` field renders an attribution caption in the event modal and
in the footer. CC BY images **require** attribution — keep the credits until you
replace those photos; when you use your own photos, set `credit: null`.

## Motion design

Hero entrance, staggered scroll reveals, stat count-ups, filter transitions,
and modal enter/exit animations are all driven by `js/main.js` + the reveal
system in `css/styles.css`. Two guarantees:

- **`prefers-reduced-motion` disables everything** (checked live, not cached).
- **No JavaScript, no hiding**: reveal styles apply only under `html.js`, a
  class added by `js/main.js` itself — if scripts fail or are disabled, the
  full page renders statically.

One event can carry `featured: true` in `js/events.js` to render as the
full-width spotlight card at the top of the grid.

Note: the quote in the "Voices from our programmes" band is illustrative
placeholder copy — replace it with a real participant quote (with permission).

## Editing events

Each event in `js/events.js` has a district, state, date, card blurb, full
description paragraphs, highlight bullets, and stat chips. Deep links work out of
the box: `index.html#event-<id>` opens that event's detail modal directly.

## Running locally

No build step. Either open `index.html` directly, or serve the folder:

```sh
python3 -m http.server 8080
```

## Deploying

Any static host works as-is: GitHub Pages, Netlify, Vercel, Cloudflare Pages.
Point the host at the repository root.
