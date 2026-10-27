# Neorons website

A static, international nonprofit website centred on suicide prevention, multilingual access and inclusion. No package installation, application server or build step is required.

## Pages

- `index.html`: international mission, programme overview, reach and supporters.
- `about.html`: organisation and existing team biographies.
- `programs.html`: multilingual AI phone service, campus and community programmes.
- `impact.html`: reported reach and fundraising.
- `india.html`: a searchable directory of 23 IITs and 22 IIMs, followed by all 11 original India programme records, including three marked as originally planned. Campus filters and progressive expansion use `js/campuses.js`; original record filters and details use `js/india.js`. All entries remain readable without JavaScript.
- `contact.html`, `media.html`, `profile.html`: contact, press and printable organisation profile.
- `privacy.html`, `safeguarding.html`, `accessibility.html`, `credits.html`: policies and photography attribution.

The visual design uses a floating navigation bar, textured colour panels, layered paper compositions, and short programme copy. Decorative movement includes entrance transitions, scroll reveals, subtle parallax, and a voice waveform. The homepage Pause motion control remembers the preference locally; system reduced-motion settings are respected, including changes while the page is open. Content and navigation remain available without JavaScript.

Navigation, footer, and page content are ordinary HTML and can be edited directly. Shared styles are in `css/styles.css`; `css/pages.css` carries the homepage’s paper panels, pastel colours, chapter links and document layouts through the inner pages. All pages include the same motion preference control. Shared navigation and old homepage fragment redirects are in `js/main.js`. The original programme/team source data is preserved in `js/events.js`; the public archive is static HTML. When correcting an event, update both its source data and its archive record.

## Run locally

```sh
python3 -m http.server 8080
```

Open http://localhost:8080. All fonts and images are served locally. The homepage photograph is illustrative; its source/licence and archive photograph credits are publicly linked. The existing team portraits are retained. No generated testimonials are displayed.

## Campus gallery and official logos

The campus gallery uses 45 distinct AI-generated illustrations of fictional adults in generic university rooms. Each image has a visible label and descriptive alternative text. Neither the scenes nor their programme examples document an actual event or a specific campus building. Do not remove those disclosures or add unsupported event dates, attendance figures or outcomes. Replace an illustration with an actual event photograph only when its campus attribution and publication permission are established.

Campus cards are static HTML in `india.html`, styled by `css/campuses.css`. `js/campuses.js` provides combined institution filters and name/city search, shows nine matching cards initially, supports keyboard use, and reveals directly linked campuses. To change a campus name, update its heading, search text, alternative text and official link together. Institution sources are recorded in `docs/campus-roster-provenance.txt` and `docs/campus-roster.json`.

The six supporter marks in `images/supporters/` are official downloaded artwork, with sources in `docs/supporter-logo-sources.md`. Preserve original colours, proportions and clear space. Keep Google, Amazon and Microsoft scoped to the phone service, and UNICEF, UNESCO and UNDP scoped to programmes; do not broaden the organisation-supplied support claims. Public image and logo attribution is on `credits.html`.

## Editorial facts

International figures and support relationships were supplied by Neorons:

- 500,000+ people reached across 80+ countries.
- 125,000 people reached through the multilingual conversational AI phone service.
- Inclusive programmes across all 23 IIT campuses and 22 IIM campuses.
- Over US$75,000 raised for suicide prevention.
- Google, Amazon and Microsoft support the phone service.
- UNICEF, UNESCO and UNDP support programmes.

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
node --check js/campuses.js
```

Check the homepage, small-screen menu, programme links, campus search and filters, direct campus links, India category filters and expandable records after updates. Legacy homepage event URLs redirect to the India archive. No analytics, embedded maps or third-party scripts are used in the redesigned pages.
