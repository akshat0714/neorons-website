# Neorons website

A static, international nonprofit website centred on suicide prevention, multilingual access and inclusion. No package installation or application server is required. A small Node script prepares the public deployment directory.

## Pages

- `index.html`: mission, programme overview, reach and supporter logos
- `about.html`: organisation mission and priorities
- `mission.html`: community perspectives, interactive globe, Indigenous rights resources and conceptual phone-service demonstration
- `fellowship.html`: planned fellowship, with dates and applications pending
- `impact.html`: organisational results, official legislative resources and supporter logos
- `programs.html`, `india.html`: legacy links redirect to Mission
- `contact.html`, `media.html`, `profile.html`: contact, press and printable organisation profile
- `privacy.html`, `safeguarding.html`, `accessibility.html`, `credits.html`: policies and logo attribution

The Impact page includes five I-Stem programme photographs and a supplied group photograph. Individual profiles and United Nations advocacy photographs remain removed. Organisation and partner logos remain. Content and navigation remain available without JavaScript; motion controls respect reduced-motion preferences.

## Run locally

```sh
node scripts/build-public.mjs
python3 -m http.server 8080 --directory public-site
```

The build copies only public pages and assets into `public-site/`. Repository documentation, deployment configuration and development scripts are excluded. Vercel publishes this directory. For a GCP upload archive, use `bash scripts/package-release.sh /absolute/path/neorons-website.zip`.

Supporter logos are self-hosted in `images/supporters/`; sources appear in `credits.html`. Preserve their colours and proportions. Supporter rows appear only on Home and Impact.

## Editorial facts

International figures and support relationships were supplied by Neorons:

- 500,000+ people reached across 80+ countries.
- 125,000 people reached through the multilingual conversational AI phone service.
- Inclusive programmes across all 23 IIT campuses and 22 IIM campuses.
- Over US$15,000 raised for suicide prevention.
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
