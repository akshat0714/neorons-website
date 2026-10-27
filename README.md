# Neorons website

A static, international nonprofit website centred on suicide prevention, multilingual access and inclusion. No package installation, application server or build step is required.

## Pages

- `index.html`: international mission, programme overview, reach and prominent supporter logos; programme photography appears only on Impact.
- `about.html`: organisation and existing team biographies.
- `programs.html`: multilingual AI phone service, interactive conceptual research diagrams, campus and community programmes.
- `fellowship.html`: planned six-week virtual fellowship, six areas of support, a proposed weekly journey, with details coming soon; no FAQ or borrowed alumni claims.
- `impact.html`: international reach, five programme photo stories with inclusion outcomes, all 23 IIT and 22 IIM logos, and fundraising.
- `india.html`: all 11 original India programme records, including three marked as originally planned. Expandable records and filters work with `js/india.js`; the records are readable without JavaScript.
- `contact.html`, `media.html`, `profile.html`: contact, press and printable organisation profile.
- `privacy.html`, `safeguarding.html`, `accessibility.html`, `credits.html`: policies and photography attribution.

The visual design uses a floating navigation bar, textured colour panels, layered paper compositions, and short programme copy. Decorative movement includes entrance transitions, scroll reveals, subtle parallax, and a voice waveform. The homepage Pause motion control remembers the preference locally; system reduced-motion settings are respected, including changes while the page is open. Content and navigation remain available without JavaScript.

Navigation, footer, and page content are ordinary HTML and can be edited directly. Shared styles are in `css/styles.css`; `css/pages.css` carries the homepage’s paper panels, pastel colours, chapter links and document layouts through the inner pages. All pages include the same motion preference control. Shared navigation and old homepage fragment redirects are in `js/main.js`. The original programme/team source data is preserved in `js/events.js`; the public archive is static HTML. When correcting an event, update both its source data and its archive record.

## Run locally

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. All fonts and images are served locally. The five programme photos were supplied by Neorons; their provenance is recorded in `docs/impact-photo-sources.md`. Archive illustrative photographs retain public source/licence credits. The existing team portraits are retained. No generated testimonials are displayed.

Official logos are self-hosted in `images/supporters/`; their published sources are recorded in `docs/supporter-logo-sources.md` and `credits.html`. Preserve their colours and proportions. The AI campus gallery has been removed; the India page contains the earlier 11 programme records. Fellowship styling is in `css/fellowship.css`. Programme dates and application details remain pending; no fellowship interest or application link is published. Impact photo stories use `css/editorial.css`; the homepage links to them without displaying photos. Large supporter rows use `css/credibility.css`. Programme figures describe overall work, not individual people or sessions pictured.

## Editorial facts

International figures and support relationships were supplied by Neorons:

- 500,000+ people reached across 80+ countries.
- 125,000 people reached through the multilingual conversational AI phone service.
- Inclusive programmes across all 23 IIT campuses and 22 IIM campuses.
- Over US$75,000 raised for suicide prevention.
- Google, Amazon, Microsoft, OpenAI and Meta are listed as organisations that trust the phone service.
- UNICEF, UNDP, UNFPA and the Government of India support programmes and awareness work.

The owner confirmed on 27 October 2026 that the additional inclusion results belong to Neorons: 50,000+ people with disabilities impacted, 2.3 million+ accessible pages, $150,000+ collective earnings, 18,000+ jobs accessed, 70+ nonprofit partners, and work across 15 Indian states. Six highlights cover Jyotirgamya training, NClude information services (14,000+ users), career discovery (105,000+ sessions), employer events (1,000+ participants and 100+ direct placements), accessible STEM materials ($100,000+ collective earnings), and job access (7,500+ users). These are distinct, potentially overlapping measures; earnings and fundraising are not combined.

The phone-service reach is not added to the overall reach. Reach figures are not presented as clinical outcomes or lives saved. No phone number is published, as requested. Donation links and buttons are hidden at the owner's request; there is currently no payment flow. General enquiries use `neoronsai@gmail.com` and open an email application.

## Deployment

`neorons.com` currently returns nginx server headers; the separate `neorons.vercel.app` deployment uses Vercel. A push to GitHub does not by itself prove that the GCP VM has updated.

The public site is the repository root's HTML and assets. Existing `.html` URLs work with the supplied nginx `try_files` configuration. No nginx, TLS, DNS or credential changes are required for this redesign.

See [`deploy/gcp/UPDATE.md`](deploy/gcp/UPDATE.md) for backup, update, verification and rollback instructions for the existing GCP VM. The older `deploy/gcp/DEPLOY.md` describes alternative hosting architectures; it is not necessary for a content update.

Create an upload-ready archive with:

```sh
bash scripts/package-release.sh /absolute/path/neorons-website.zip
```

The archive contains public HTML, CSS, JavaScript, fonts, images, the manifest and crawler files. It excludes Git metadata, deployment configuration, scripts, source templates, and credentials. Extract its contents into the verified existing web root after taking a backup.

## Checks

```sh
python3 scripts/check-site.py
node --check js/main.js
node --check js/india.js
```

Check the homepage, small-screen menu, programme links, India category filters and expandable records after updates. Legacy homepage event URLs redirect to the India archive. No analytics, embedded maps or third-party scripts are used in the redesigned pages.

## Technology diagrams and campus marks

`css/technology.css` and `js/technology.js` provide a conceptual voice-AI pipeline and transformer schematic, with primary research citations, keyboard-accessible stage controls and text alternatives. They do not assert Neorons’ actual model providers, language count, safety systems, architecture or clinical outcomes. Patent and Westly Prize claims await a patent identifier and official finalist announcement; neither is published.

The Impact campus directory uses `css/campus-network.css` with 45 official institution marks. Provenance is in `docs/campus-logos.json`, `docs/iit-logo-sources.md` and `docs/iim-logo-sources.md`. These identify programme campuses, not additional sponsors.
